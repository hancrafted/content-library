import type { LogEvent, MeasuredFacts, RunLogLine } from './run-log.pure.ts';
import { entries, modelOf, skillsInvoked, usageOf, type Entry, type Usage } from './transcript.pure.ts';

function inWindow(from: string, until: string, transcripts: readonly (string | null)[]): Entry[] {
  const [start, stop] = [Date.parse(from), Date.parse(until) + 1000];
  const inside = (e: Entry): boolean => {
    const at = e.timestamp === undefined ? Number.NaN : Date.parse(e.timestamp);
    return at >= start && at < stop;
  };
  return transcripts.flatMap((t) => entries(t)).filter(inside);
}

export function measuredUsage(
  from: string,
  until: string,
  transcripts: readonly (string | null)[],
): (Pick<MeasuredFacts, 'source' | 'gen_ai.response.model'> & Usage) | null {
  const all = inWindow(from, until, transcripts);
  const usage = usageOf(all);
  if (Object.keys(usage).length === 0) return null;
  return { source: 'measured', 'gen_ai.response.model': modelOf(all), ...usage };
}

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
