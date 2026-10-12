import { describe, expect, it } from 'vitest';
import { runStatus } from './status.pure.ts';

/*
 * A run's state read back from disk: a small per-run pipeline and run logs
 * that record its jobs as an orchestrator appends them.
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

/** One run-log entry, headed `<job id> · <timestamp>`. */
function entry(heading: string, metrics: string[], notes = 'None.'): string {
  const items = metrics.map((metric) => `- ${metric}`).join('\n');
  return `## ${heading}\n\n### Inputs\n\n- x\n\n### Output\n\n- x\n\n### Checks\n\n- x\n\n### Metrics\n\n${items}\n\n### Notes\n\n${notes}\n`;
}

const PASS = 'implementor · attempt 1 · pass · 60 s';

describe('success cases', () => {
  it('marks logged passes done, jobs whose needs are done ready, and the rest waiting', () => {
    // ARRANGE
    const runLog = ['# Run log\n', entry('brief-grill · 2026-10-12T09:00:00Z', [PASS]), entry('retrieval · 2026-10-12T09:10:00Z', [PASS])].join('\n');
    const expected = [
      { id: 'brief-grill', state: 'done' },
      { id: 'retrieval', state: 'done' },
      { id: 'write-research-a', state: 'ready' },
      { id: 'write-research-b', state: 'ready' },
      { id: 'write-dossier', state: 'waiting' },
      { id: 'open-pr', state: 'waiting' },
    ];
    // ACT
    const states = runStatus(PIPELINE, runLog);
    // ASSERT
    expect(states).toEqual(expected);
  });

  it('marks a job whose Notes start Blocked blocked, makes a job wanting it ready, and blocks what needs it', () => {
    // ARRANGE
    const failed = 'implementor · attempt 2 · fail · rubric "The Answer answers the h1 question." · 90 s';
    const runLog = [
      '# Run log\n',
      entry('brief-grill · 2026-10-12T09:00:00Z', [PASS]),
      entry('retrieval · 2026-10-12T09:10:00Z', [PASS]),
      entry('write-research-a · 2026-10-12T09:30:00Z', [PASS, 'reviewer · attempt 1 · pass · 30 s']),
      entry('write-research-b · 2026-10-12T09:40:00Z', [failed], 'Blocked: "The Answer answers the h1 question."'),
    ].join('\n');
    const blockedRetrieval = [
      '# Run log\n',
      entry('brief-grill · 2026-10-12T09:00:00Z', [PASS]),
      entry('retrieval · 2026-10-12T10:00:00Z', [failed], 'Blocked: "x"'),
    ].join('\n');
    // ACT
    const states = runStatus(PIPELINE, runLog).map(({ state }) => state);
    const afterBlockedRetrieval = runStatus(PIPELINE, blockedRetrieval).map(({ state }) => state);
    // ASSERT
    expect(states).toEqual(['done', 'done', 'done', 'blocked', 'ready', 'waiting']);
    expect(afterBlockedRetrieval).toEqual(['done', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked']);
  });
});

describe('edge cases', () => {
  it('reads only the latest entry of a job, and a passed attempt after a failed one as done', () => {
    // ARRANGE
    const runLog = [
      '# Run log\n',
      entry('brief-grill · 2026-10-12T09:00:00Z', ['implementor · attempt 1 · fail · rubric "x" · 10 s']),
      entry('brief-grill · 2026-10-12T09:05:00Z', ['implementor · attempt 1 · fail · rubric "x" · 10 s', PASS.replace('attempt 1', 'attempt 2')]),
    ].join('\n');
    const noLog = '';
    // ACT
    const states = runStatus(PIPELINE, runLog).map(({ state }) => state);
    const fresh = runStatus(PIPELINE, noLog).map(({ state }) => state);
    // ASSERT
    expect(states.slice(0, 2)).toEqual(['done', 'ready']);
    expect(fresh.slice(0, 2)).toEqual(['ready', 'waiting']);
  });
});
