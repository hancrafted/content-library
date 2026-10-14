import { describe, expect, it } from 'vitest';
import { createLogFold, fold, record, type RunLogLine, type Stamp } from './run-log.pure.ts';

/*
 * A `skill` line (design-ADR 0009): one point record per Skill tool call, on the span that made it. The writer seam
 * validates it; the fold, in batch and appended line by line, attaches it to that span as `skills`.
 */

const TRACE = 'a'.repeat(32);
const RUN_SPAN = 'b'.repeat(16);
const AGENT_SPAN = 'c'.repeat(16);
const STAMP: Stamp = { t: '2026-10-14T09:00:00Z', seq: 7, traceId: TRACE, spanId: 'd'.repeat(16) };

const line = (seq: number, t: string, rest: Record<string, unknown>): RunLogLine =>
  ({ t: `2026-10-14T10:00:${t}Z`, seq, trace_id: TRACE, ...rest }) as RunLogLine;
const runLine = line(1, '00', { kind: 'start-run', span_id: RUN_SPAN, run_id: 'r' });
const agentLine = line(2, '01', {
  kind: 'start',
  span_id: AGENT_SPAN,
  parent_span_id: RUN_SPAN,
  type: 'agent',
  name: 'write#1/implementor',
  job: 'write',
  role: 'implementor',
});
const skillLine = (seq: number, t: string, name: string): RunLogLine =>
  line(seq, t, { kind: 'skill', span_id: AGENT_SPAN, name, source: 'measured' });

describe('success cases', () => {
  it('records a skill invocation as a point record on the span that made it', () => {
    // ARRANGE
    const event = { kind: 'skill', span_id: AGENT_SPAN, name: 'skill-creator:skill-creator', source: 'measured' };
    const expected = {
      kind: 'skill',
      t: STAMP.t,
      seq: STAMP.seq,
      trace_id: TRACE,
      span_id: AGENT_SPAN,
      name: 'skill-creator:skill-creator',
      source: 'measured',
    };
    // ACT
    const result = record(event, STAMP);
    // ASSERT
    expect(result).toEqual({ ok: true, line: expected });
  });

  it('attaches invocations to their span in time order, once per line, without touching skills_invoked', () => {
    // ARRANGE
    const lines = [runLine, agentLine, skillLine(4, '05', 'grilling'), skillLine(3, '03', 'tdd')];
    const expected = [
      { name: 'tdd', t: '2026-10-14T10:00:03Z', seq: 3 },
      { name: 'grilling', t: '2026-10-14T10:00:05Z', seq: 4 },
    ];
    // ACT
    const agent = fold(lines).spans.find((span) => span.span_id === AGENT_SPAN);
    // ASSERT
    expect(agent?.skills).toEqual(expected);
    expect(agent).not.toHaveProperty('skills_invoked');
  });

  it('attaches the same invocations when the lines are appended one at a time', () => {
    // ARRANGE
    const log = createLogFold();
    const expected = [
      { name: 'tdd', t: '2026-10-14T10:00:03Z', seq: 3 },
      { name: 'grilling', t: '2026-10-14T10:00:05Z', seq: 4 },
    ];
    // ACT
    log.append([runLine]);
    log.append([agentLine]);
    log.append([skillLine(3, '03', 'tdd')]);
    const before = log.snapshot().spans.find((span) => span.span_id === AGENT_SPAN)?.skills;
    log.append([skillLine(4, '05', 'grilling')]);
    const after = log.snapshot().spans.find((span) => span.span_id === AGENT_SPAN)?.skills;
    // ASSERT
    expect(before).toEqual(expected.slice(0, 1));
    expect(after).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a skill line without a span, a name or a source, or with a span field it cannot carry', () => {
    // ARRANGE
    const lines = [
      { kind: 'skill', name: 'tdd', source: 'measured' },
      { kind: 'skill', span_id: AGENT_SPAN, source: 'measured' },
      { kind: 'skill', span_id: AGENT_SPAN, name: 'tdd' },
      { kind: 'skill', span_id: AGENT_SPAN, name: 'tdd', source: 'check:mh' },
      { kind: 'skill', span_id: AGENT_SPAN, name: 'tdd', source: 'measured', status: 'ok' },
    ];
    const expected = [
      ['span_id is required on a skill line'],
      ['name is required on a skill line'],
      ['source is required on a skill line'],
      ['source must be one of measured, typed'],
      ['status is not a field of a skill line'],
    ];
    // ACT
    const errors = lines.map((event) => {
      const result = record(event, STAMP);
      return result.ok ? [] : result.errors;
    });
    // ASSERT
    expect(errors).toEqual(expected);
  });

  it('keeps a skill line for a span that never started as an orphan, not on any span', () => {
    // ARRANGE
    const stray = { ...skillLine(3, '03', 'tdd'), span_id: 'e'.repeat(16) };
    // ACT
    const folded = fold([runLine, agentLine, stray]);
    // ASSERT
    expect(folded.orphans).toEqual([stray]);
    expect(folded.spans.flatMap((span) => span.skills ?? [])).toEqual([]);
  });
});

describe('edge cases', () => {
  it('attaches a skill line appended before its start once the start arrives, and drops it from the orphans', () => {
    // ARRANGE
    const log = createLogFold();
    const early = skillLine(3, '03', 'tdd');
    const expected = [{ name: 'tdd', t: '2026-10-14T10:00:03Z', seq: 3 }];
    // ACT
    log.append([runLine, early]);
    const orphansBefore = log.snapshot().orphans;
    log.append([agentLine]);
    const after = log.snapshot();
    // ASSERT
    expect(orphansBefore).toEqual([early]);
    expect(after.orphans).toEqual([]);
    expect(after.spans.find((span) => span.span_id === AGENT_SPAN)?.skills).toEqual(expected);
  });

  it('keeps skills_invoked from the end line beside the live invocations', () => {
    // ARRANGE
    const end = line(5, '09', { kind: 'end', span_id: AGENT_SPAN, status: 'ok', skills_invoked: ['tdd'] });
    // ACT
    const agent = fold([runLine, agentLine, skillLine(3, '03', 'tdd'), end]).spans.find(
      (span) => span.span_id === AGENT_SPAN,
    );
    // ASSERT
    expect(agent).toMatchObject({ skills_invoked: ['tdd'], skills: [{ name: 'tdd' }] });
  });
});
