import type { RunLogLine } from './run-log.pure.ts';

export function unclaimedAgents(log: readonly RunLogLine[], trace: string): RunLogLine[] {
  const ended = new Set(log.filter((l) => l.kind === 'end').map((l) => l.span_id));
  return log.filter(
    (l) =>
      l.kind === 'start' &&
      l.type === 'agent' &&
      l.trace_id === trace &&
      l.transcript_path === undefined &&
      !ended.has(l.span_id),
  );
}

export function openedByCommand(
  log: readonly RunLogLine[],
  trace: string,
  description: string,
): RunLogLine | undefined {
  return unclaimedAgents(log, trace).find((l) => description !== '' && l.name === description);
}
