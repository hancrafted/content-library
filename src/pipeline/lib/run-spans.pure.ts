import type { RunLogLine, Span } from './run-log.pure.ts';

export const latest = (spans: readonly Span[], match: (s: Span) => boolean): Span | undefined =>
  spans.filter(match).sort((a, b) => b.seq - a.seq)[0];

export const isOpen = (s: Span): boolean => s.end_t === null;

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

export function scoreTarget(spans: readonly Span[], target: string): Span | undefined {
  const gate = /^gate:(.+)$/.exec(target);
  const attempt = /^(.+)#([1-9]\d*)$/.exec(target);
  if (gate) return latest(spans, (s) => s.type === 'gate' && s.name === gate[1]);
  if (attempt)
    return latest(spans, (s) => s.type === 'attempt' && s.job === attempt[1] && s.attempt === Number(attempt[2]));
  return latest(spans, (s) => s.type === 'job' && s.job === target);
}

export const hasEnded = (lines: readonly RunLogLine[], run: RunLogLine): boolean =>
  lines.some((l) => l.kind === 'end-run' && l.trace_id === run.trace_id);

export const openUnderRun = (spans: readonly Span[]): Span[] => spans.filter((s) => s.type !== 'run' && isOpen(s));

export const openAgentsOf = (spans: readonly Span[], attempt: Span): Span[] =>
  spans.filter((s) => s.type === 'agent' && isOpen(s) && s.parent_span_id === attempt.span_id);
