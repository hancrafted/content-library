// `fold`: turns run-log lines into spans and scores. `parseLog`: reads events.jsonl text into lines.

import type {
  Folded,
  FoldOptions,
  RunLogLine,
  Score,
  SkillUse,
  Span,
  SpanEvent,
  SpanStatus,
  SpanType,
  Status,
} from './run-log.schema.pure.ts';

/** Oldest first by time, ties by sequence number. */
export function order(a: { t: string; seq: number }, b: { t: string; seq: number }): number {
  return Date.parse(a.t) - Date.parse(b.t) || a.seq - b.seq;
}

function chronological(lines: readonly RunLogLine[]): RunLogLine[] {
  return [...lines].sort(order);
}

/** Line keys a reader may display and never derives span state from. */
const DISPLAY_ONLY = new Set(['payload', 'payload_truncated']);

function openSpan(entry: RunLogLine, open: SpanStatus): Span {
  const { kind, t, seq, span_id, parent_span_id, type, name, ...rest } = entry;
  const attributes = Object.fromEntries(Object.entries(rest).filter(([key]) => !DISPLAY_ONLY.has(key)));
  const spanType = kind === 'start-run' ? 'run' : (type as SpanType);
  const base = {
    trace_id: entry.trace_id,
    span_id: span_id as string,
    parent_span_id: parent_span_id ?? null,
    type: spanType,
  };
  return {
    ...attributes,
    ...base,
    name: name ?? (entry.run_id as string),
    status: open,
    start_t: t,
    end_t: null,
    duration_ms: null,
    summary: null,
    seq,
  } as Span;
}

function scoreOf(entry: RunLogLine): Score {
  const { trace_id, span_id, t, seq, name, value, source, rubric, body, via, comment, ticket } = entry;
  const score = { trace_id, span_id, t, seq, name, value, source, rubric, body, via, comment, ticket };
  return Object.fromEntries(Object.entries(score).filter(([, v]) => v !== undefined)) as unknown as Score;
}

/** Line keys that are not span attributes. A payload is display-only, so it never becomes one either. */
const NOT_ATTRIBUTES = new Set([
  'kind',
  't',
  'start_t',
  'seq',
  'span_id',
  'trace_id',
  'status',
  'summary',
  'source',
  'payload',
  'payload_truncated',
]);

/**
 * Closes a span with an end line. The span keeps its own `source`; the end line's fills it in only when the start gave none.
 * An end line may carry start facts the start could not measure: `start_t` replaces the stamped launch time, and
 * `gen_ai.input.messages` fills the prompt the start lacked.
 */
function closeSpan(span: Span, entry: RunLogLine): void {
  const attributes = Object.entries(entry).filter(([key]) => !NOT_ATTRIBUTES.has(key));
  if (entry.start_t !== undefined) span.start_t = entry.start_t;
  const end = {
    status: entry.status as Status,
    summary: entry.summary ?? null,
    end_t: entry.t,
    duration_ms: Date.parse(entry.t) - Date.parse(span.start_t),
  };
  Object.assign(span, Object.fromEntries(attributes), end);
  span.source ??= entry.source;
}

/** An attrs line: facts laid over a span, leaving how it ended as it was. Its `source` fills in only when the span has none. */
function applyAttributes(span: Span, entry: RunLogLine): void {
  Object.assign(span, Object.fromEntries(Object.entries(entry).filter(([key]) => !NOT_ATTRIBUTES.has(key))));
  span.source ??= entry.source;
}

interface Accumulator {
  live?: FoldOptions['live'];
  spans: Map<string, Span>;
  starts: Map<string, RunLogLine>;
  ends: Map<string, RunLogLine>;
  endFacts: Map<string, Map<string, RunLogLine>>;
  scores: Score[];
  events: Map<string, SpanEvent[]>;
  orphans: RunLogLine[];
}

function rebuildSpan(id: string, entry: RunLogLine, acc: Accumulator): void {
  const start = acc.starts.get(id);
  const end = acc.ends.get(id);
  if (start === undefined) {
    acc.orphans.push(entry);
    return;
  }
  const span = openSpan(start, 'crashed');
  const facts = acc.endFacts.get(id) ?? new Map<string, RunLogLine>();
  const values = Object.fromEntries([...facts].map(([key, line]) => [key, line[key as keyof RunLogLine]]));
  if (end !== undefined) closeSpan(span, { ...end, ...values });
  else applyAttributes(span, { ...start, ...values });
  acc.spans.set(id, span);
  acc.orphans = acc.orphans.filter((orphan) => orphan.span_id !== id);
}

/** An event line joins its span's events; until that span has started it waits among the orphans. */
function placeEvent(id: string, entry: RunLogLine & { kind: 'event' }, acc: Accumulator): void {
  const { name, t, seq, attributes } = entry;
  acc.events.set(id, [...(acc.events.get(id) ?? []), { name, t, seq, attributes } as SpanEvent]);
  if (!acc.spans.has(id)) acc.orphans.push(entry);
}

function place(entry: RunLogLine, acc: Accumulator): void {
  if (entry.kind === 'score') {
    acc.scores.push(scoreOf(entry));
    return;
  }
  const id = entry.span_id as string;
  if (entry.kind === 'event') {
    placeEvent(id, entry, acc);
    return;
  }
  if (entry.kind === 'start' || entry.kind === 'start-run') {
    const known = acc.starts.get(id);
    if (known !== undefined && order(entry, known) < 0) return;
    acc.starts.set(id, entry);
  } else rememberEnd(id, entry, acc);
  rebuildSpan(id, entry, acc);
}

function rememberFact(key: string, entry: RunLogLine, facts: Map<string, RunLogLine>): void {
  const previous = facts.get(key);
  const precedence = previous === undefined ? 1 : order(entry, previous);
  if (previous === undefined || (key === 'source' ? precedence < 0 : precedence >= 0)) facts.set(key, entry);
}

function rememberEnd(id: string, entry: RunLogLine, acc: Accumulator): void {
  const known = acc.ends.get(id);
  if (entry.kind !== 'attrs' && (known === undefined || order(entry, known) >= 0)) acc.ends.set(id, entry);
  const facts = acc.endFacts.get(id) ?? new Map<string, RunLogLine>();
  const keys = Object.keys(entry).filter(
    (key) => !NOT_ATTRIBUTES.has(key) || (key === 'start_t' && entry.kind !== 'attrs') || key === 'source',
  );
  keys.forEach((key) => rememberFact(key, entry, facts));
  acc.endFacts.set(id, facts);
}

/** The skills a span invoked so far, oldest first: its `skill.invoke` events. */
export function skillUses(span: Pick<Span, 'events'>): SkillUse[] {
  return (span.events ?? []).flatMap((event) =>
    event.name === 'skill.invoke' ? [{ name: event.attributes['skill.name'], t: event.t, seq: event.seq }] : [],
  );
}

/** The newest Run's `start-run` line (the last in log order), null when the log holds no Run. The one rule for "the current Run". */
export function currentRun(lines: readonly RunLogLine[]): RunLogLine | null {
  return [...lines].reverse().find((l) => l.kind === 'start-run') ?? null;
}

/** Folds lines into spans and scores. Input order does not matter: lines are sorted by `t`, then `seq`; every start is placed before any end or score, so an end links to its start by `span_id` even when its `t` is earlier. */
export function fold(lines: readonly RunLogLine[], options: FoldOptions = {}): Folded {
  const log = createLogFold(options);
  log.append(lines);
  return log.snapshot();
}

function snapshot(acc: Accumulator): Folded {
  const runs = [...acc.spans.values()].filter((span) => span.type === 'run');
  const live =
    acc.live === 'unfinished'
      ? new Set(runs.filter((span) => span.end_t === null).map((span) => span.trace_id))
      : new Set(acc.live);
  for (const run of runs) {
    if (run.end_t !== null) live.delete(run.trace_id);
  }
  const spans = [...acc.spans.values()]
    .sort((a, b) => order(acc.starts.get(a.span_id)!, acc.starts.get(b.span_id)!))
    .map((span) => ({
      ...span,
      ...(acc.events.has(span.span_id) && { events: [...acc.events.get(span.span_id)!].sort(order) }),
      ...(span.end_t === null ? { status: live.has(span.trace_id) ? ('running' as const) : ('crashed' as const) } : {}),
    }));
  return {
    spans,
    scores: [...acc.scores].sort(order).map((score) => ({ ...score })),
    orphans: chronological(acc.orphans),
  };
}

/** An append-only fold. Appending applies only the supplied lines; snapshots never replay log history. */
export function createLogFold(options: FoldOptions = {}) {
  const acc: Accumulator = {
    live: options.live,
    spans: new Map(),
    starts: new Map(),
    ends: new Map(),
    endFacts: new Map(),
    scores: [],
    events: new Map(),
    orphans: [],
  };
  return {
    append(lines: readonly RunLogLine[]): void {
      for (const entry of chronological(lines)) place(entry, acc);
    },
    snapshot(): Folded {
      return snapshot(acc);
    },
  };
}

function parseLine(raw: string): RunLogLine | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? (parsed as RunLogLine) : null;
  } catch {
    return null;
  }
}

/** Parses events.jsonl text. A line that is not a JSON object is reported with its 1-based line number, never dropped silently. */
export function parseLog(text: string): { lines: RunLogLine[]; errors: string[] } {
  const lines: RunLogLine[] = [];
  const errors: string[] = [];
  text.split('\n').forEach((raw, index) => {
    if (raw.trim() === '') return;
    const parsed = parseLine(raw);
    if (parsed === null) errors.push(`line ${index + 1} is not a JSON object`);
    else lines.push(parsed);
  });
  return { lines, errors };
}
