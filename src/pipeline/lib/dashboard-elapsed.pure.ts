import type { DashboardJob } from './dashboard-projection.pure';
import { agentState } from './dashboard-stages.pure';
import type { Span } from './run-log.schema.pure';

export interface Elapsed {
  ms: number;
  open: boolean;
}

export function spanElapsed(span: Span, now: number): Elapsed | null {
  if (span.duration_ms !== null) return { ms: span.duration_ms, open: false };
  if (span.status !== 'running') return null;
  return { ms: Math.max(0, now - Date.parse(span.start_t)), open: true };
}

export function agentElapsed(job: DashboardJob, agent: Span, now: number): Elapsed | null {
  return agentState(job, agent) === 'unclosed' ? null : spanElapsed(agent, now);
}
