// `fold`: turns run-log lines into spans and scores. `parseLog`: reads events.jsonl text into lines.

import type { Folded, FoldOptions, RunLogLine, Score, Span, SpanStatus, SpanType, Status } from './run-log.schema.pure.ts';

/** Oldest first by time, ties by sequence number. */
function chronological(lines: readonly RunLogLine[]): RunLogLine[] {
  return [...lines].sort((a, b) => Date.parse(a.t) - Date.parse(b.t) || a.seq - b.seq);
}

function openSpan(entry: RunLogLine, open: SpanStatus): Span {
  const { kind, t, seq, span_id, parent_span_id, type, name, ...attributes } = entry;
  const spanType = kind === 'start-run' ? 'run' : (type as SpanType);
  const base = { trace_id: entry.trace_id, span_id: span_id as string, parent_span_id: parent_span_id ?? null, type: spanType };
  return { ...attributes, ...base, name: name ?? (entry.run_id as string), status: open, start_t: t, end_t: null, duration_ms: null, summary: null, seq } as Span;
}

function scoreOf(entry: RunLogLine): Score {
  const { trace_id, span_id, t, seq, name, value, source, rubric, body, via, comment } = entry;
  const score = { trace_id, span_id, t, seq, name, value, source, rubric, body, via, comment };
  return Object.fromEntries(Object.entries(score).filter(([, v]) => v !== undefined)) as unknown as Score;
}

const NOT_ATTRIBUTES = new Set(['kind', 't', 'start_t', 'seq', 'span_id', 'trace_id', 'status', 'summary', 'source']);

/**
 * Closes a span with an end line. The span keeps its own `source`; the end line's fills it in only when the start gave none.
 * An end line may carry start facts the start could not measure: `start_t` replaces the stamped launch time, and
 * `gen_ai.input.messages` fills the prompt the start lacked.
 */
function closeSpan(span: Span, entry: RunLogLine): void {
  const attributes = Object.entries(entry).filter(([key]) => !NOT_ATTRIBUTES.has(key));
  if (entry.start_t !== undefined) span.start_t = entry.start_t;
  const end = { status: entry.status as Status, summary: entry.summary ?? null, end_t: entry.t, duration_ms: Date.parse(entry.t) - Date.parse(span.start_t) };
  Object.assign(span, Object.fromEntries(attributes), end);
  span.source ??= entry.source;
}

interface Accumulator {
  open: SpanStatus;
  live?: ReadonlySet<string>;
  spans: Map<string, Span>;
  scores: Score[];
  orphans: RunLogLine[];
}

/** What a start's span is until it ends: running in a live Run, else the fold's default for open spans. */
function openStatus(entry: RunLogLine, acc: Accumulator): SpanStatus {
  if (acc.live === undefined) return acc.open;
  return acc.live.has(entry.trace_id) ? 'running' : 'crashed';
}

function place(entry: RunLogLine, acc: Accumulator): void {
  const id = entry.span_id as string;
  if (entry.kind === 'start' || entry.kind === 'start-run') acc.spans.set(id, openSpan(entry, openStatus(entry, acc)));
  else if (entry.kind === 'score') acc.scores.push(scoreOf(entry));
  else if (acc.spans.has(id)) closeSpan(acc.spans.get(id) as Span, entry);
  else acc.orphans.push(entry);
}

/** The newest Run's `start-run` line (the last in log order), null when the log holds no Run. The one rule for "the current Run". */
export function currentRun(lines: readonly RunLogLine[]): RunLogLine | null {
  return [...lines].reverse().find((l) => l.kind === 'start-run') ?? null;
}

/** Folds lines into spans and scores. Input order does not matter: lines are sorted by `t`, then `seq`. */
export function fold(lines: readonly RunLogLine[], options: FoldOptions = {}): Folded {
  const acc: Accumulator = { open: 'crashed', live: options.live, spans: new Map(), scores: [], orphans: [] };
  for (const entry of chronological(lines)) place(entry, acc);
  return { spans: [...acc.spans.values()], scores: acc.scores, orphans: acc.orphans };
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
