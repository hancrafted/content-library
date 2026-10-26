import { describe, expect, it } from 'vitest';
import { agentElapsed, spanElapsed } from './dashboard-elapsed.pure';
import type { DashboardJob } from './dashboard-projection.pure';
import type { Span } from './run-log.schema.pure';

const START = Date.parse('2026-10-14T10:00:00Z');
const minutes = (count: number) => count * 60_000;
const iso = (count: number) => new Date(START + minutes(count)).toISOString();

function span(fields: Partial<Span>): Span {
  return {
    trace_id: 'trace',
    span_id: 'span',
    parent_span_id: 'job',
    type: 'agent',
    name: 'agent',
    status: 'running',
    start_t: iso(0),
    end_t: null,
    duration_ms: null,
    summary: null,
    seq: 1,
    ...fields,
  };
}

function job(fields: Partial<DashboardJob>): DashboardJob {
  return {
    id: 'draft',
    needs: [],
    wants: [],
    outputs: [],
    checks: [],
    gate: false,
    retries: 1,
    config: [],
    state: 'running',
    span: span({ span_id: 'job', type: 'job', parent_span_id: 'run' }),
    attempts: [],
    agents: [],
    gates: [],
    scores: [],
    ...fields,
  } as DashboardJob;
}

describe('success cases', () => {
  it('gives an ended span its measured duration, whatever the moment shown', () => {
    // ARRANGE
    const ended = span({ status: 'ok', end_t: iso(7), duration_ms: minutes(7) });
    const expected = { ms: minutes(7), open: false };
    // ACT
    const elapsed = spanElapsed(ended, START + minutes(30));
    // ASSERT
    expect(elapsed).toEqual(expected);
  });

  it('counts a running span from its start to the moment shown', () => {
    // ARRANGE
    const running = span({ start_t: iso(2) });
    const expected = { ms: minutes(10), open: true };
    // ACT
    const elapsed = spanElapsed(running, START + minutes(12));
    // ASSERT
    expect(elapsed).toEqual(expected);
  });

  it('counts a running agent of an open Job like any running span', () => {
    // ARRANGE
    const agent = span({ start_t: iso(1) });
    const expected = { ms: minutes(4), open: true };
    // ACT
    const elapsed = agentElapsed(job({ agents: [agent] }), agent, START + minutes(5));
    // ASSERT
    expect(elapsed).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('measures nothing for a span left open by an ended Run', () => {
    // ARRANGE
    const crashed = span({ status: 'crashed' });
    // ACT
    const elapsed = spanElapsed(crashed, START + minutes(5));
    // ASSERT
    expect(elapsed).toBeNull();
  });

  it('measures nothing for an agent unclosed under an ended Job', () => {
    // ARRANGE
    const agent = span({});
    const ended = job({
      state: 'ok',
      span: span({ span_id: 'job', type: 'job', status: 'ok', end_t: iso(3), duration_ms: minutes(3) }),
      agents: [agent],
    });
    // ACT
    const elapsed = agentElapsed(ended, agent, START + minutes(5));
    // ASSERT
    expect(elapsed).toBeNull();
  });
});

describe('edge cases', () => {
  it('counts zero for a moment before a running span started', () => {
    // ARRANGE
    const running = span({ start_t: iso(5) });
    const expected = { ms: 0, open: true };
    // ACT
    const elapsed = spanElapsed(running, START);
    // ASSERT
    expect(elapsed).toEqual(expected);
  });
});
