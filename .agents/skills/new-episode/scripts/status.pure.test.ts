import { describe, expect, it } from 'vitest';
import { fold, type Folded, type RunLogLine } from './run-log.pure.ts';
import { outputApproved, renderStatus, runStatus, subIssuesApproved, type GateReaders } from './status.pure.ts';

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

const start = (id: string, type: string, when: [number, Record<string, unknown>?]) => ({ kind: 'start', span_id: id, parent_span_id: 'run', type, name: id, t: at(when[0]), ...when[1] });
const end = (id: string, status: string, minute: number) => ({ kind: 'end', span_id: id, status, t: at(minute) });
const job = (id: string, from: number, status?: string) =>
  status === undefined ? [start(`job-${id}`, 'job', [from, { job: id }])] : [start(`job-${id}`, 'job', [from, { job: id }]), end(`job-${id}`, status, from + 5)];
const live = (lines: RunLogLine[]): Folded => fold(lines, { live: new Set([TRACE]) });
const withReaders = (pipeline: string, folded: Folded, readers: GateReaders) => runStatus(pipeline, folded, { ...readers, now: NOW }).jobs.map(({ state }) => state);
const states = (folded: Folded, pipeline = PIPELINE) => runStatus(pipeline, folded, { now: NOW }).jobs.map(({ state }) => state);

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
    const folded = live(log(...job('brief-grill', 0, 'ok'), ...job('retrieval', 10, 'reused'), ...job('write-research-a', 20, 'ok'), ...job('write-research-b', 30, 'error')));
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
      log(...job('brief-grill', 0, 'ok'), ...job('retrieval', 10), start('ag1', 'agent', [52, { job: 'retrieval', attempt: 2, role: 'implementor', 'gen_ai.request.model': 'opus', parent_span_id: 'job-retrieval' }])),
    );
    const expected = [{ name: 'ag1', job: 'retrieval', attempt: 2, role: 'implementor', elapsed_ms: 480_000 }];
    // ACT
    const status = runStatus(PIPELINE, folded, { now: NOW });
    // ASSERT
    expect(status.running).toEqual(expected);
    expect(status.jobs[1]).toEqual({ id: 'retrieval', state: 'running' });
  });

  it('lists a gate span with no end as waiting on Han, with how long since it opened', () => {
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
      'gate    brief-grill · waiting on Han 10m00s',
    ].join('\n');
    // ACT
    const text = renderStatus(runStatus(PIPELINE, folded, { now: NOW }));
    // ASSERT
    expect(text).toBe(expected);
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
  const GATED_BY_LABEL = `jobs:
  - { id: write-design-spec, needs: [], gate: human, outputs: [] }
  - { id: implement-episode, needs: [write-design-spec] }
`;
  const runLog = live(log(...job('write-design-spec', 0, 'ok')));

  it('prints gate for a logged label-gated job until its tickets are approved, and holds back what needs it', () => {
    // ARRANGE
    const approvedByLabel = () => true;
    // ACT
    const whileTriage = withReaders(GATED_BY_LABEL, runLog, { labelApproved: () => false });
    const withoutReader = states(runLog, GATED_BY_LABEL);
    const afterApproval = withReaders(GATED_BY_LABEL, runLog, { labelApproved: approvedByLabel });
    // ASSERT
    expect(whileTriage).toEqual(['gate', 'waiting']);
    expect(withoutReader).toEqual(['gate', 'waiting']);
    expect(afterApproval).toEqual(['done', 'ready']);
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

  it('reads pipeline.yml status as YAML: quoted, commented or trailing space', () => {
    // ARRANGE
    const texts = ['status: "approved"\njobs: []\n', "status: 'approved' \njobs: []\n", 'status: approved # by Han\njobs: []\n'];
    const expected = [true, true, true];
    // ACT
    const gates = texts.map((text) => outputApproved('pipeline.yml', text));
    // ASSERT
    expect(gates).toEqual(expected);
  });

  it('opens the gate on Han\'s entry and closes it again when the file is edited after approval', () => {
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

describe('subIssuesApproved', () => {
  const ticket = (state: string, ...labels: string[]) => ({ state, labels: labels.map((name) => ({ name })) });

  it('is approved when every open sub-issue has left needs-triage', () => {
    expect(subIssuesApproved([ticket('open', 'ready-for-agent'), ticket('open')])).toBe(true);
  });

  it('is not approved while an open sub-issue still carries needs-triage', () => {
    expect(subIssuesApproved([ticket('open', 'ready-for-agent'), ticket('open', 'needs-triage')])).toBe(false);
  });

  it('ignores closed sub-issues, even one still labelled needs-triage', () => {
    expect(subIssuesApproved([ticket('closed', 'needs-triage'), ticket('open')])).toBe(true);
  });

  it('is not approved when there are no sub-issues', () => {
    expect(subIssuesApproved([])).toBe(false);
  });
});
