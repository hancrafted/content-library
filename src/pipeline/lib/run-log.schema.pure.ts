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
export interface Stamp {
  t: string;
  seq: number;
  traceId: string;
  spanId: string;
}

export type RecordResult = { ok: true; line: RunLogLine } | { ok: false; errors: string[] };

export interface Span {
  trace_id: string;
  span_id: string;
  parent_span_id: string | null;
  type: SpanType;
  name: string;
  status: SpanStatus;
  start_t: string;
  end_t: string | null;
  'duration_ms': number | null;
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
  events?: SpanEvent[];
}

export type SpanEvent = {
  [N in EventName]: { name: N; t: string; seq: number; attributes: EventAttributes[N] };
}[EventName];

export interface SkillUse {
  name: string;
  t: string;
  seq: number;
}

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
  orphans: RunLogLine[];
}

export interface FoldOptions {
  live?: ReadonlySet<string> | 'unfinished';
}
