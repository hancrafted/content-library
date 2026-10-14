// The run event log's vocabulary: the kinds, statuses and field names of one JSONL line (design-ADR 0007), the
// stamp a writer supplies, and the Span and Score a reader folds lines into. Types only; import them through
// `run-log.pure.ts`.

/**
 * `attrs` lays facts over a span that already ended (the backfill's identity, an orchestrator Job's usage and skills); it
 * never closes or reopens a span. `skill` is one Skill tool call, a point record on the span that made it (design-ADR-0009).
 */
export const KINDS = ['start-run', 'end-run', 'start', 'end', 'attrs', 'score', 'skill'] as const;
export type Kind = (typeof KINDS)[number];

/** How a span ended. `reused` is a Job whose result an earlier Run already produced. */
export const STATUSES = ['ok', 'error', 'refused', 'crashed', 'reused'] as const;
export type Status = (typeof STATUSES)[number];

/** How a human's approval reached the log. */
export const VIAS = ['chat', 'commit'] as const;
export type Via = (typeof VIAS)[number];

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
  /** end, end-run, attrs, score and skill: the span the line belongs to. */
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
  /** start of a `reused` Job: the earlier Run's ok Job span it stands for (OpenTelemetry span link). */
  link_trace_id?: string;
  link_span_id?: string;
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
  /** end, attrs: the skills the agent (or the orchestrator, inside a Job's window) invoked with the Skill tool, `plugin:skill` for a plugin's. An empty list means none were. */
  skills_invoked?: string[];
  status?: Status;
  summary?: string;
  /** score (`ticket` is the one above: the ticket a Score judges) */
  value?: number | string;
  rubric?: string;
  body?: string;
  via?: Via;
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
  link_trace_id?: string;
  link_span_id?: string;
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
  skills_invoked?: string[];
  /** The `skill` lines on this span, oldest first: what it invoked so far, live. Absent when it has none yet. */
  skills?: SkillUse[];
}

/** One `skill` line as the fold attaches it to its span: the skill's name (`plugin:skill` for a plugin's) and when. */
export interface SkillUse {
  name: string;
  t: string;
  seq: number;
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
  via?: Via;
  comment?: string;
  ticket?: number;
}

export interface Folded {
  spans: Span[];
  scores: Score[];
  /** End, attrs and skill lines whose span never started: kept so a reader can flag them instead of losing them. */
  orphans: RunLogLine[];
}

export interface FoldOptions {
  /** Live trace ids, or `unfinished` to infer them from Runs with no end. An ended Run always crashes its open spans. Omitted: open spans are crashed. */
  live?: ReadonlySet<string> | 'unfinished';
}
