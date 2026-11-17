import type { Folded, RunLogLine, Span } from './run-log.schema.pure.ts';

export function currentRun(lines: readonly RunLogLine[]): RunLogLine | null {
  return [...lines].reverse().find((l) => l.kind === 'start-run') ?? null;
}

export function latestRun(folded: Folded): Span | undefined {
  return folded.spans.filter((span) => span.type === 'run').at(-1);
}
