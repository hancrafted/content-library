// The agent spans `begin-agent` filed that the Claude Code adapter has not claimed with a transcript yet (issue #227).
import type { RunLogLine } from './run-log.pure.ts';

/** The open agent spans `begin-agent` filed that no adapter has claimed with a transcript yet. */
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

/** The agent span `begin-agent` opened for this spawn description and no adapter has claimed yet: harness detail joins it. */
export function openedByCommand(
  log: readonly RunLogLine[],
  trace: string,
  description: string,
): RunLogLine | undefined {
  return unclaimedAgents(log, trace).find((l) => description !== '' && l.name === description);
}
