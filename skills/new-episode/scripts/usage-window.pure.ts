// The orchestrator's measured usage over a window of its transcripts: the one method end-run uses for the Run total
// (claude-adapter.pure.ts `runUsageEvent`) and end-job uses for a Job that ran in the orchestrator session. Pure.
import type { LogEvent, RunLogLine } from './run-log.pure.ts';
import { entries, modelOf, usageOf, type Entry } from './transcript.pure.ts';

/** The usage from `from` to the end of `until`'s second, summed over the sessions' transcripts; null when they report none. */
export function measuredUsage(
  from: string,
  until: string,
  transcripts: readonly (string | null)[],
): Partial<LogEvent> | null {
  // Line times are whole seconds, transcript times milliseconds: the window runs to the end of the end line's second.
  const [start, stop] = [Date.parse(from), Date.parse(until) + 1000];
  const inside = (e: Entry): boolean => {
    const at = e.timestamp === undefined ? Number.NaN : Date.parse(e.timestamp);
    return at >= start && at < stop;
  };
  const all = transcripts.flatMap((t) => entries(t)).filter(inside);
  const usage = usageOf(all);
  if (Object.keys(usage).length === 0) return null;
  return { source: 'measured', 'gen_ai.response.model': modelOf(all), ...usage };
}

/**
 * The orchestrator's cost for a Job that ran in its session (`session: orchestrator`): a second `end` line for the
 * Job span that repeats the first one's status and summary and adds the usage spent between the Job's start and its
 * end. The latest end line wins when folded. Null when the transcripts report none.
 */
export function jobUsageEvent(
  span: { span_id: string; start_t: string },
  ended: RunLogLine,
  transcripts: readonly (string | null)[],
): LogEvent | null {
  const measured = measuredUsage(span.start_t, ended.t, transcripts);
  if (measured === null) return null;
  const event: LogEvent = { kind: 'end', span_id: span.span_id, status: ended.status, ...measured };
  if (ended.summary !== undefined) event.summary = ended.summary;
  return event;
}
