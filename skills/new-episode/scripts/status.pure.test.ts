import { describe, expect, it } from 'vitest';
import { fold, type Folded, type RunLogLine } from './run-log.pure.ts';
import { outputApproved, renderStatus, runStatus, type GateReaders } from './status.pure.ts';

/*
 * A run's state read back from its event log: a small per-run pipeline and
 * span fixtures, folded as the status CLI folds events.jsonl.
 */

const PIPELINE = `status: approved
jobs:
  - { id: brief-grill, needs: [] }
  - { id: retrieval, needs: [brief-grill] }
  - { id: write-research-a, needs: [retrieval] }
  - { id: write-research-b, needs: [retrieval] }
  - { id: write-dossier, needs: [retrieval], wants: [write-research-a, write-research-b] }
  - { id: open-pr, needs: [write-dossier] }
`;

const TRACE = 'a'.repeat(32);
const NOW = '2026-10-12T10:00:00Z';
const at = (minute: number): string => `2026-10-12T09:${String(minute).padStart(2, '0')}:00Z`;

/** Builds log lines with a rising sequence number; span ids are hand-named so fixtures read as a story. */
function log(...events: Record<string, unknown>[]): RunLogLine[] {
  return events.map((event, index) => ({ trace_id: TRACE, seq: index + 1, ...event }) as RunLogLine);
}

const start = (id: string, type: string, when: [number, Record<string, unknown>?]) => ({
  kind: 'start',
  span_id: id,
  parent_span_id: 'run',
  type,
  name: id,
  t: at(when[0]),
  ...when[1],
});
const end = (id: string, status: string, minute: number) => ({ kind: 'end', span_id: id, status, t: at(minute) });
const job = (id: string, from: number, status?: string) =>
  status === undefined
    ? [start(`job-${id}`, 'job', [from, { job: id }])]
    : [start(`job-${id}`, 'job', [from, { job: id }]), end(`job-${id}`, status, from + 5)];
const live = (lines: RunLogLine[]): Folded => fold(lines, { live: new Set([TRACE]) });
const withReaders = (pipeline: string, folded: Folded, readers: GateReaders) =>
  runStatus(pipeline, folded, { ...readers, now: NOW }).jobs.map(({ state }) => state);
const states = (folded: Folded, pipeline = PIPELINE) =>
  runStatus(pipeline, folded, { now: NOW }).jobs.map(({ state }) => state);

describe('success cases', () => {
  it('marks jobs whose span ended ok done, jobs whose needs are done ready, and the rest waiting', () => {
    // ARRANGE
    const folded = live(log(...job('brief-grill', 0, 'ok'), ...job('retrieval', 10, 'ok')));
    const expected = [
      { id: 'brief-grill', state: 'done' },
      { id: 'retrieval', state: 'done' },
      { id: 'write-research-a', state: 'ready' },
      { id: 'write-research-b', state: 'ready' },
      { id: 'write-dossier', state: 'waiting' },
      { id: 'open-pr', state: 'waiting' },
    ];
    // ACT
    const { jobs } = runStatus(PIPELINE, folded, { now: NOW });
    // ASSERT
    expect(jobs).toEqual(expected);
  });

  it('reads a reused job as done, an errored job as blocked, a job wanting it ready, and blocks what needs it', () => {
    // ARRANGE
    const folded = live(
      log(
        ...job('brief-grill', 0, 'ok'),
        ...job('retrieval', 10, 'reused'),
        ...job('write-research-a', 20, 'ok'),
        ...job('write-research-b', 30, 'error'),
      ),
    );
    const blockedRetrieval = live(log(...job('brief-grill', 0, 'ok'), ...job('retrieval', 10, 'error')));
    // ACT
    const afterFailure = states(folded);
    const afterBlockedRetrieval = states(blockedRetrieval);
    // ASSERT
    expect(afterFailure).toEqual(['done', 'done', 'done', 'blocked', 'ready', 'waiting']);
    expect(afterBlockedRetrieval).toEqual(['done', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked']);
  });

  it('lists a running agent with its elapsed time from the injected clock, and a running job as running', () => {
    // ARRANGE
    const folded = live(
      log(
        ...job('brief-grill', 0, 'ok'),
        ...job('retrieval', 10),
        start('ag1', 'agent', [
          52,
          {
            job: 'retrieval',
            attempt: 2,
            role: 'implementor',
            'gen_ai.request.model': 'opus',
            parent_span_id: 'job-retrieval',
          },
        ]),
      ),
    );
    const expected = [{ name: 'ag1', job: 'retrieval', attempt: 2, role: 'implementor', elapsed_ms: 480_000 }];
    // ACT
    const status = runStatus(PIPELINE, folded, { now: NOW });
    // ASSERT
    expect(status.running).toEqual(expected);
    expect(status.jobs[1]).toEqual({ id: 'retrieval', state: 'running' });
  });

  it('lists a gate span with no end as waiting on the user, with how long since it opened', () => {
    // ARRANGE
    const folded = live(log(...job('brief-grill', 0, 'ok'), start('gate-1', 'gate', [40, { job: 'brief-grill' }])));
    const expected = [{ name: 'gate-1', job: 'brief-grill', waiting_ms: 1_200_000 }];
    // ACT
    const { waiting } = runStatus(PIPELINE, folded, { now: NOW });
    // ASSERT
    expect(waiting).toEqual(expected);
  });

  it('prints jobs, then running agents, problems and waiting gates', () => {
    // ARRANGE
    const folded = live(
      log(
        ...job('brief-grill', 0, 'ok'),
        start('ag1', 'agent', [55, { job: 'retrieval', attempt: 1, role: 'implementor' }]),
        start('ag2', 'agent', [1, { job: 'retrieval', attempt: 1, role: 'reviewer' }]),
        end('ag2', 'refused', 2),
        start('gate-1', 'gate', [50, { job: 'brief-grill' }]),
      ),
    );
    const expected = [
      'done    brief-grill',
      'ready   retrieval',
      'waiting write-research-a',
      'waiting write-research-b',
      'waiting write-dossier',
      'waiting open-pr',
      'running ag1 · retrieval#1/implementor · 5m00s',
      'refused ag2 · retrieval#1/reviewer',
      'gate    brief-grill · waiting on the user 10m00s',
    ].join('\n');
    // ACT
    const text = renderStatus(runStatus(PIPELINE, folded, { now: NOW }));
    // ASSERT
    expect(text).toBe(expected);
  });
});

describe('the current Run', () => {
  it('counts only the trace it is given, so an earlier Run no longer makes a job done', () => {
    // ARRANGE
    const earlier = log(...job('brief-grill', 0, 'ok'), ...job('retrieval', 10, 'ok'));
    const current = log(...job('brief-grill', 20, 'ok')).map((l) => ({ ...l, trace_id: 'b'.repeat(32) }));
    const folded = fold([...earlier, ...current], { live: new Set(['b'.repeat(32)]) });
    // ACT
    const all = runStatus(PIPELINE, folded, { now: NOW }).jobs.map(({ state }) => state);
    const scoped = runStatus(PIPELINE, folded, { now: NOW, trace: 'b'.repeat(32) }).jobs.map(({ state }) => state);
    // ASSERT
    expect(all.slice(0, 2)).toEqual(['done', 'done']);
    expect(scoped.slice(0, 3)).toEqual(['done', 'ready', 'waiting']);
  });

  it('reads a reused job as done', () => {
    // ARRANGE
    const folded = live(log(...job('brief-grill', 0, 'reused')));
    // ACT
    const jobs = runStatus(PIPELINE, folded, { now: NOW, trace: TRACE }).jobs;
    // ASSERT
    expect(jobs[0]).toEqual({ id: 'brief-grill', state: 'done' });
  });
});

describe('failure cases', () => {
  it('lists crashed and refused spans of a finished log, and leaves a crashed job to run again', () => {
    // ARRANGE
    const lines = log(
      ...job('brief-grill', 0, 'ok'),
      ...job('retrieval', 10),
      start('ag1', 'agent', [11, { job: 'retrieval', attempt: 1, role: 'implementor' }]),
      start('ag2', 'agent', [12, { job: 'retrieval', attempt: 1, role: 'implementor' }]),
      end('ag2', 'refused', 12),
    );
    const folded = fold(lines);
    const expected = [
      { name: 'job-retrieval', job: 'retrieval', status: 'crashed' },
      { name: 'ag1', job: 'retrieval', attempt: 1, role: 'implementor', status: 'crashed' },
      { name: 'ag2', job: 'retrieval', attempt: 1, role: 'implementor', status: 'refused' },
    ];
    // ACT
    const status = runStatus(PIPELINE, folded, { now: NOW });
    // ASSERT
    expect(status.problems).toEqual(expected);
    expect(status.running).toEqual([]);
    expect(status.jobs[1]).toEqual({ id: 'retrieval', state: 'ready' });
  });
});

describe('edge cases', () => {
  it('reads only the latest span of a job, and an empty log as every job at its pipeline position', () => {
    // ARRANGE
    const retried = live(log(...job('brief-grill', 0, 'error'), ...job('brief-grill', 10, 'ok')));
    const noLog = live([]);
    // ACT
    const afterRetry = states(retried);
    const fresh = states(noLog);
    // ASSERT
    expect(afterRetry.slice(0, 2)).toEqual(['done', 'ready']);
    expect(fresh.slice(0, 2)).toEqual(['ready', 'waiting']);
  });
});

describe('gate jobs', () => {
  const GATED = `jobs:
  - { id: write-voice-script, needs: [], gate: human, outputs: [docs/episodes/<slug>/dossier.md] }
  - { id: write-spec, needs: [write-voice-script] }
`;
  const runLog = live(log(...job('write-voice-script', 0, 'ok')));

  it('prints gate for a logged gate job until its output is approved, and holds back what needs it', () => {
    // ARRANGE
    const draft = () => false;
    const approved = () => true;
    // ACT
    const whileDraft = withReaders(GATED, runLog, { outputApproved: draft });
    const afterApproval = withReaders(GATED, runLog, { outputApproved: approved });
    // ASSERT
    expect(whileDraft).toEqual(['gate', 'waiting']);
    expect(afterApproval).toEqual(['done', 'ready']);
  });
});

describe('gate jobs without a staging output', () => {
  const GATED_WITHOUT_OUTPUT = `jobs:
  - { id: write-design-spec, needs: [], gate: human, outputs: [] }
  - { id: implement-episode-init, needs: [write-design-spec] }
`;
  const runLog = live(log(...job('write-design-spec', 0, 'ok')));

  it('keeps a gate with no output to approve shut, and holds back what needs it', () => {
    // ARRANGE
    const everyOutputApproved = () => true;
    // ACT
    const withReader = withReaders(GATED_WITHOUT_OUTPUT, runLog, { outputApproved: everyOutputApproved });
    const withoutReader = states(runLog, GATED_WITHOUT_OUTPUT);
    // ASSERT
    expect(withReader).toEqual(['gate', 'waiting']);
    expect(withoutReader).toEqual(['gate', 'waiting']);
  });
});

describe('outputApproved', () => {
  const brief = (generatedAt: string): string =>
    `---\ntype: brief\ngenerated:\n  by: claude-code/opus-5.5\n  at: ${generatedAt}\nverified:\n  - by: human:han\n    at: 2026-10-12T09:30:00Z\n---\n`;
  const GATED = `jobs:
  - { id: brief-grill, needs: [], gate: human, outputs: [docs/episodes/<slug>/brief.md] }
`;
  const runLog = live(log(...job('brief-grill', 0, 'ok')));

  it('reads a markdown file by its trust tier and pipeline.yml by its status', () => {
    // ARRANGE
    const approved = brief('2026-10-12T09:00:00Z');
    const expected = [true, true, false];
    // ACT
    const gates = [
      outputApproved('brief.md', approved),
      outputApproved('pipeline.yml', 'status: approved\njobs: []\n'),
      outputApproved('pipeline.yml', 'status: draft\njobs: []\n'),
    ];
    // ASSERT
    expect(gates).toEqual(expected);
  });

  it("reads an HTML Spec by its meta block's trust tier, so write-spec's gate opens on the user's approval", () => {
    // ARRANGE
    const spec = (verified: string): string =>
      `<html><head><script type="application/json" id="spec-meta">{"type":"spec","generated":{"by":"claude-code/opus-5.5","at":"2026-10-12T09:00:00Z"}${verified}}</script></head><body></body></html>`;
    const approved = spec(',"verified":[{"by":"human:han","at":"2026-10-12T09:30:00Z"}]');
    const checked = spec(',"verified":[{"by":"process:markdown-harness","at":"2026-10-12T09:10:00Z"}]');
    const expected = [true, false, false];
    // ACT
    const gates = [
      outputApproved('spec/spec.html', approved),
      outputApproved('spec/spec.html', checked),
      outputApproved('spec/spec.html', '<html><body></body></html>'),
    ];
    // ASSERT
    expect(gates).toEqual(expected);
  });

  it('reads pipeline.yml status as YAML: quoted, commented or trailing space', () => {
    // ARRANGE
    const texts = [
      'status: "approved"\njobs: []\n',
      "status: 'approved' \njobs: []\n",
      'status: approved # by the user\njobs: []\n',
    ];
    const expected = [true, true, true];
    // ACT
    const gates = texts.map((text) => outputApproved('pipeline.yml', text));
    // ASSERT
    expect(gates).toEqual(expected);
  });

  it("opens the gate on the user's entry and closes it again when the file is edited after approval", () => {
    // ARRANGE
    const fresh = () => outputApproved('brief.md', brief('2026-10-12T09:00:00Z'));
    const edited = () => outputApproved('brief.md', brief('2026-10-12T10:00:00Z'));
    const expected = { open: ['done'], reopened: ['gate'] };
    // ACT
    const open = withReaders(GATED, runLog, { outputApproved: fresh });
    const reopened = withReaders(GATED, runLog, { outputApproved: edited });
    // ASSERT
    expect({ open, reopened }).toEqual(expected);
  });
});

describe('skills listed and not invoked', () => {
  const SKILLS_PIPELINE = `status: approved
jobs:
  - id: build
    needs: []
    agents:
      - { type: implementor, skills: [implement-spec, tdd], session: orchestrator }
      - { type: reviewer, skills: [code-review, ui-ux-pro-max:slides], session: orchestrator }
  - id: write
    needs: []
    agents:
      - { type: implementor, skills: [writing-for-agents] }
      - { type: reviewer, skills: [domain-modeling] }
`;
  const agent = (id: string, who: { job: string; role: string }, invoked?: string[]): Record<string, unknown>[] => [
    start(id, 'agent', [1, { ...who, attempt: 1 }]),
    { ...end(id, 'ok', 2), ...(invoked && { skills_invoked: invoked }) },
  ];
  const warnings = (lines: Record<string, unknown>[]) =>
    runStatus(SKILLS_PIPELINE, fold(log(...lines)), { now: NOW }).skillWarnings.map(({ role, missing }) => ({
      role,
      missing,
    }));

  it('warns per agent for a skill its type lists and its transcript never invoked', () => {
    // ARRANGE
    const lines = [
      ...agent('i', { job: 'write', role: 'implementor' }, ['writing-for-agents']),
      ...agent('r', { job: 'write', role: 'reviewer' }, []),
    ];
    // ACT
    const result = warnings(lines);
    // ASSERT
    expect(result).toEqual([{ role: 'reviewer', missing: ['domain-modeling'] }]);
  });

  it("stays quiet for an old log's ticket-implementor, whose skills no pipeline lists any more", () => {
    // ARRANGE
    const lines = agent('t', { job: 'build', role: 'ticket-implementor' }, []);
    // ACT
    const result = warnings(lines);
    // ASSERT
    expect(result).toEqual([]);
  });

  it('warns for an orchestrator-session Job by the skills of its orchestrator agents, plugin skills as plugin:skill', () => {
    // ARRANGE
    const lines = [
      start('j', 'job', [1, { job: 'build' }]),
      { ...end('j', 'ok', 9), skills_invoked: ['implement-spec', 'code-review'] },
    ];
    // ACT
    const result = runStatus(SKILLS_PIPELINE, fold(log(...lines)), { now: NOW }).skillWarnings;
    // ASSERT
    expect(result).toEqual([expect.objectContaining({ job: 'build', missing: ['tdd', 'ui-ux-pro-max:slides'] })]);
  });

  it('stays quiet when every listed skill was invoked, or the span recorded nothing about skills', () => {
    // ARRANGE
    const lines = [
      ...agent('i', { job: 'write', role: 'implementor' }, ['writing-for-agents', 'extra']),
      ...agent('r', { job: 'write', role: 'reviewer' }),
      ...agent('s', { job: 'write', role: 'skill-spawned' }, []),
    ];
    // ACT
    const result = warnings(lines);
    // ASSERT
    expect(result).toEqual([]);
  });

  it('prints a warn line', () => {
    // ARRANGE
    const folded = fold(log(...agent('r', { job: 'write', role: 'reviewer' }, [])));
    // ACT
    const text = renderStatus(runStatus(SKILLS_PIPELINE, folded, { now: NOW }));
    // ASSERT
    expect(text).toContain('warn    r · write#1/reviewer · skill not invoked: domain-modeling');
  });
});
