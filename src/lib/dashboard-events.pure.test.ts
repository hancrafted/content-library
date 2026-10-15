import { describe, expect, it } from 'vitest';
import type { RunLogLine } from '../../skills/new-episode/scripts/run-log.schema.pure';
import { selectEvents, type DashboardEvent } from './dashboard-events.pure';

const event = (number: number, fields: Record<string, unknown>): DashboardEvent => {
  const line = fields as unknown as RunLogLine;
  return { number, line, raw: JSON.stringify(line) };
};
const base = { trace_id: 'trace', t: '2026-10-14T10:00:00Z', seq: 1 };

describe('success cases', () => {
  it('filters a ticket through parent ancestry and keeps end and score lines in chronological order', () => {
    // ARRANGE
    const events = [
      event(1, { ...base, kind: 'start', span_id: 'job', type: 'job', job: 'implement-episode' }),
      event(2, { ...base, kind: 'start', span_id: 'agent', parent_span_id: 'job', type: 'agent', ticket: 174, seq: 2 }),
      event(3, { ...base, kind: 'end', span_id: 'agent', status: 'ok', seq: 4 }),
      event(4, { ...base, kind: 'score', span_id: 'agent', name: 'rubric', value: 'pass', seq: 3 }),
      event(5, { ...base, kind: 'start', span_id: 'other', parent_span_id: 'job', type: 'agent', ticket: 175, seq: 5 }),
    ];
    const expectedLines = [2, 4, 3];
    // ACT
    const selected = selectEvents(events, { jobs: ['implement-episode'], ticket: 174 });
    // ASSERT
    expect(selected.map((entry) => entry.number)).toEqual(expectedLines);
  });
});

describe('failure cases', () => {
  it('keeps malformed source visible globally without assigning it to a guessed Job', () => {
    // ARRANGE
    const broken: DashboardEvent = { number: 1, raw: '{broken', error: 'not a JSON object' };
    const events = [broken];
    // ACT
    const all = selectEvents(events);
    const scoped = selectEvents(events, { jobs: ['write-dossier'] });
    // ASSERT
    expect(all).toEqual([broken]);
    expect(scoped).toEqual([]);
  });
});

describe('edge cases', () => {
  it('does not associate matching span ids from another Run or mutate source order', () => {
    // ARRANGE
    const events = [
      event(1, { ...base, kind: 'start', span_id: 'agent', job: 'write-dossier', t: '2026-10-14T11:00:00Z' }),
      event(2, { ...base, kind: 'start', span_id: 'agent', job: 'retrieval', trace_id: 'other' }),
      event(3, { ...base, kind: 'end', span_id: 'agent', trace_id: 'other', seq: 2 }),
    ];
    const before = events.map((entry) => entry.number);
    const expected = [1];
    // ACT
    const selected = selectEvents(events, { jobs: ['write-dossier'] });
    // ASSERT
    expect(selected.map((entry) => entry.number)).toEqual(expected);
    expect(events.map((entry) => entry.number)).toEqual(before);
    expect(selectEvents([])).toEqual([]);
  });
});
