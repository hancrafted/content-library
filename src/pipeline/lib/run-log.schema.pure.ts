// The run event log's reader shapes: the stamp a writer supplies and the Span and Score a reader folds lines into. The
// line contract itself is `run-log-line.schema.pure.ts`, re-exported here. Types only; import them through `run-log.pure.ts`.
import type {
  EventAttributes,
  EventName,
  LineFields,
  RunLogLine,
  SpanStatus,
  SpanType,
  Via,
} from './run-log-line.schema.pure.ts';

export * from './run-log-line.schema.pure.ts';

/** Measured facts an end, end-run or attrs line may carry, as an adapter assembles them before choosing the kind. */
export type MeasuredFacts = Partial<
  Pick<
    LineFields,
    | 'source'
    | 'start_t'
    | 'transcript_path'
    | 'gen_ai.input.messages'
    | 'gen_ai.request.model'
    | 'gen_ai.response.model'
    | 'gen_ai.usage.input_tokens'
    | 'gen_ai.usage.output_tokens'
    | 'gen_ai.usage.cache_read.input_tokens'
    | 'skills_invoked'
  >
>;
/** What the writer computes: the clock, the line's sequence number, and fresh ids for a start. */
export interface Stamp {
  t: string;
  seq: number;
  traceId: string;
  spanId: string;
}

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
  /** The `event` lines on this span, oldest first: what it did so far, live. Absent when it has none yet. */
  events?: SpanEvent[];
}

/** One `event` line as the fold attaches it to its span. */
export type SpanEvent = {
  [N in EventName]: { name: N; t: string; seq: number; attributes: EventAttributes[N] };
}[EventName];

/** One `skill.invoke` event on a span: the skill's name (`plugin:skill` for a plugin's) and when. */
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
  /** End, attrs and event lines whose span never started: kept so a reader can flag them instead of losing them. */
  orphans: RunLogLine[];
}

export interface FoldOptions {
  /** Live trace ids, or `unfinished` to infer them from Runs with no end. An ended Run always crashes its open spans. Omitted: open spans are crashed. */
  live?: ReadonlySet<string> | 'unfinished';
}
