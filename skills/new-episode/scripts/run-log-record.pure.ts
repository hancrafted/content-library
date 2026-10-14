// `record`: builds and validates one run-log line from an event and an explicit stamp.

import {
  KINDS,
  SPAN_TYPES,
  STATUSES,
  SUMMARY_MAX,
  VIAS,
  type Kind,
  type RecordResult,
  type RunLogLine,
  type Stamp,
} from './run-log.schema.pure.ts';

type Fields = Record<string, unknown>;
type Check = (v: unknown) => string | null;

const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
const TRACE_ID = /^[0-9a-f]{32}$/;
const SPAN_ID = /^[0-9a-f]{16}$/;
const SHA = /^[0-9a-f]{7,40}$/;
const SCORE_SOURCE = /^(agent|check|human):\S+$/;

const text: Check = (v) => (typeof v === 'string' && v.trim() !== '' ? null : 'must be a non-empty string');
const count: Check = (v) => (Number.isInteger(v) && (v as number) >= 0 ? null : 'must be a non-negative integer');
const positive: Check = (v) => (Number.isInteger(v) && (v as number) >= 1 ? null : 'must be a positive integer');
const oneOf =
  (values: readonly string[]): Check =>
  (v) =>
    typeof v === 'string' && values.includes(v) ? null : `must be one of ${values.join(', ')}`;
const matching =
  (re: RegExp, what: string): Check =>
  (v) =>
    typeof v === 'string' && re.test(v) ? null : `must be ${what}`;
const spanId = matching(SPAN_ID, '16 lowercase hex characters');
const summary: Check = (v) => {
  if (typeof v !== 'string') return 'must be a string';
  return v.length > SUMMARY_MAX ? `must be at most ${SUMMARY_MAX} characters` : null;
};
const value: Check = (v) =>
  typeof v === 'number' || (typeof v === 'string' && v !== '') ? null : 'must be a number or a non-empty string';

const CHECKS: Record<string, Check> = {
  t: matching(ISO, 'an ISO 8601 UTC time'),
  start_t: matching(ISO, 'an ISO 8601 UTC time'),
  span_id: spanId,
  parent_span_id: spanId,
  retry_of: spanId,
  link_span_id: spanId,
  link_trace_id: matching(TRACE_ID, '32 lowercase hex characters'),
  type: oneOf(SPAN_TYPES),
  attempt: positive,
  ticket: positive,
  template_sha: matching(SHA, 'a git sha'),
  'gen_ai.usage.input_tokens': count,
  'gen_ai.usage.output_tokens': count,
  'gen_ai.usage.cache_read.input_tokens': count,
  status: oneOf(STATUSES),
  via: oneOf(VIAS),
  summary,
  value,
};

/** A span line's `source` says whether a number was measured; a score's `source` names the judge. */
const SOURCES: Record<'span' | 'score', Check> = {
  span: oneOf(['measured', 'typed']),
  score: matching(SCORE_SOURCE, 'agent:<job>/<role>, check:<name> or human:<name>'),
};

function checkFor(kind: Kind, key: string): Check {
  if (key === 'source') return SOURCES[kind === 'score' ? 'score' : 'span'];
  return CHECKS[key] ?? text;
}

const END_KEYS = [
  't',
  'start_t',
  'gen_ai.input.messages',
  'summary',
  'source',
  'transcript_path',
  'gen_ai.response.model',
  'gen_ai.usage.input_tokens',
  'gen_ai.usage.output_tokens',
  'gen_ai.usage.cache_read.input_tokens',
];
/** What an end line may add beyond END_KEYS: the identity meta.json names at stop, which the fold applies over the start's. */
const END_IDENTITY = [
  'name',
  'job',
  'attempt',
  'role',
  'ticket',
  'parent_span_id',
  'description',
  'gen_ai.request.model',
];
const RULES: Record<Kind, { required: string[]; optional: string[] }> = {
  'start-run': {
    required: ['run_id', 'template_sha', 'harness', 'branch', 'gen_ai.request.model'],
    optional: ['t', 'name', 'source', 'gen_ai.operation.name'],
  },
  start: {
    required: ['type', 'name', 'parent_span_id'],
    optional: [
      't',
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
  'end-run': { required: ['span_id', 'status'], optional: END_KEYS },
  end: { required: ['span_id', 'status'], optional: [...END_KEYS, ...END_IDENTITY] },
  score: {
    required: ['span_id', 'name', 'value', 'source'],
    optional: ['t', 'rubric', 'body', 'via', 'comment', 'ticket'],
  },
};

/** What a start line of each span type cannot omit: which Job, Attempt and role it belongs to. */
const NEEDED_BY_TYPE: Record<string, string[]> = { job: ['job'], attempt: ['job', 'attempt'], agent: ['job', 'role'] };

function fieldErrors(kind: Kind, fields: Fields): string[] {
  const { required, optional } = RULES[kind];
  const known = new Set(['kind', ...required, ...optional]);
  const byType = kind === 'start' ? (NEEDED_BY_TYPE[fields.type as string] ?? []) : [];
  // a skill-spawned agent filed under the Run, because several Jobs were open, belongs to no one Job
  const needed = [...required, ...byType.filter((key) => key !== 'job' || fields.role !== 'skill-spawned')];
  const unknown = Object.keys(fields)
    .filter((key) => !known.has(key))
    .map((key) => `${key} is not a field of a ${kind} line`);
  const missing = needed
    .filter((key) => fields[key] === undefined)
    .map((key) => `${key} is required on a ${kind} line`);
  const invalid = Object.entries(fields)
    .filter(([key, v]) => key !== 'kind' && known.has(key) && v !== undefined)
    .flatMap(([key, v]) => {
      const problem = checkFor(kind, key)(v);
      return problem ? [`${key} ${problem}`] : [];
    });
  return [...unknown, ...missing, ...invalid];
}

function stampErrors(kind: Kind, stamp: Stamp): string[] {
  const checks: [boolean, string][] = [
    [ISO.test(stamp.t), 'stamp.t must be an ISO 8601 UTC time'],
    [Number.isInteger(stamp.seq) && stamp.seq >= 0, 'stamp.seq must be a non-negative integer'],
    [TRACE_ID.test(stamp.traceId), 'trace_id must be 32 lowercase hex characters'],
    [!kind.startsWith('start') || SPAN_ID.test(stamp.spanId), 'span_id must be 16 lowercase hex characters'],
  ];
  return checks.filter(([ok]) => !ok).map(([, message]) => message);
}

/** The OpenTelemetry operation a start line performs, when it does not say so itself. */
function operationOf(kind: Kind, type: unknown): Fields {
  if (kind === 'start-run') return { 'gen_ai.operation.name': 'invoke_workflow' };
  return kind === 'start' && type === 'agent' ? { 'gen_ai.operation.name': 'invoke_agent' } : {};
}

function build(kind: Kind, fields: Fields, stamp: Stamp): RunLogLine {
  const own = kind.startsWith('start') ? { span_id: stamp.spanId } : {};
  const rest = Object.entries(fields).filter(([key, v]) => key !== 'kind' && key !== 't' && v !== undefined);
  const head = { kind, t: fields.t ?? stamp.t, seq: stamp.seq, trace_id: stamp.traceId };
  return { ...head, ...own, ...operationOf(kind, fields.type), ...Object.fromEntries(rest) } as unknown as RunLogLine;
}

/**
 * Builds one validated line from an event and a stamp, or lists why it is malformed. Deterministic: the same
 * event and stamp give the same line. A start takes its `span_id` from the stamp, so the writer decides ids;
 * every other kind must name the span it belongs to.
 */
export function record(event: unknown, stamp: Stamp): RecordResult {
  if (typeof event !== 'object' || event === null || Array.isArray(event))
    return { ok: false, errors: ['event must be a JSON object'] };
  const fields = event as Fields;
  const kind = fields.kind as Kind;
  if (!KINDS.includes(kind)) return { ok: false, errors: [`kind must be one of ${KINDS.join(', ')}`] };
  const errors = [...fieldErrors(kind, fields), ...stampErrors(kind, stamp)];
  return errors.length > 0 ? { ok: false, errors } : { ok: true, line: build(kind, fields, stamp) };
}
