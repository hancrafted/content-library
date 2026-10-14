// The Run's two bookkeeping artifacts, built from the log's lines: the `.scratch/active-run` marker the Claude Code
// adapter reads (see `Marker` in claude-adapter.pure.ts) and the archive path a log is copied to at Promotion.
// Pure: `run-state.ts` reads the disk and the session id and calls these.
import type { RunLogLine } from './run-log.pure.ts';

const newest = (lines: readonly RunLogLine[], pick: (l: RunLogLine) => boolean): RunLogLine | undefined => [...lines].reverse().find(pick);

function runOf(lines: readonly RunLogLine[]): RunLogLine & { run_id: string } {
  const run = newest(lines, (l) => l.kind === 'start-run');
  if (run?.run_id === undefined) throw new Error('the log has no start-run line; log kind "start-run" first');
  return run as RunLogLine & { run_id: string };
}

export interface MarkerInput {
  log: string;
  sessionId: string;
  lines: readonly RunLogLine[];
  /** The orchestrator-session Job span that agents with an unparsed description join; default the newest Job start. */
  jobSpanId?: string;
}

/** The marker file's text: the log path, the orchestrator's session, the newest Run's trace and a Job span. */
export function markerText({ log, sessionId, lines, jobSpanId }: MarkerInput): string {
  const run = runOf(lines);
  const job = jobSpanId ?? newest(lines, (l) => l.kind === 'start' && l.type === 'job' && l.trace_id === run.trace_id)?.span_id;
  if (job === undefined) throw new Error('the log has no Job span; log the Job\'s "start" line first');
  return `${JSON.stringify({ log, session_id: sessionId, trace_id: run.trace_id, job_span_id: job })}\n`;
}

/** Where Promotion copies an Episode's log: one file per Run, under the Episode's folder. */
export function archiveTarget(slug: string, lines: readonly RunLogLine[]): string {
  return `.logs/new-episode/${slug}/${runOf(lines).run_id}.jsonl`;
}
