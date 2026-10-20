import { describe, expect, it } from 'vitest';
import { createLogFold, latestRun, type RunLogLine } from './run-log.pure.ts';

const run = {
  kind: 'start-run',
  t: '2026-10-14T10:00:00Z',
  seq: 1,
  trace_id: 'trace-a',
  span_id: 'run-a',
  run_id: 'run-a',
} as RunLogLine;
const job = {
  ...run,
  kind: 'start',
  seq: 2,
  span_id: 'job-a',
  parent_span_id: 'run-a',
  type: 'job',
  name: 'write',
  job: 'write',
} as RunLogLine;
const attempt = {
  ...job,
  seq: 3,
  span_id: 'attempt-a',
  parent_span_id: 'job-a',
  type: 'attempt',
  attempt: 1,
} as RunLogLine;
const end = {
  kind: 'end',
  t: '2026-10-14T10:00:10Z',
  seq: 4,
  trace_id: 'trace-a',
  span_id: 'attempt-a',
  status: 'error',
} as RunLogLine;

describe('success cases', () => {
  it('applies appended attributes without changing how a Span ended', () => {
    // ARRANGE
    const log = createLogFold();
    const attrs = { ...end, kind: 'attrs', seq: 5, t: '2026-10-14T10:00:20Z', ticket: 174 } as RunLogLine;
    const expected = { status: 'error', end_t: end.t, duration_ms: 10000, ticket: 174 };
    // ACT
    log.append([run, job, attempt, end]);
    log.append([attrs]);
    const found = log.snapshot().spans.find((span) => span.span_id === 'attempt-a');
    // ASSERT
    expect(found).toMatchObject(expected);
  });

  it('keeps measured end attributes when a later end only supplies a status', () => {
    // ARRANGE
    const log = createLogFold();
    const measured = { ...end, source: 'measured', 'gen_ai.usage.input_tokens': 123 } as RunLogLine;
    const terminal = { ...end, seq: 9, t: '2026-10-14T10:00:20Z', status: 'ok' } as RunLogLine;
    const expected = { status: 'ok', duration_ms: 20000, source: 'measured', 'gen_ai.usage.input_tokens': 123 };
    // ACT
    log.append([run, job, attempt, measured]);
    log.append([terminal]);
    const found = log.snapshot().spans.find((span) => span.span_id === 'attempt-a');
    // ASSERT
    expect(found).toMatchObject(expected);
  });

  it('pairs appended ends with starts and preserves retries and Scores', () => {
    // ARRANGE
    const log = createLogFold();
    const retry = {
      ...attempt,
      seq: 5,
      t: end.t,
      span_id: 'attempt-b',
      attempt: 2,
      retry_of: 'attempt-a',
    } as RunLogLine;
    const score = {
      ...end,
      kind: 'score',
      seq: 6,
      name: 'rubric',
      value: 'fail',
      source: 'reviewer',
      body: 'Needs a source.',
    } as RunLogLine;
    const expected = [
      { status: 'error', attempt: 1, retry: undefined, duration: 10000 },
      { status: 'crashed', attempt: 2, retry: 'attempt-a', duration: null },
    ];
    const expectedBody = 'Needs a source.';
    // ACT
    log.append([run, job, attempt]);
    log.append([end, retry, score]);
    const result = log.snapshot();
    const attempts = result.spans
      .filter((span) => span.type === 'attempt')
      .map((span) => ({
        status: span.status,
        attempt: span.attempt,
        retry: span.retry_of,
        duration: span.duration_ms,
      }));
    // ASSERT
    expect(attempts).toEqual(expected);
    expect(result.scores[0].body).toBe(expectedBody);
  });
});

describe('failure cases', () => {
  it('ends liveness even when an explicit live set still names the finished trace', () => {
    // ARRANGE
    const log = createLogFold({ live: new Set(['trace-a']) });
    const finish = { ...end, kind: 'end-run', span_id: 'run-a', status: 'ok' } as RunLogLine;
    const expected = ['ok', 'crashed', 'crashed'];
    // ACT
    log.append([run, job, attempt]);
    log.append([finish]);
    const statuses = log.snapshot().spans.map((span) => span.status);
    // ASSERT
    expect(statuses).toEqual(expected);
  });

  it('crashes only the open spans of the Run that ended', () => {
    // ARRANGE
    const log = createLogFold({ live: 'unfinished' });
    const other = { ...run, trace_id: 'trace-b', span_id: 'run-b', seq: 5 } as RunLogLine;
    const finish = { ...end, kind: 'end-run', span_id: 'run-a', seq: 6, status: 'ok' } as RunLogLine;
    const expectedBefore = ['running', 'running', 'running', 'running'];
    const expectedAfter = ['ok', 'crashed', 'crashed', 'running'];
    // ACT
    log.append([run, job, attempt, other]);
    const before = log.snapshot().spans.map((span) => span.status);
    log.append([finish]);
    const after = log.snapshot().spans.map((span) => span.status);
    // ASSERT
    expect(before).toEqual(expectedBefore);
    expect(after).toEqual(expectedAfter);
  });
});

describe('edge cases', () => {
  it('orders measured facts by their own end timestamps across late arrivals', () => {
    // ARRANGE
    const log = createLogFold();
    const latest = { ...end, seq: 10, t: '2026-10-14T10:00:30Z', status: 'ok' } as RunLogLine;
    const early = { ...end, seq: 8, t: '2026-10-14T10:00:20Z', 'gen_ai.usage.output_tokens': 100 } as RunLogLine;
    const middle = { ...end, seq: 9, t: '2026-10-14T10:00:25Z', 'gen_ai.usage.output_tokens': 200 } as RunLogLine;
    const expected = { status: 'ok', duration_ms: 30000, 'gen_ai.usage.output_tokens': 200 };
    // ACT
    log.append([run, job, attempt, latest]);
    log.append([early]);
    log.append([middle]);
    const result = log.snapshot().spans.find((span) => span.span_id === 'attempt-a');
    // ASSERT
    expect(result).toMatchObject(expected);
  });

  it('takes summary absence from the latest end while retaining measured attributes', () => {
    // ARRANGE
    const log = createLogFold();
    const first = { ...end, summary: 'Review failed.', 'gen_ai.usage.output_tokens': 456 } as RunLogLine;
    const latest = { ...end, seq: 8, t: '2026-10-14T10:00:20Z', status: 'ok' } as RunLogLine;
    const expected = { status: 'ok', summary: null, 'gen_ai.usage.output_tokens': 456 };
    // ACT
    log.append([run, job, attempt, first]);
    log.append([latest]);
    const result = log.snapshot().spans.find((span) => span.span_id === 'attempt-a');
    // ASSERT
    expect(result).toMatchObject(expected);
  });

  it('keeps the chronologically latest end across out-of-order appends and pairs late starts', () => {
    // ARRANGE
    const log = createLogFold();
    const latest = { ...end, t: '2026-10-14T10:00:20Z', seq: 8, status: 'ok' } as RunLogLine;
    const expected = { status: 'ok', duration_ms: 20000 };
    // ACT
    log.append([latest]);
    log.append([run, job, attempt]);
    log.append([end]);
    const result = log.snapshot();
    const found = result.spans.find((span) => span.span_id === 'attempt-a');
    // ASSERT
    expect(found).toMatchObject(expected);
    expect(result.orphans).toEqual([]);
  });

  it('names the Run started latest by time as the latest Run, not the one appended last', () => {
    // ARRANGE
    const log = createLogFold({ live: 'unfinished' });
    const older = {
      ...run,
      t: '2026-10-14T09:00:00Z',
      seq: 9,
      trace_id: 'trace-old',
      span_id: 'run-old',
    } as RunLogLine;
    const expected = 'run-a';
    // ACT
    log.append([run, older]);
    const found = latestRun(log.snapshot())?.span_id;
    // ASSERT
    expect(found).toBe(expected);
  });

  it('names no latest Run before a Run starts', () => {
    // ARRANGE
    const log = createLogFold();
    // ACT
    log.append([job]);
    const found = latestRun(log.snapshot());
    // ASSERT
    expect(found).toBeUndefined();
  });
});
