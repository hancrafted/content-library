import { describe, expect, it } from 'vitest';
import { createLogFold, fold, record, skillUses, type RunLogLine, type Stamp } from './run-log.pure.ts';

/*
 * An `event` line (design-ADR-0010): one point fact on the span that made it, named from a closed set with typed
 * attributes. The writer seam validates it; the fold, in batch and appended line by line, attaches it to that span as
 * `events`, and `skillUses` reads the skills off them.
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
const eventLine = (seq: number, t: string, fact: { name: string; attributes: Record<string, string> }): RunLogLine =>
  line(seq, t, { kind: 'event', span_id: AGENT_SPAN, source: 'measured', ...fact });
const skillLine = (seq: number, t: string, skill: string): RunLogLine =>
  eventLine(seq, t, { name: 'skill.invoke', attributes: { 'skill.name': skill } });
const event = (name: string, attributes: Record<string, unknown>) => ({
  kind: 'event',
  span_id: AGENT_SPAN,
  name,
  source: 'measured',
  attributes,
});
const errorsOf = (events: readonly unknown[]): string[][] =>
  events.map((e) => {
    const result = record(e, STAMP);
    return result.ok ? [] : result.errors;
  });

describe('success cases', () => {
  it('records each event name with its typed attributes as a point record on the span that made it', () => {
    // ARRANGE
    const events = [
      event('skill.invoke', { 'skill.name': 'skill-creator:skill-creator' }),
      event('file.read', { 'file.path': 'src/lib/a.ts' }),
      event('instructions.load', {
        'file.path': '.claude/rules/fe-001-state-management.md',
        load_reason: 'path_glob_match',
        'trigger_file.path': 'src/lib/a.ts',
        adr: 'FE-001-state-management',
      }),
    ];
    const stamped = { t: STAMP.t, seq: STAMP.seq, trace_id: TRACE };
    const expected = events.map(({ kind, ...e }) => ({ ok: true, line: { kind, ...stamped, ...e } }));
    // ACT
    const results = events.map((e) => record(e, STAMP));
    // ASSERT
    expect(results).toEqual(expected);
  });

  it('attaches events to their span in time order, once per line, and reads the skills off them', () => {
    // ARRANGE
    const read = eventLine(5, '04', { name: 'file.read', attributes: { 'file.path': 'GLOSSARY.md' } });
    const lines = [runLine, agentLine, skillLine(4, '05', 'grilling'), read, skillLine(3, '03', 'tdd')];
    const expectedEvents = [
      { name: 'skill.invoke', t: '2026-10-14T10:00:03Z', seq: 3, attributes: { 'skill.name': 'tdd' } },
      { name: 'file.read', t: '2026-10-14T10:00:04Z', seq: 5, attributes: { 'file.path': 'GLOSSARY.md' } },
      { name: 'skill.invoke', t: '2026-10-14T10:00:05Z', seq: 4, attributes: { 'skill.name': 'grilling' } },
    ];
    const expectedSkills = [
      { name: 'tdd', t: '2026-10-14T10:00:03Z', seq: 3 },
      { name: 'grilling', t: '2026-10-14T10:00:05Z', seq: 4 },
    ];
    // ACT
    const agent = fold(lines).spans.find((span) => span.span_id === AGENT_SPAN);
    // ASSERT
    expect(agent?.events).toEqual(expectedEvents);
    expect(skillUses(agent ?? {})).toEqual(expectedSkills);
    expect(agent).not.toHaveProperty('skills_invoked');
  });

  it('attaches the same events when the lines are appended one at a time', () => {
    // ARRANGE
    const log = createLogFold();
    const expected = [
      { name: 'skill.invoke', t: '2026-10-14T10:00:03Z', seq: 3, attributes: { 'skill.name': 'tdd' } },
      { name: 'skill.invoke', t: '2026-10-14T10:00:05Z', seq: 4, attributes: { 'skill.name': 'grilling' } },
    ];
    // ACT
    log.append([runLine]);
    log.append([agentLine]);
    log.append([skillLine(3, '03', 'tdd')]);
    const before = log.snapshot().spans.find((span) => span.span_id === AGENT_SPAN)?.events;
    log.append([skillLine(4, '05', 'grilling')]);
    const after = log.snapshot().spans.find((span) => span.span_id === AGENT_SPAN)?.events;
    // ASSERT
    expect(before).toEqual(expected.slice(0, 1));
    expect(after).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses an event without a span, a name, a source or attributes, or with a span field it cannot carry', () => {
    // ARRANGE
    const attributes = { 'skill.name': 'tdd' };
    const events = [
      { kind: 'event', name: 'skill.invoke', source: 'measured', attributes },
      { kind: 'event', span_id: AGENT_SPAN, source: 'measured', attributes },
      { kind: 'event', span_id: AGENT_SPAN, name: 'skill.invoke', attributes },
      { kind: 'event', span_id: AGENT_SPAN, name: 'skill.invoke', source: 'measured' },
      { ...event('skill.invoke', attributes), status: 'ok' },
    ];
    const expected = [
      ['span_id is required on a event line'],
      ['name is required on a event line'],
      ['source is required on a event line'],
      ['attributes is required on a event line'],
      ['status is not a field of a event line'],
    ];
    // ACT
    const errors = errorsOf(events);
    // ASSERT
    expect(errors).toEqual(expected);
  });

  it("refuses a name outside the closed set and attributes that are not that name's", () => {
    // ARRANGE
    const events = [
      event('file.write', { 'file.path': 'a.ts' }),
      event('skill.invoke', {}),
      event('file.read', { 'file.path': 'a.ts', 'file.size': '3' }),
      event('file.read', { 'file.path': '/Users/han/a.ts' }),
      event('file.read', { 'file.path': '../other/a.ts' }),
      event('instructions.load', { 'file.path': 'CLAUDE.md', load_reason: 'x', adr: 'state-management' }),
    ];
    const expected = [
      ['name must be one of skill.invoke, file.read, instructions.load'],
      ['attributes.skill.name is required on a skill.invoke event'],
      ['attributes.file.size is not an attribute of a file.read event'],
      ['attributes.file.path must be a repo-relative path'],
      ['attributes.file.path must be a repo-relative path'],
      ['attributes.adr must be an ADR id and slug, GEN-002-adr-symlink-claude-rules'],
    ];
    // ACT
    const errors = errorsOf(events);
    // ASSERT
    expect(errors).toEqual(expected);
  });

  it('keeps an event for a span that never started as an orphan, not on any span', () => {
    // ARRANGE
    const stray = { ...skillLine(3, '03', 'tdd'), span_id: 'e'.repeat(16) } as RunLogLine;
    // ACT
    const folded = fold([runLine, agentLine, stray]);
    // ASSERT
    expect(folded.orphans).toEqual([stray]);
    expect(folded.spans.flatMap((span) => span.events ?? [])).toEqual([]);
  });
});

describe('edge cases', () => {
  it('attaches an event appended before its start once the start arrives, and drops it from the orphans', () => {
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
    expect(skillUses(after.spans.find((span) => span.span_id === AGENT_SPAN) ?? {})).toEqual(expected);
  });

  it('keeps skills_invoked from the end line beside the live invocations', () => {
    // ARRANGE
    const end = line(5, '09', { kind: 'end', span_id: AGENT_SPAN, status: 'ok', skills_invoked: ['tdd'] });
    const expected = {
      skills_invoked: ['tdd'],
      events: [{ name: 'skill.invoke', attributes: { 'skill.name': 'tdd' } }],
    };
    // ACT
    const agent = fold([runLine, agentLine, skillLine(3, '03', 'tdd'), end]).spans.find(
      (span) => span.span_id === AGENT_SPAN,
    );
    // ASSERT
    expect(agent).toMatchObject(expected);
  });

  it('reads no skills off a span with no events or only other events', () => {
    // ARRANGE
    const read = eventLine(3, '03', { name: 'file.read', attributes: { 'file.path': 'AGENTS.md' } });
    // ACT
    const spans = fold([runLine, agentLine, read]).spans;
    // ASSERT
    expect(spans.map((span) => skillUses(span))).toEqual([[], []]);
  });
});
