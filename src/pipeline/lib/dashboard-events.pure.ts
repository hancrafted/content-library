import { parseDescription } from './episode-spawn-description.pure';
import type { RunLogLine } from './run-log.schema.pure';

export interface DashboardEvent {
  number: number;
  raw: string;
  line?: RunLogLine;
  error?: string;
}

export interface EventScope {
  jobs?: readonly string[];
  ticket?: number;
}

function startLines(events: readonly DashboardEvent[]) {
  return new Map(
    events.flatMap(({ line }) =>
      line && (line.kind === 'start' || line.kind === 'start-run')
        ? [[`${line.trace_id}:${line.span_id}`, line] as const]
        : [],
    ),
  );
}

function ticketOf(line: RunLogLine): number | undefined {
  if (line.ticket !== undefined) return line.ticket;
  const parsed = parseDescription(line.description ?? '');
  return parsed && parsed.job === line.job ? parsed.ticket : undefined;
}

function eventOwner(line: RunLogLine, starts: ReadonlyMap<string, RunLogLine>) {
  let current = starts.get(`${line.trace_id}:${line.span_id}`);
  const owner: { job?: string; ticket?: number } = {};
  const seen = new Set<RunLogLine>();
  while (current && !seen.has(current)) {
    seen.add(current);
    owner.job ??= current.job;
    if (!owner.job && current.type === 'job') owner.job = current.name;
    owner.ticket ??= ticketOf(current);
    current = starts.get(`${line.trace_id}:${current.parent_span_id}`);
  }
  return owner;
}

function matchesScope(owner: { job?: string; ticket?: number }, scope: EventScope): boolean {
  const jobMatches = scope.jobs === undefined || scope.jobs.includes(owner.job ?? '');
  return jobMatches && (scope.ticket === undefined || owner.ticket === scope.ticket);
}

function eventOrder(event: DashboardEvent): [number, number] {
  return event.line ? [Date.parse(event.line.t), event.line.seq] : [Number.MAX_SAFE_INTEGER, event.number];
}

/** Selects original events, not reconstructed spans, so every retry and verdict remains inspectable. */
export function selectEvents(events: readonly DashboardEvent[], scope: EventScope = {}): DashboardEvent[] {
  const starts = startLines(events);
  const matches = ({ line }: DashboardEvent): boolean => {
    if (scope.jobs === undefined && scope.ticket === undefined) return true;
    return line !== undefined && matchesScope(eventOwner(line, starts), scope);
  };
  return events.filter(matches).sort((a, b) => {
    const [at, as] = eventOrder(a);
    const [bt, bs] = eventOrder(b);
    return at - bt || as - bs || a.number - b.number;
  });
}
