import { describe, expect, it } from 'vitest';
import { createLogFold } from '../../skills/new-episode/scripts/run-log.pure';
import type { RunLogLine } from '../../skills/new-episode/scripts/run-log.schema.pure';
import type { DashboardEvent } from './dashboard-events.pure';
import { parseDashboardPipeline, projectDashboard } from './dashboard-projection.pure';
import { eventsAt, replayBounds, replayDashboard } from './dashboard-replay.pure';

const RUN_START = Date.parse('2026-10-14T10:00:00Z');
const minute = (count: number) => new Date(RUN_START + count * 60_000).toISOString();
const at = (count: number) => RUN_START + count * 60_000;

const agent = {
  type: 'implementor',
  agent: 'general-purpose',
  skills: [],
  references: [],
  model: 'opus',
  session: 'orchestrator',
};
const job = (id: string, needs: string[]) => ({
  id,
  needs,
  wants: [],
  outputs: [],
  checks: [],
  retries: 2,
  agents: [agent],
});
const pipeline = parseDashboardPipeline(
  JSON.stringify({
    status: 'approved',
    jobs: [job('draft', []), job('review', ['draft']), job('publish', ['review'])],
  }),
);

type Fields = Omit<RunLogLine, 't' | 'seq' | 'trace_id'> & { trace_id?: string };
function events(...entries: [number, Fields][]): DashboardEvent[] {
  return entries.map(([time, fields], index) => {
    const line = { trace_id: 'trace', ...fields, t: minute(time), seq: index + 1 } as RunLogLine;
    return { number: index + 1, raw: JSON.stringify(line), line };
  });
}

/** A start line; the span id is the name with `#` as `-`, so Attempt `draft#1` is span `draft-1`. */
const start = (type: string, name: string, extra: object = {}) =>
  ({
    kind: 'start',
    span_id: name.replace('#', '-'),
    type,
    name,
    job: name.split('#')[0],
    parent_span_id: 'run',
    ...extra,
  }) as Fields;
const end = (span_id: string, status: string) => ({ kind: 'end', span_id, status }) as Fields;

/** Draft fails its first Attempt and passes its retry; review and publish follow; the Run ends at minute 31. */
const run = events(
  [0, { kind: 'start-run', span_id: 'run', run_id: 'run-1' } as Fields],
  [1, start('job', 'draft')],
  [1, start('attempt', 'draft#1', { attempt: 1, parent_span_id: 'draft' })],
  [5, end('draft-1', 'error')],
  [6, start('attempt', 'draft#2', { attempt: 2, parent_span_id: 'draft', retry_of: 'draft-1' })],
  [10, end('draft-2', 'ok')],
  [10, end('draft', 'ok')],
  [11, start('job', 'review')],
  [20, end('review', 'ok')],
  [21, start('job', 'publish')],
  [30, end('publish', 'ok')],
  [31, { kind: 'end-run', span_id: 'run', status: 'ok' } as Fields],
);

const states = (view: ReturnType<typeof replayDashboard>) => view.jobs.map((entry) => `${entry.id}:${entry.state}`);

describe('success cases', () => {
  it('reads a Job open at the cutoff as running and the Jobs after it as waiting, though the Run ended later', () => {
    // ARRANGE
    const expected = ['draft:ok', 'review:running', 'publish:waiting'];
    // ACT
    const view = replayDashboard(pipeline, run, at(15));
    // ASSERT
    expect(states(view)).toEqual(expected);
    expect(view.runs[0].status).toBe('running');
  });

  it("equals the live projection at the Run's end", () => {
    // ARRANGE
    const log = createLogFold({ live: 'unfinished' });
    log.append(run.map((event) => event.line!));
    const expected = projectDashboard(pipeline, log.snapshot());
    // ACT
    const view = replayDashboard(pipeline, run, at(31));
    // ASSERT
    expect(view).toEqual(expected);
  });

  it('shows a failed Attempt with the Job still running at a cutoff between Attempts', () => {
    // ARRANGE
    const expectedBetween = [{ name: 'draft#1', status: 'error' }];
    const expectedAfter = [
      { name: 'draft#1', status: 'error' },
      { name: 'draft#2', status: 'running', retry_of: 'draft-1' },
    ];
    // ACT
    const between = replayDashboard(pipeline, run, at(5.5)).jobs[0];
    const after = replayDashboard(pipeline, run, at(7)).jobs[0];
    // ASSERT
    expect(between.state).toBe('running');
    expect(between.attempts).toMatchObject(expectedBetween);
    expect(after.attempts).toMatchObject(expectedAfter);
  });

  it("spans the first event to the last, finished once the Run's end is in", () => {
    // ARRANGE
    const expected = { start: at(0), last: at(31), finished: true };
    const expectedOpen = { start: at(0), last: at(21), finished: false };
    // ACT
    const bounds = replayBounds(run);
    const open = replayBounds(run.slice(0, 10));
    // ASSERT
    expect(bounds).toEqual(expected);
    expect(open).toEqual(expectedOpen);
  });

  it('starts at the current Run, the latest started by time, not the last in the log', () => {
    // ARRANGE
    const earlier = events(
      [-100, { kind: 'start-run', span_id: 'old', run_id: 'run-0', trace_id: 'old' } as Fields],
      [-90, { kind: 'end-run', span_id: 'old', status: 'ok', trace_id: 'old' } as Fields],
    );
    const expected = { start: at(0), last: at(31), finished: true };
    // ACT
    const bounds = replayBounds([...run, ...earlier]);
    // ASSERT
    expect(bounds).toEqual(expected);
  });

  it('gives the event log only the records stamped no later than the cutoff', () => {
    // ARRANGE
    const malformed: DashboardEvent = { number: 99, raw: '{not json', error: 'not a JSON object.' };
    const expected = [1, 2, 3, 4, 5, 6, 7];
    // ACT
    const shown = eventsAt([...run, malformed], at(10));
    // ASSERT
    expect(shown.map((event) => event.number)).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('skips malformed source lines, which carry no time to replay', () => {
    // ARRANGE
    const malformed: DashboardEvent = {
      number: 99,
      raw: '{not json',
      error: 'events.jsonl line 99: not a JSON object.',
    };
    const expected = ['draft:ok', 'review:running', 'publish:waiting'];
    // ACT
    const view = replayDashboard(pipeline, [...run, malformed], at(15));
    // ASSERT
    expect(states(view)).toEqual(expected);
  });

  it('has no bounds for a log without readable events', () => {
    // ARRANGE
    const malformed: DashboardEvent = { number: 1, raw: '{not json', error: 'not a JSON object.' };
    // ACT
    const bounds = replayBounds([malformed]);
    // ASSERT
    expect(bounds).toBeNull();
  });
});

describe('edge cases', () => {
  it('shows every Job waiting and no Run before the first event', () => {
    // ARRANGE
    const expected = ['draft:waiting', 'review:waiting', 'publish:waiting'];
    // ACT
    const view = replayDashboard(pipeline, run, at(-1));
    // ASSERT
    expect(states(view)).toEqual(expected);
    expect(view.runs).toEqual([]);
  });

  it('includes every event stamped at the cutoff, the later sequence number deciding the end', () => {
    // ARRANGE
    const tied = events(
      [0, { kind: 'start-run', span_id: 'run', run_id: 'run-1' } as Fields],
      [1, start('job', 'draft')],
      [4, end('draft', 'error')],
      [4, end('draft', 'ok')],
    );
    const expected = ['draft:ok', 'review:waiting', 'publish:waiting'];
    // ACT
    const view = replayDashboard(pipeline, tied, at(4));
    // ASSERT
    expect(states(view)).toEqual(expected);
  });
});
