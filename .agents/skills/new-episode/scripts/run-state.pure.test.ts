import { describe, expect, it } from 'vitest';
import { parseMarker } from './claude-adapter.pure.ts';
import { archiveTarget, markerText } from './run-state.pure.ts';
import type { RunLogLine } from './run-log.pure.ts';

const TRACE = 'a'.repeat(32);
const RUN: RunLogLine = { kind: 'start-run', t: '2026-10-14T08:00:00Z', seq: 1, trace_id: TRACE, span_id: 'b'.repeat(16), run_id: '2026-10-14T08-00-00Z' };
const JOB: RunLogLine = { kind: 'start', t: '2026-10-14T08:01:00Z', seq: 2, trace_id: TRACE, span_id: 'c'.repeat(16), type: 'job', job: 'brief-grill' };
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
