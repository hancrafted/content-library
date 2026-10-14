// The orchestrator's measured usage over a window of its transcripts: the one method end-run uses for the Run total
// (claude-adapter.pure.ts `runUsageEvent`) and end-job uses for a Job that ran in the orchestrator session. Pure.
import type { LogEvent, RunLogLine } from './run-log.pure.ts';
import { entries, modelOf, skillsInvoked, usageOf, type Entry } from './transcript.pure.ts';

/** The transcripts' entries from `from` to the end of `until`'s second. Line times are whole seconds, transcript times milliseconds. */
function inWindow(from: string, until: string, transcripts: readonly (string | null)[]): Entry[] {
  const [start, stop] = [Date.parse(from), Date.parse(until) + 1000];
  const inside = (e: Entry): boolean => {
    const at = e.timestamp === undefined ? Number.NaN : Date.parse(e.timestamp);
    return at >= start && at < stop;
  };
  return transcripts.flatMap((t) => entries(t)).filter(inside);
}

/** The usage in that window, summed over the sessions' transcripts; null when they report none. */
export function measuredUsage(
  from: string,
  until: string,
  transcripts: readonly (string | null)[],
): Partial<LogEvent> | null {
  const all = inWindow(from, until, transcripts);
  const usage = usageOf(all);
  if (Object.keys(usage).length === 0) return null;
  return { source: 'measured', 'gen_ai.response.model': modelOf(all), ...usage };
}

/**
 * The orchestrator's cost and skills for a Job that ran in its session (`session: orchestrator`): an `attrs` line
 * for the Job span with the usage spent between the Job's start and its end, and the skills invoked in that window
 * (omitted when the window holds no transcript entries, so "none" is never claimed without evidence). The Job's
 * single end line is untouched. Null when there is nothing to add.
 */
export function jobFactsEvent(
  span: { span_id: string; start_t: string },
  ended: RunLogLine,
  transcripts: readonly (string | null)[],
): LogEvent | null {
  const window = inWindow(span.start_t, ended.t, transcripts);
  const usage = measuredUsage(span.start_t, ended.t, transcripts);
  if (usage === null && window.length === 0) return null;
  return {
    kind: 'attrs',
    span_id: span.span_id,
    ...usage,
    ...(window.length > 0 && { skills_invoked: skillsInvoked(window) }),
  };
}
