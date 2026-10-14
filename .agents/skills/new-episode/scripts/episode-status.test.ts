import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { episodeBranches, readEpisodeStatus, unfinishedReminder, type Gh } from './episode-status.ts';

/*
 * The run status reader against a real temp worktree and a fake gh (an adapter at the seam): the
 * Episode's job states from pipeline.yml, events.jsonl and the gates, and the SessionStart summary of them.
 */

const SLUG = 'ep';
const NOW = '2026-10-14T10:00:00Z';
const TRACE = 'a'.repeat(32);
const SPEC_ISSUE = 41;
const APPROVED_BRIEF =
  '---\ntype: brief\ngenerated:\n  by: claude-code/opus-5.5\n  at: 2026-10-12T09:00:00Z\nverified:\n  - by: human:han\n    at: 2026-10-12T09:30:00Z\n---\n';
const PIPELINE = (gate: string): string => `status: approved\njobs:\n  - { id: brief-grill, needs: []${gate} }\n  - { id: write, needs: [brief-grill] }\n`;
const BRIEF_GATE = ', gate: human, outputs: [docs/episodes/<slug>/brief.md]';
const LABEL_GATE = ', gate: human';
const jsonl = (...lines: object[]): string => lines.map((l) => JSON.stringify(l)).join('\n') + '\n';
const jobLog = (status?: string): string =>
  jsonl(
    { kind: 'start-run', trace_id: TRACE, span_id: 'run', seq: 1, t: '2026-10-14T09:00:00Z', run_id: 'run' },
    { kind: 'start', trace_id: TRACE, span_id: 'job', parent_span_id: 'run', seq: 2, t: '2026-10-14T09:01:00Z', type: 'job', name: 'brief-grill', job: 'brief-grill' },
    ...(status === undefined ? [] : [{ kind: 'end', trace_id: TRACE, span_id: 'job', seq: 3, t: '2026-10-14T09:05:00Z', status }]),
  );

const roots: string[] = [];
function worktree(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'episode-status-'));
  roots.push(root);
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const failingGh: Gh = () => {
  throw new Error('gh: not logged in');
};
/** A gh that answers the spec-issue lookup and its sub-issues. */
const fakeGh =
  (spec: { number: number }[], subIssues: unknown[]): Gh =>
  (args) =>
    JSON.stringify(args[0] === 'issue' ? spec : subIssues);

const statusOf = (root: string, gh: Gh) => {
  const result = readEpisodeStatus(root, SLUG, { now: NOW, gh });
  if (result.kind !== 'ok') throw new Error(result.kind);
  return result.status;
};
const states = (root: string, gh: Gh): string[] => statusOf(root, gh).jobs.map(({ state }) => state);
const files = (gate: string, extra: Record<string, string> = {}) => ({
  'docs/episodes/ep/pipeline.yml': PIPELINE(gate),
  'docs/episodes/ep/events.jsonl': jobLog('ok'),
  ...extra,
});

describe('readEpisodeStatus', () => {
  it('reads job states from the pipeline and the Episode log', () => {
    expect(states(worktree(files('')), failingGh)).toEqual(['done', 'ready']);
  });

  it('says why there is no status when the pipeline is missing or has no jobs', () => {
    const missing = readEpisodeStatus(worktree({}), SLUG, { now: NOW, gh: failingGh });
    const empty = readEpisodeStatus(worktree({ 'docs/episodes/ep/pipeline.yml': 'status: approved\n' }), SLUG, { now: NOW, gh: failingGh });
    expect([missing, empty]).toEqual([
      { kind: 'no-pipeline', file: 'docs/episodes/ep/pipeline.yml' },
      { kind: 'no-jobs', file: 'docs/episodes/ep/pipeline.yml' },
    ]);
  });

  it('reports log lines that do not parse, prefixed with the file', () => {
    const root = worktree({ 'docs/episodes/ep/pipeline.yml': PIPELINE(''), 'docs/episodes/ep/events.jsonl': 'not json\n' });
    const result = readEpisodeStatus(root, SLUG, { now: NOW, gh: failingGh });
    expect(result.kind === 'ok' && result.errors.map((e) => e.includes('events.jsonl'))).toEqual([true]);
  });

  it('reads a gated output at its path with the slug filled in', () => {
    const open = worktree(files(BRIEF_GATE, { 'docs/episodes/ep/brief.md': APPROVED_BRIEF }));
    const shut = worktree(files(BRIEF_GATE));
    expect([states(open, failingGh), states(shut, failingGh)]).toEqual([['done', 'ready'], ['gate', 'waiting']]);
  });

  it("opens a label gate once the spec issue's sub-issues have left triage", () => {
    const tickets = [{ state: 'open', labels: [{ name: 'ready-for-agent' }] }];
    expect(states(worktree(files(LABEL_GATE)), fakeGh([{ number: SPEC_ISSUE }], tickets))).toEqual(['done', 'ready']);
  });

  it('keeps a label gate shut when gh fails, answers garbage, finds no spec issue, or a ticket is in triage', () => {
    const root = worktree(files(LABEL_GATE));
    const garbage: Gh = () => 'not json';
    const triage = [{ state: 'open', labels: [{ name: 'needs-triage' }] }];
    const worlds = [failingGh, garbage, fakeGh([], triage), fakeGh([{ number: SPEC_ISSUE }], triage)];
    expect(worlds.map((gh) => states(root, gh)[0])).toEqual(['gate', 'gate', 'gate', 'gate']);
  });

  it("asks gh for the spec issue by the Episode's label, then for that issue's sub-issues", () => {
    const calls: string[][] = [];
    const recording: Gh = (args) => {
      calls.push([...args]);
      return JSON.stringify(args[0] === 'issue' ? [{ number: SPEC_ISSUE }] : []);
    };
    states(worktree(files(LABEL_GATE)), recording);
    expect(calls).toEqual([
      ['issue', 'list', '--label', 'episode:ep', '--state', 'all', '--json', 'number'],
      ['api', 'repos/{owner}/{repo}/issues/41/sub_issues'],
    ]);
  });

  it('applies liveness from the worktree marker: an open job span runs only while the marker names its Run', () => {
    const marker = JSON.stringify({ log: 'docs/episodes/ep/events.jsonl', session_id: 's', trace_id: TRACE, job_span_id: 'job' });
    const base = { 'docs/episodes/ep/pipeline.yml': PIPELINE(''), 'docs/episodes/ep/events.jsonl': jobLog() };
    const live = worktree({ ...base, '.scratch/active-run': marker });
    const dead = worktree(base);
    expect([states(live, failingGh)[0], states(dead, failingGh)[0]]).toEqual(['running', 'ready']);
  });
});

describe('unfinishedReminder', () => {
  it('stays silent with no Episode worktree or when every job is done', () => {
    const done = statusOf(worktree({ 'docs/episodes/ep/pipeline.yml': 'status: approved\njobs:\n  - { id: only, needs: [] }\n', 'docs/episodes/ep/events.jsonl': jobLog('ok').replaceAll('brief-grill', 'only') }), failingGh);
    expect([unfinishedReminder([]), unfinishedReminder([{ slug: 'a', status: done }])]).toEqual([null, null]);
  });

  it('names each Episode with a job not done and the status command', () => {
    const open = statusOf(worktree(files('')), failingGh);
    const done = { jobs: [{ id: 'x', state: 'done' as const }], running: [], problems: [], waiting: [] };
    const text = unfinishedReminder([{ slug: 'a', status: open }, { slug: 'c', status: done }]);
    expect(text).toContain('npm run episode:status -- a');
    expect(text).not.toContain('-- c');
    expect(text).toContain('todo list');
  });
});

describe('episodeBranches', () => {
  const porcelain = [
    'worktree /repo',
    'branch refs/heads/main',
    '',
    'worktree /repo/.worktrees/episode-a',
    'branch refs/heads/episode/a',
    '',
    'worktree /repo/.worktrees/episode-a--write-research-x',
    'branch refs/heads/episode/a--write-research-x',
    '',
    'worktree /repo/.worktrees/detached',
    'detached',
    '',
  ].join('\n');

  it('lists the integration worktrees, not job worktrees nor other branches', () => {
    expect(episodeBranches(porcelain)).toEqual([{ slug: 'a', dir: '/repo/.worktrees/episode-a' }]);
  });
});
