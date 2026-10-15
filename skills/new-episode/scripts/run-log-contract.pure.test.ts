import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createLogFold, fold, lineErrors, parseLog, record, type RunLogLine, type Stamp } from './run-log.pure.ts';

/*
 * The line contract (design-ADR-0010): an envelope, the typed keys of a kind and nothing else at the top level, and an
 * optional `payload` of harness extras, namespaced and bounded. A log written before the contract still holds and folds
 * as it did: the dogfood Run's log is the fixture.
 */

const TRACE = 'a'.repeat(32);
const SPAN = 'b'.repeat(16);
const STAMP: Stamp = { t: '2026-10-14T09:00:00Z', seq: 7, traceId: TRACE, spanId: 'd'.repeat(16) };
const SCORE = { kind: 'score', span_id: SPAN, name: 'check', value: 'pass', source: 'check:mh' };
const DOGFOOD = new URL('../../../tests/fixtures/run-log/dogfood-events.jsonl', import.meta.url);
const errorsOf = (event: unknown): string[] => {
  const result = record(event, STAMP);
  return result.ok ? [] : result.errors;
};

describe('success cases', () => {
  it('keeps a payload namespaced by harness on the line, beside the typed keys', () => {
    // ARRANGE
    const payload = { claude_code: { memory_type: 'Project', globs: ['src/**'] } };
    const expected = { ...SCORE, t: STAMP.t, seq: STAMP.seq, trace_id: TRACE, payload };
    // ACT
    const result = record({ ...SCORE, payload }, STAMP);
    // ASSERT
    expect(result).toEqual({ ok: true, line: expected });
  });

  it('validates every line of the dogfood Run log, written before the contract', () => {
    // ARRANGE
    const { lines, errors } = parseLog(readFileSync(DOGFOOD, 'utf8'));
    const expectedLines = 420;
    // ACT
    const invalid = lines.flatMap((line) => lineErrors(line).map((error) => `seq ${line.seq}: ${error}`));
    // ASSERT
    expect(errors).toEqual([]);
    expect(lines).toHaveLength(expectedLines);
    expect(invalid).toEqual([]);
  });

  it('folds the dogfood Run log as before, batch and appended line by line alike', () => {
    // ARRANGE
    const { lines } = parseLog(readFileSync(DOGFOOD, 'utf8'));
    const expectedTally = {
      'run:ok': 1,
      'job:ok': 10,
      'job:reused': 7,
      'job:error': 1,
      'attempt:ok': 10,
      'attempt:error': 7,
      'agent:ok': 61,
      'gate:ok': 4,
    };
    const expectedScores = 201;
    const expectedRun = {
      span_id: '30e2f016b9c612f9',
      status: 'ok',
      start_t: '2026-10-14T16:24:58Z',
      end_t: '2026-10-14T21:36:51Z',
      duration_ms: 18713000,
      'gen_ai.usage.input_tokens': 1597,
    };
    // ACT
    const batch = fold(lines);
    const appended = createLogFold();
    lines.forEach((line) => appended.append([line]));
    const tally: Record<string, number> = {};
    batch.spans.forEach(
      (span) => (tally[`${span.type}:${span.status}`] = (tally[`${span.type}:${span.status}`] ?? 0) + 1),
    );
    // ASSERT
    expect(tally).toEqual(expectedTally);
    expect(batch.scores).toHaveLength(expectedScores);
    expect(batch.orphans).toEqual([]);
    expect(batch.spans[0]).toMatchObject(expectedRun);
    expect(appended.snapshot()).toEqual(batch);
  });
});

describe('failure cases', () => {
  it('refuses a top-level key no kind declares, and another kind’s key', () => {
    // ARRANGE
    const expected = [['foo is not a field of a score line'], ['status is not a field of a score line']];
    // ACT
    const errors = [errorsOf({ ...SCORE, foo: 1 }), errorsOf({ ...SCORE, status: 'ok' })];
    // ASSERT
    expect(errors).toEqual(expected);
  });

  it('refuses a payload not namespaced by a snake_case harness, and a payload_truncated the writer did not set', () => {
    // ARRANGE
    const namespace = 'payload must map each harness, in snake_case, to an object';
    const expected = [[namespace], [namespace], ['payload_truncated is not a field of a score line']];
    // ACT
    const errors = [
      errorsOf({ ...SCORE, payload: { memory_type: 'Project' } }),
      errorsOf({ ...SCORE, payload: { 'claude-code': {} } }),
      errorsOf({ ...SCORE, payload_truncated: true }),
    ];
    // ASSERT
    expect(errors).toEqual(expected);
  });

  it('flags a stored line whose payload is over the bound', () => {
    // ARRANGE
    const line = { ...SCORE, t: STAMP.t, seq: 1, trace_id: TRACE, payload: { claude_code: { x: 'y'.repeat(2048) } } };
    const expected = ['payload must be at most 2048 bytes'];
    // ACT
    const errors = lineErrors(line);
    // ASSERT
    expect(errors).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('drops a payload over 2 KB whole and marks the line payload_truncated, which a reader accepts', () => {
    // ARRANGE
    const payload = { claude_code: { globs: ['x'.repeat(2048)] } };
    const expected = { ...SCORE, t: STAMP.t, seq: STAMP.seq, trace_id: TRACE, payload_truncated: true };
    // ACT
    const result = record({ ...SCORE, payload }, STAMP);
    const stored = result.ok ? lineErrors(result.line) : ['not recorded'];
    // ASSERT
    expect(result).toEqual({ ok: true, line: expected });
    expect(stored).toEqual([]);
  });

  it('keeps a payload at exactly 2048 bytes', () => {
    // ARRANGE
    const wrapper = JSON.stringify({ claude_code: { x: '' } }).length;
    const payload = { claude_code: { x: 'y'.repeat(2048 - wrapper) } };
    // ACT
    const result = record({ ...SCORE, payload }, STAMP);
    // ASSERT
    expect(result).toMatchObject({ ok: true, line: { payload } });
  });

  it('never folds a payload into a span attribute', () => {
    // ARRANGE
    const start = {
      kind: 'start-run',
      t: STAMP.t,
      seq: 1,
      trace_id: TRACE,
      span_id: SPAN,
      run_id: 'r',
      payload: { claude_code: { x: 1 } },
    } as unknown as RunLogLine;
    // ACT
    const [span] = fold([start]).spans;
    // ASSERT
    expect(span).not.toHaveProperty('payload');
  });
});
