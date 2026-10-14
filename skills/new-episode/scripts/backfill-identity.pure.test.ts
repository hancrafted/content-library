import { describe, expect, it } from 'vitest';
import { identityBackfill } from './backfill-identity.pure.ts';
import { fold, type RunLogLine } from './run-log.pure.ts';

/*
 * The identity backfill (design-ADR 0007): a log written before identity-at-stop existed, and the meta.json files
 * its agents left behind, in; the `attrs` lines that give each skill-spawned agent the identity SubagentStop would
 * have put on its end line, out.
 */
const TRACE = 'a'.repeat(32);
const OLD_TRACE = 'f'.repeat(32);
const ID = (n: number): string => n.toString(16).padStart(16, '0');
const line = (seq: number, t: string, rest: Partial<RunLogLine>): RunLogLine =>
  ({ seq, t, trace_id: TRACE, ...rest }) as RunLogLine;
const META = (description: string): string => JSON.stringify({ agentType: 'general-purpose', description });
const TRANSCRIPT = '/s/subagents/agent-a1.jsonl';

const RUN = line(1, '2026-10-14T09:00:00Z', { kind: 'start-run', span_id: ID(1), run_id: 'r' });
const JOB = line(2, '2026-10-14T09:00:10Z', {
  kind: 'start',
  type: 'job',
  span_id: ID(2),
  parent_span_id: ID(1),
  name: 'write',
  job: 'write',
});
const ATTEMPT = line(3, '2026-10-14T09:00:20Z', {
  kind: 'start',
  type: 'attempt',
  span_id: ID(3),
  parent_span_id: ID(2),
  name: 'write#2',
  job: 'write',
  attempt: 2,
});
const SPAWNED = line(4, '2026-10-14T09:00:30Z', {
  kind: 'start',
  type: 'agent',
  span_id: ID(4),
  parent_span_id: ID(2),
  name: 'write/skill-spawned',
  job: 'write',
  role: 'skill-spawned',
  transcript_path: TRANSCRIPT,
});
const END = line(5, '2026-10-14T09:01:30Z', { kind: 'end', span_id: ID(4), status: 'ok' });
const LOG = [RUN, JOB, ATTEMPT, SPAWNED, END];
const metaOf = (description: string) => (file: string) =>
  file === '/s/subagents/agent-a1.meta.json' ? META(description) : null;

describe('success cases', () => {
  it('appends the identity meta.json names, nested where the agent stood when it stopped', () => {
    // ARRANGE
    const description = 'write#2/ticket-implementor/#148';
    const expected = {
      kind: 'attrs',
      span_id: ID(4),
      job: 'write',
      attempt: 2,
      role: 'ticket-implementor',
      ticket: 148,
      parent_span_id: ID(3),
      name: description,
      description,
    };
    // ACT
    const { events } = identityBackfill(LOG, metaOf(description));
    // ASSERT
    expect(events).toEqual([expected]);
  });

  it('lets the fold read the span with the final identity', () => {
    // ARRANGE
    const { events } = identityBackfill(LOG, metaOf('write#2/reviewer'));
    const attrs = { ...events[0], t: '2026-10-15T00:00:00Z', seq: 6, trace_id: TRACE } as RunLogLine;
    // ACT
    const span = fold([...LOG, attrs]).spans.find((s) => s.span_id === ID(4));
    // ASSERT
    expect(span).toMatchObject({ role: 'reviewer', attempt: 2, parent_span_id: ID(3), status: 'ok' });
  });
});

describe('idempotence and skips', () => {
  it('appends nothing once the span carries its identity', () => {
    // ARRANGE
    const done = {
      kind: 'attrs',
      span_id: ID(4),
      role: 'reviewer',
      t: '2026-10-15T00:00:00Z',
      seq: 6,
      trace_id: TRACE,
    };
    // ACT
    const { events } = identityBackfill([...LOG, done as RunLogLine], metaOf('write#2/reviewer'));
    // ASSERT
    expect(events).toEqual([]);
  });

  it('leaves an agent whose end line already carries identity alone', () => {
    // ARRANGE
    const log = [RUN, JOB, ATTEMPT, SPAWNED, { ...END, role: 'reviewer' }];
    // ACT
    const { events } = identityBackfill(log, metaOf('write#2/reviewer'));
    // ASSERT
    expect(events).toEqual([]);
  });

  it('leaves an agent that has not ended, and one whose meta.json is missing or still unparsed', () => {
    // ACT
    const running = identityBackfill([RUN, JOB, ATTEMPT, SPAWNED], metaOf('write#2/reviewer'));
    const missing = identityBackfill(LOG, () => null);
    const unparsed = identityBackfill(LOG, metaOf('Spec review'));
    // ASSERT
    expect([running.events, missing.events, unparsed.events]).toEqual([[], [], []]);
  });

  it('leaves an agent that started parsed', () => {
    // ARRANGE
    const log = [RUN, JOB, ATTEMPT, { ...SPAWNED, role: 'reviewer' }, END];
    // ACT
    const { events } = identityBackfill(log, metaOf('write#2/reviewer'));
    // ASSERT
    expect(events).toEqual([]);
  });

  it('counts, and does not repair, an agent of an older Run, since the writer files lines under the newest Run', () => {
    // ARRANGE
    const older = LOG.map((l) => ({ ...l, trace_id: OLD_TRACE }));
    const newer = [{ ...RUN, seq: 6, t: '2026-10-15T09:00:00Z', trace_id: TRACE, span_id: ID(9) }];
    // ACT
    const result = identityBackfill([...older, ...newer], metaOf('write#2/reviewer'));
    // ASSERT
    expect(result).toEqual({ events: [], elsewhere: 1 });
  });
});
