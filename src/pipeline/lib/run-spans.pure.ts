// Span lookups the run commands share: the latest span matching a rule, the open span of a type, and the span a Score
// names. Pure over the folded spans of one Run.
import type { RunLogLine, Span } from './run-log.pure.ts';

/** The span with the highest seq among those matching, if any. */
export const latest = (spans: readonly Span[], match: (s: Span) => boolean): Span | undefined =>
  spans.filter(match).sort((a, b) => b.seq - a.seq)[0];

export const isOpen = (s: Span): boolean => s.end_t === null;

/** The latest open span of a type, narrowed by Job id or name. */
export const openSpan = (
  spans: readonly Span[],
  type: Span['type'],
  by: { job?: string; name?: string } = {},
): Span | undefined =>
  latest(
    spans,
    (s) =>
      s.type === type &&
      isOpen(s) &&
      (by.job === undefined || s.job === by.job) &&
      (by.name === undefined || s.name === by.name),
  );

/** The span a Score names: a Job by its id, an Attempt as `<job>#<n>`, a Gate as `gate:<name>`; the latest, ended or not. */
export function scoreTarget(spans: readonly Span[], target: string): Span | undefined {
  const gate = /^gate:(.+)$/.exec(target);
  const attempt = /^(.+)#([1-9]\d*)$/.exec(target);
  if (gate) return latest(spans, (s) => s.type === 'gate' && s.name === gate[1]);
  if (attempt)
    return latest(spans, (s) => s.type === 'attempt' && s.job === attempt[1] && s.attempt === Number(attempt[2]));
  return latest(spans, (s) => s.type === 'job' && s.job === target);
}

/** Whether the Run whose start-run line is `run` has an end-run line. */
export const hasEnded = (lines: readonly RunLogLine[], run: RunLogLine): boolean =>
  lines.some((l) => l.kind === 'end-run' && l.trace_id === run.trace_id);

/** The spans of a Run, the Run itself aside, that have no end line yet. */
export const openUnderRun = (spans: readonly Span[]): Span[] => spans.filter((s) => s.type !== 'run' && isOpen(s));

/** The agent spans still open under an Attempt. */
export const openAgentsOf = (spans: readonly Span[], attempt: Span): Span[] =>
  spans.filter((s) => s.type === 'agent' && isOpen(s) && s.parent_span_id === attempt.span_id);
