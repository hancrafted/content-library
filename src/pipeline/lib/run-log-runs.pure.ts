// Which Run a reader means. Two rules, kept side by side because they differ when a log holds Runs out of order.

import type { Folded, RunLogLine, Span } from './run-log.schema.pure.ts';

/** The newest Run's `start-run` line, the last in log order; null when the log holds no Run. */
export function currentRun(lines: readonly RunLogLine[]): RunLogLine | null {
  return [...lines].reverse().find((l) => l.kind === 'start-run') ?? null;
}

/** The Run started latest, by time then sequence, as the fold orders spans; undefined before any Run starts. */
export function latestRun(folded: Folded): Span | undefined {
  return folded.spans.filter((span) => span.type === 'run').at(-1);
}
