// The run event log's line contract (design-ADR-0007, design-ADR-0010): one JSONL line is a discriminated union on
// `kind`, a shared envelope plus the typed keys of its kind plus an optional `payload` of harness extras. The key lists
// below are the single source of truth: the line types are derived from them and `record` validates against them.
// Types and constants only; import them through `run-log.pure.ts` (or `run-log.schema.pure.ts`).

/**
 * `attrs` lays facts over a span that already ended (the backfill's identity, an orchestrator Job's usage and skills); it
 * never closes or reopens a span. `event` is a point fact on a span (an OpenTelemetry span event), named from EVENT_NAMES.
 */
export const KINDS = ['start-run', 'end-run', 'start', 'end', 'attrs', 'score', 'event'] as const;
export type Kind = (typeof KINDS)[number];

/** How a span ended. `reused` is a Job whose result an earlier Run already produced. */
export const STATUSES = ['ok', 'error', 'refused', 'crashed', 'reused'] as const;
export type Status = (typeof STATUSES)[number];

/** How a human's approval reached the log. */
export const VIAS = ['chat', 'commit'] as const;
export type Via = (typeof VIAS)[number];

/** A span that has started and not ended, as `fold` reports it when asked to treat open spans as live. */
export type SpanStatus = Status | 'running';

/** Below the Run: a Job, one Attempt of a Job, an agent inside an Attempt, or a Gate waiting on the user. */
export const SPAN_TYPES = ['job', 'attempt', 'agent', 'gate'] as const;
export type SpanType = 'run' | (typeof SPAN_TYPES)[number];

/** Whether a number was measured by the harness or typed by the orchestrator. */
export type Provenance = 'measured' | 'typed';

/** The longest summary an end line may carry. */
export const SUMMARY_MAX = 500;

/** The largest `payload`, in UTF-8 bytes of its JSON; a larger one is dropped and the line says `payload_truncated`. */
export const PAYLOAD_MAX_BYTES = 2048;

export const SCORE_NAMES = ['rubric', 'check', 'gate'] as const;

/**
 * Harness extras that fit no typed key, namespaced by harness (`{ claude_code: { memory_type: 'Project' } }`). A reader
 * may display them and never derives state from them.
 */
export type Payload = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

/** What every line carries whatever its kind. `t`, `seq` and `trace_id` are stamped by the writer. */
export interface Envelope {
  t: string;
  seq: number;
  trace_id: string;
  payload?: Payload;
  /** Set by the writer when the event's payload exceeded PAYLOAD_MAX_BYTES and was dropped. */
  payload_truncated?: true;
}

/** What a note on a Job says: where a human is needed, what blocked, what research went without, a spine change, a Slide with no library match. */
export const NOTE_TYPES = ['needs-human', 'blocked', 'research-gap', 'spine-change', 'no-library-match'] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

/** The point facts an `event` line may record. */
export const EVENT_NAMES = ['skill.invoke', 'file.read', 'instructions.load', 'note'] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/**
 * The typed attributes of each event name, OpenTelemetry semantic-convention names where one exists. Paths are
 * repo-relative. `skill.name` is `plugin:skill` for a plugin's. `load_reason` is the harness's word for why it loaded
 * an instruction file; `adr` is the Archgate ADR (`GEN-002-adr-symlink-claude-rules`) a rule file resolves to.
 */
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

/** Every typed key a line may carry beyond its envelope and `kind`, with its value type. Which kind takes which: LINE_KEYS. */
export interface LineFields {
  /** The span the line opens (start, start-run) or belongs to (every other kind). */
  span_id: string;
  /** end: the launch time, when the start line could not measure it (the transcript did not exist yet). */
  start_t: string;
  /** start: the span this one nests under. */
  parent_span_id: string;
  type: SpanType;
  /** A span's or a score's name; on an event, its EventName. */
  name: string;
  job: string;
  attempt: number;
  role: string;
  ticket: number;
  /** The span id of the Attempt this one retries. */
  retry_of: string;
  /** start of a `reused` Job: the earlier Run's ok Job span it stands for (OpenTelemetry span link). */
  link_trace_id: string;
  link_span_id: string;
  harness: string;
  /** Span lines and events: `measured` or `typed`. On a score: who judged (`agent:<job>/reviewer`, `check:<name>`, `human:han`). */
  source: string;
  description: string;
  transcript_path: string;
  /** start: how the harness launched the agent (Claude Code's `requestShape`, background or not). */
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
  /** end, attrs: the skills the agent (or the orchestrator, inside a Job's window) invoked with the Skill tool. An empty list means none were. */
  skills_invoked: string[];
  status: Status;
  summary: string;
  value: number | string;
  rubric: string;
  body: string;
  via: Via;
  comment: string;
  /** event: the typed attributes of its name. */
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
/** What meta.json names, which an end line may add and an attrs line carries; the fold applies it over the start's. */
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

/** The typed keys of each kind as stored. A start or start-run takes its `span_id` from the writer's stamp. */
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

/** A shape plus every typed key it does not take as `?: never`: a line cannot carry another kind's key, and any key reads uniformly. */
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
/** One point fact on a span: its name decides its attributes. */
export type EventLine = {
  [N in EventName]: Exclusive<
    Envelope & { kind: 'event'; span_id: string; name: N; source: Provenance; attributes: EventAttributes[N] }
  >;
}[EventName];

/** One line of events.jsonl. */
export type RunLogLine = StartRunLine | StartLine | EndRunLine | EndLine | AttrsLine | ScoreLine | EventLine;

type Stamped = 't' | 'seq' | 'trace_id' | 'payload_truncated';
/** What the writer fills in on a start-run when the event leaves it out. */
type RunFacts = 'run_id' | 'template_sha' | 'branch';
/**
 * The event a writer is handed for one line: the line without what the writer stamps (a start's `span_id` among them),
 * a start-run's run facts optional; `t` only to report a measured time.
 */
type InputOf<L> = L extends { kind: infer K }
  ? Omit<
      L,
      Stamped | (K extends 'start' | 'start-run' ? 'span_id' : never) | (K extends 'start-run' ? RunFacts : never)
    > &
      (K extends 'start-run' ? Partial<Pick<LineFields, RunFacts>> : unknown) & { t?: string }
  : never;

/** What an adapter or orchestrator wants written. Everything stamped (`t` aside) is added by `record`. */
export type LogEvent = InputOf<RunLogLine>;

/** The identity an end or attrs line lays over a provisional start. */
export type IdentityFacts = Partial<Pick<LineFields, (typeof IDENTITY)[number]>>;
