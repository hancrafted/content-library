// decision: docs/adr/0007-pipeline-runs-are-logged-as-spans-in-append-only-jsonl.md
// decision: docs/adr/0010-run-log-lines-are-a-typed-union-with-point-events.md
export const KINDS = ['start-run', 'end-run', 'start', 'end', 'attrs', 'score', 'event'] as const;
export type Kind = (typeof KINDS)[number];

export const STATUSES = ['ok', 'error', 'refused', 'crashed', 'reused'] as const;
export type Status = (typeof STATUSES)[number];

export const VIAS = ['chat', 'commit'] as const;
export type Via = (typeof VIAS)[number];

export type SpanStatus = Status | 'running';

export const SPAN_TYPES = ['job', 'attempt', 'agent', 'gate'] as const;
export type SpanType = 'run' | (typeof SPAN_TYPES)[number];

export type Provenance = 'measured' | 'typed';

export const SUMMARY_MAX = 500;

export const PAYLOAD_MAX_BYTES = 2048;

export type Payload = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

export interface Envelope {
  t: string;
  seq: number;
  trace_id: string;
  payload?: Payload;
  payload_truncated?: true;
}

export const NOTE_TYPES = ['needs-human', 'blocked', 'research-gap', 'spine-change', 'no-library-match'] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

export const EVENT_NAMES = ['skill.invoke', 'file.read', 'instructions.load', 'note'] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export const EVENT_ATTRIBUTES = {
  'skill.invoke': { required: ['skill.name'], optional: [] },
  'file.read': { required: ['file.path'], optional: [] },
  'instructions.load': { required: ['file.path', 'load_reason'], optional: ['trigger_file.path', 'adr'] },
  note: { required: ['note.type', 'note.text'], optional: [] },
} as const satisfies Record<EventName, { required: readonly string[]; optional: readonly string[] }>;

export type EventAttributes = {
  [N in EventName]: Record<(typeof EVENT_ATTRIBUTES)[N]['required'][number], string> &
    Partial<Record<(typeof EVENT_ATTRIBUTES)[N]['optional'][number], string>>;
};

export interface LineFields {
  span_id: string;
  start_t: string;
  parent_span_id: string;
  type: SpanType;
  name: string;
  job: string;
  attempt: number;
  role: string;
  ticket: number;
  retry_of: string;
  link_trace_id: string;
  link_span_id: string;
  harness: string;
  source: string;
  description: string;
  transcript_path: string;
  request_shape: string;
  run_id: string;
  template_sha: string;
  branch: string;
  'gen_ai.operation.name': string;
  'gen_ai.agent.name': string;
  'gen_ai.request.model': string;
  'gen_ai.response.model': string;
  'gen_ai.input.messages': string;
  'gen_ai.usage.input_tokens': number;
  'gen_ai.usage.output_tokens': number;
  'gen_ai.usage.cache_read.input_tokens': number;
  skills_invoked: string[];
  status: Status;
  summary: string;
  value: number | string;
  rubric: string;
  body: string;
  via: Via;
  comment: string;
  attributes: EventAttributes[EventName];
}

type Key = keyof LineFields;

const END_FACTS = [
  'start_t',
  'gen_ai.input.messages',
  'summary',
  'source',
  'transcript_path',
  'gen_ai.response.model',
  'gen_ai.usage.input_tokens',
  'gen_ai.usage.output_tokens',
  'gen_ai.usage.cache_read.input_tokens',
  'skills_invoked',
] as const;
const IDENTITY = [
  'name',
  'job',
  'attempt',
  'role',
  'ticket',
  'parent_span_id',
  'description',
  'gen_ai.request.model',
] as const;

export const LINE_KEYS = {
  'start-run': {
    required: ['span_id', 'run_id', 'template_sha', 'harness', 'branch', 'gen_ai.request.model'],
    optional: ['name', 'source', 'gen_ai.operation.name'],
  },
  start: {
    required: ['span_id', 'type', 'name', 'parent_span_id'],
    optional: [
      'job',
      'attempt',
      'role',
      'ticket',
      'retry_of',
      'link_trace_id',
      'link_span_id',
      'harness',
      'source',
      'description',
      'transcript_path',
      'request_shape',
      'gen_ai.operation.name',
      'gen_ai.agent.name',
      'gen_ai.request.model',
      'gen_ai.input.messages',
    ],
  },
  'end-run': { required: ['span_id', 'status'], optional: END_FACTS },
  end: { required: ['span_id', 'status'], optional: [...END_FACTS, ...IDENTITY] },
  attrs: {
    required: ['span_id'],
    optional: [
      'source',
      'gen_ai.response.model',
      'gen_ai.usage.input_tokens',
      'gen_ai.usage.output_tokens',
      'gen_ai.usage.cache_read.input_tokens',
      'skills_invoked',
      ...IDENTITY,
    ],
  },
  score: { required: ['span_id', 'name', 'value', 'source'], optional: ['rubric', 'body', 'via', 'comment', 'ticket'] },
  event: { required: ['span_id', 'name', 'source', 'attributes'], optional: [] },
} as const satisfies Record<Kind, { required: readonly Key[]; optional: readonly Key[] }>;

type Required_<K extends Kind> = (typeof LINE_KEYS)[K]['required'][number];
type Optional_<K extends Kind> = (typeof LINE_KEYS)[K]['optional'][number];

type Exclusive<T> = T & Partial<Record<Exclude<Key, keyof T>, never>>;

type SpanLineOf<K extends Exclude<Kind, 'event'>> = Exclusive<
  Envelope & { kind: K } & Pick<LineFields, Required_<K>> & Partial<Pick<LineFields, Optional_<K>>>
>;

export type StartRunLine = SpanLineOf<'start-run'>;
export type StartLine = SpanLineOf<'start'>;
export type EndRunLine = SpanLineOf<'end-run'>;
export type EndLine = SpanLineOf<'end'>;
export type AttrsLine = SpanLineOf<'attrs'>;
export type ScoreLine = SpanLineOf<'score'>;
export type EventLine = {
  [N in EventName]: Exclusive<
    Envelope & { kind: 'event'; span_id: string; name: N; source: Provenance; attributes: EventAttributes[N] }
  >;
}[EventName];

export type RunLogLine = StartRunLine | StartLine | EndRunLine | EndLine | AttrsLine | ScoreLine | EventLine;

type Stamped = 't' | 'seq' | 'trace_id' | 'payload_truncated';
type RunFacts = 'run_id' | 'template_sha' | 'branch';
type InputOf<L> = L extends { kind: infer K }
  ? Omit<
      L,
      Stamped | (K extends 'start' | 'start-run' ? 'span_id' : never) | (K extends 'start-run' ? RunFacts : never)
    > &
      (K extends 'start-run' ? Partial<Pick<LineFields, RunFacts>> : unknown) & { t?: string }
  : never;

export type LogEvent = InputOf<RunLogLine>;

export type IdentityFacts = Partial<Pick<LineFields, (typeof IDENTITY)[number]>>;
