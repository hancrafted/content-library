import { describe, expect, it } from 'vitest';
import { liveTraces, parseMarker } from './marker.pure.ts';
import type { RunLogLine } from './run-log.pure.ts';
import { archiveTarget, markerText } from './run-state.pure.ts';

const TRACE = 'a'.repeat(32);
const RUN: RunLogLine = {
  kind: 'start-run',
  t: '2026-10-14T08:00:00Z',
  seq: 1,
  trace_id: TRACE,
  span_id: 'b'.repeat(16),
  run_id: '2026-10-14T08-00-00Z',
};
const JOB: RunLogLine = {
  kind: 'start',
  t: '2026-10-14T08:01:00Z',
  seq: 2,
  trace_id: TRACE,
  span_id: 'c'.repeat(16),
  type: 'job',
  job: 'brief-grill',
};
const LOG = 'docs/episodes/demo/events.jsonl';

describe('success cases', () => {
  it('writes the marker the Claude Code adapter reads back', () => {
    // ARRANGE
    const expected = { log: LOG, session_id: 'sess-1', trace_id: TRACE, job_span_id: JOB.span_id };
    // ACT
    const text = markerText({ log: LOG, sessionId: 'sess-1', lines: [RUN, JOB], jobSpanId: JOB.span_id });
    // ASSERT
    expect(parseMarker(text)).toEqual(expected);
  });

  it('defaults the Job span to the newest orchestrator Job start', () => {
    // ARRANGE
    const later: RunLogLine = { ...JOB, seq: 3, span_id: 'd'.repeat(16), job: 'open-pr' };
    // ACT
    const text = markerText({ log: LOG, sessionId: 'sess-1', lines: [RUN, JOB, later] });
    // ASSERT
    expect(parseMarker(text)?.job_span_id).toBe(later.span_id);
  });
});

describe('failure cases', () => {
  it('refuses a log with no start-run line', () => {
    // ARRANGE
    const lines = [JOB];
    // ACT
    const act = (): string => markerText({ log: LOG, sessionId: 's', lines });
    // ASSERT
    expect(act).toThrow('start-run');
  });

  it('refuses a log with no Job span to attach to', () => {
    // ARRANGE
    const lines = [RUN];
    // ACT
    const act = (): string => markerText({ log: LOG, sessionId: 's', lines });
    // ASSERT
    expect(act).toThrow('Job');
  });

  it('refuses an archive of a log with no start-run line', () => {
    // ARRANGE
    const lines: RunLogLine[] = [];
    // ACT
    const act = (): string => archiveTarget('demo', lines);
    // ASSERT
    expect(act).toThrow('start-run');
  });
});

describe('Job span check', () => {
  it('refuses a Job span id the log does not hold', () => {
    // ARRANGE
    const lines = [RUN, JOB];
    // ACT
    const act = (): string => markerText({ log: LOG, sessionId: 's', lines, jobSpanId: 'e'.repeat(16) });
    // ASSERT
    expect(act).toThrow('not a Job span');
  });

  it('refuses a Job span that has ended, named or defaulted', () => {
    // ARRANGE
    const ended: RunLogLine = {
      kind: 'end',
      t: '2026-10-14T08:02:00Z',
      seq: 3,
      trace_id: TRACE,
      span_id: JOB.span_id,
      status: 'ok',
    };
    // ACT
    const named = (): string =>
      markerText({ log: LOG, sessionId: 's', lines: [RUN, JOB, ended], jobSpanId: JOB.span_id });
    const defaulted = (): string => markerText({ log: LOG, sessionId: 's', lines: [RUN, JOB, ended] });
    // ASSERT
    expect(named).toThrow('already ended');
    expect(defaulted).toThrow('already ended');
  });
});

describe('live Runs', () => {
  it('names the marker trace as the only live one, and none without a marker', () => {
    // ARRANGE
    const text = markerText({ log: LOG, sessionId: 's', lines: [RUN, JOB] });
    // ACT
    const live = liveTraces(text);
    const none = liveTraces(null);
    // ASSERT
    expect([...live]).toEqual([TRACE]);
    expect(none.size).toBe(0);
  });
});

describe('edge cases', () => {
  it('archives under the Episode folder, named by the newest Run id', () => {
    // ARRANGE
    const second: RunLogLine = { ...RUN, seq: 4, run_id: '2026-10-15T09-00-00Z' };
    const expected = '.logs/new-episode/demo/2026-10-15T09-00-00Z.jsonl';
    // ACT
    const target = archiveTarget('demo', [RUN, JOB, second]);
    // ASSERT
    expect(target).toBe(expected);
  });
});
