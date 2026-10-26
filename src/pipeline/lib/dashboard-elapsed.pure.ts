import type { DashboardJob } from './dashboard-projection.pure';
import { agentState } from './dashboard-stages.pure';
import type { Span } from './run-log.schema.pure';

export interface Elapsed {
  ms: number;
  /** True while the span is still running at the moment shown: the count is so far, not final. */
  open: boolean;
}

/**
 * How long a span ran as of `now` (epoch milliseconds, the cutoff or the last read): its measured duration once
 * ended; while running, from its start to `now`; null for a span left open without running, which has no duration.
 */
export function spanElapsed(span: Span, now: number): Elapsed | null {
  if (span.duration_ms !== null) return { ms: span.duration_ms, open: false };
  if (span.status !== 'running') return null;
  return { ms: Math.max(0, now - Date.parse(span.start_t)), open: true };
}

/** An agent's elapsed time; an agent unclosed under an ended Job or Attempt is not counted as running. */
export function agentElapsed(job: DashboardJob, agent: Span, now: number): Elapsed | null {
  return agentState(job, agent) === 'unclosed' ? null : spanElapsed(agent, now);
}
