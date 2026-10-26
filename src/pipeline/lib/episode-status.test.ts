import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readEpisodeStatus } from './episode-status.ts';

/*
 * The run status reader against a real temp worktree: the Episode's job states from pipeline.yml,
 * events.jsonl and the gates, and the SessionStart summary of them.
 */

const SLUG = 'ep';
const NOW = '2026-10-14T10:00:00Z';
const TRACE = 'a'.repeat(32);
const APPROVED_BRIEF =
  '---\ntype: brief\ngenerated:\n  by: claude-code/opus-5.5\n  at: 2026-10-12T09:00:00Z\nverified:\n  - by: human:han\n    at: 2026-10-12T09:30:00Z\n---\n';
const PIPELINE = (gate: string): string =>
  `status: approved\njobs:\n  - { id: brief-grill, needs: []${gate} }\n  - { id: write, needs: [brief-grill] }\n`;
const BRIEF_GATE = ', gate: human, outputs: [docs/episodes/<slug>/brief.md]';
const jsonl = (...lines: object[]): string => lines.map((l) => JSON.stringify(l)).join('\n') + '\n';
const jobLog = (status?: string): string =>
  jsonl(
    { kind: 'start-run', trace_id: TRACE, span_id: 'run', seq: 1, t: '2026-10-14T09:00:00Z', run_id: 'run' },
    {
      kind: 'start',
      trace_id: TRACE,
      span_id: 'job',
      parent_span_id: 'run',
      seq: 2,
      t: '2026-10-14T09:01:00Z',
      type: 'job',
      name: 'brief-grill',
      job: 'brief-grill',
    },
    ...(status === undefined
      ? []
      : [{ kind: 'end', trace_id: TRACE, span_id: 'job', seq: 3, t: '2026-10-14T09:05:00Z', status }]),
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

const statusOf = (root: string) => {
  const result = readEpisodeStatus(root, SLUG, { now: NOW });
  if (result.kind !== 'ok') throw new Error(result.kind);
  return result.status;
};
const states = (root: string): string[] => statusOf(root).jobs.map(({ state }) => state);
const files = (gate: string, extra: Record<string, string> = {}) => ({
  'docs/episodes/ep/pipeline.yml': PIPELINE(gate),
  'docs/episodes/ep/events.jsonl': jobLog('ok'),
  ...extra,
});
describe('success cases', () => {
  describe('readEpisodeStatus', () => {
    it('reads job states from the pipeline and the Episode log', () => {
      // ARRANGE
      // ACT
      const actual = states(worktree(files('')));
      // ASSERT
      expect(actual).toEqual(['done', 'ready']);
    });

    it('reads a gated output at its path with the slug filled in', () => {
      // ARRANGE
      const open = worktree(files(BRIEF_GATE, { 'docs/episodes/ep/brief.md': APPROVED_BRIEF }));
      const shut = worktree(files(BRIEF_GATE));
      // ACT
      const actual = [states(open), states(shut)];
      // ASSERT
      expect(actual).toEqual([
        ['done', 'ready'],
        ['gate', 'waiting'],
      ]);
    });

    it('applies liveness from the worktree marker: an open job span runs only while the marker names its Run', () => {
      // ARRANGE
      const marker = JSON.stringify({
        log: 'docs/episodes/ep/events.jsonl',
        session_id: 's',
        trace_id: TRACE,
        job_span_id: 'job',
      });
      const base = { 'docs/episodes/ep/pipeline.yml': PIPELINE(''), 'docs/episodes/ep/events.jsonl': jobLog() };
      const live = worktree({ ...base, '.scratch/active-run': marker });
      const dead = worktree(base);
      // ACT
      const actual = [states(live)[0], states(dead)[0]];
      // ASSERT
      expect(actual).toEqual(['running', 'ready']);
    });
  });
});

describe('failure cases', () => {
  describe('readEpisodeStatus', () => {
    it('says why there is no status when the pipeline is missing or has no jobs', () => {
      // ARRANGE
      const missing = readEpisodeStatus(worktree({}), SLUG, { now: NOW });
      const empty = readEpisodeStatus(worktree({ 'docs/episodes/ep/pipeline.yml': 'status: approved\n' }), SLUG, {
        now: NOW,
      });
      // ACT
      const actual = [missing, empty];
      // ASSERT
      expect(actual).toEqual([
        { kind: 'no-pipeline', file: 'skills/new-episode/assets/pipeline.yml' },
        { kind: 'no-jobs', file: 'docs/episodes/ep/pipeline.yml' },
      ]);
    });

    it('reports log lines that do not parse, prefixed with the file', () => {
      // ARRANGE
      const root = worktree({
        'docs/episodes/ep/pipeline.yml': PIPELINE(''),
        'docs/episodes/ep/events.jsonl': 'not json\n',
      });
      const result = readEpisodeStatus(root, SLUG, { now: NOW });
      // ACT
      const actual = result.kind === 'ok' && result.errors.map((e) => e.includes('events.jsonl'));
      // ASSERT
      expect(actual).toEqual([true]);
    });
  });
});

describe('edge cases', () => {
  describe('readEpisodeStatus', () => {
    it('falls back to the template pipeline before the Episode has its own, as begin-job does', () => {
      // ARRANGE
      const root = worktree({
        'skills/new-episode/assets/pipeline.yml': PIPELINE(''),
        'docs/episodes/ep/events.jsonl': jobLog(),
      });
      // ACT
      const actual = states(root);
      // ASSERT
      expect(actual).toEqual(['ready', 'waiting']);
    });
  });
});
