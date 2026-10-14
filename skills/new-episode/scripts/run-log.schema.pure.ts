// The run event log's vocabulary: the kinds, statuses and field names of one JSONL line (design-ADR 0006), the
// stamp a writer supplies, and the Span and Score a reader folds lines into. Types only; import them through
// `run-log.pure.ts`.

export const KINDS = ['start-run', 'end-run', 'start', 'end', 'score'] as const;
export type Kind = (typeof KINDS)[number];

/** How a span ended. `reused` is a Job whose result an earlier Run already produced. */
export const STATUSES = ['ok', 'error', 'refused', 'crashed', 'reused'] as const;
export type Status = (typeof STATUSES)[number];

/** A span that has started and not ended, as `fold` reports it when asked to treat open spans as live. */
export type SpanStatus = Status | 'running';

/** Below the Run: a Job, one Attempt of a Job, an agent inside an Attempt, or a Gate waiting on Han. */
export const SPAN_TYPES = ['job', 'attempt', 'agent', 'gate'] as const;
export type SpanType = 'run' | (typeof SPAN_TYPES)[number];

/** Whether a number was measured by the harness or typed by the orchestrator. */
export type Provenance = 'measured' | 'typed';

/** The longest summary an end line may carry. */
export const SUMMARY_MAX = 500;

export const SCORE_NAMES = ['rubric', 'check', 'gate'] as const;

/** What an adapter or orchestrator wants written. Everything stamped (`t` aside) is added by `record`. */
export interface LogEvent {
  kind: Kind;
  /** Overrides the stamped clock: how an adapter reports a measured launch or end time. */
  t?: string;
  /** end, end-run and score: the span the line belongs to. */
  span_id?: string;
  /** end: the launch time, when the start line could not measure it (the transcript did not exist yet). */
  start_t?: string;
  /** start: the span this one nests under. Absent only on start-run. */
  parent_span_id?: string;
  type?: SpanType;
  name?: string;
  job?: string;
  attempt?: number;
  role?: string;
  ticket?: number;
  /** The span id of the Attempt this one retries. */
  retry_of?: string;
  harness?: string;
  /** start, end: measured or typed. On a score: who judged (`agent:<job>/reviewer`, `check:<name>`, `human:han`). */
  source?: string;
  description?: string;
  transcript_path?: string;
  /** start: how the harness launched the agent (Claude Code's `requestShape`, background or not). */
  request_shape?: string;
  run_id?: string;
  template_sha?: string;
  branch?: string;
  'gen_ai.operation.name'?: string;
  'gen_ai.agent.name'?: string;
  'gen_ai.request.model'?: string;
  'gen_ai.response.model'?: string;
  'gen_ai.input.messages'?: string;
  'gen_ai.usage.input_tokens'?: number;
  'gen_ai.usage.output_tokens'?: number;
  'gen_ai.usage.cache_read.input_tokens'?: number;
  status?: Status;
  summary?: string;
  /** score */
  value?: number | string;
  rubric?: string;
  body?: string;
  via?: 'chat' | 'commit';
  comment?: string;
}

/** What the writer computes: the clock, the line's sequence number, and fresh ids for a start. */
export interface Stamp {
  t: string;
  seq: number;
  traceId: string;
  spanId: string;
}

/** One line of events.jsonl. */
export type RunLogLine = LogEvent & { t: string; seq: number; trace_id: string };

export type RecordResult = { ok: true; line: RunLogLine } | { ok: false; errors: string[] };

/** One span with its start and end lines folded together. Attribute names are the lines' own. */
export interface Span {
  trace_id: string;
  span_id: string;
  parent_span_id: string | null;
  type: SpanType;
  name: string;
  status: SpanStatus;
  start_t: string;
  end_t: string | null;
  /** End minus start, in milliseconds; null while the span has no end. */
  duration_ms: number | null;
  summary: string | null;
  seq: number;
  job?: string;
  attempt?: number;
  role?: string;
  ticket?: number;
  retry_of?: string;
  harness?: string;
  source?: string;
  description?: string;
  transcript_path?: string;
  request_shape?: string;
  run_id?: string;
  template_sha?: string;
  branch?: string;
  'gen_ai.operation.name'?: string;
  'gen_ai.agent.name'?: string;
  'gen_ai.request.model'?: string;
  'gen_ai.response.model'?: string;
  'gen_ai.input.messages'?: string;
  'gen_ai.usage.input_tokens'?: number;
  'gen_ai.usage.output_tokens'?: number;
  'gen_ai.usage.cache_read.input_tokens'?: number;
}

/** One verdict on a span. Re-judging appends another; nothing is overwritten. */
export interface Score {
  trace_id: string;
  span_id: string;
  t: string;
  seq: number;
  name: string;
  value: number | string;
  source: string;
  rubric?: string;
  body?: string;
  via?: 'chat' | 'commit';
  comment?: string;
}

export interface Folded {
  spans: Span[];
  scores: Score[];
  /** End lines whose span never started: kept so a reader can flag them instead of losing them. */
  orphans: RunLogLine[];
}

export interface FoldOptions {
  /** What a span with no end line is when `live` is not given. `crashed` (the default), or `running`. */
  openAs?: 'crashed' | 'running';
  /** The trace ids of the Runs that are live now (see `liveTraces`): an open span is `running` only in one of them, else `crashed`. Decided per trace, so one Run ending never crashes another in the same file. */
  live?: ReadonlySet<string>;
}
