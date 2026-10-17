// `record`: builds and validates one run-log line from an event and an explicit stamp. `lineErrors`: validates a stored line.

import {
  EVENT_ATTRIBUTES,
  EVENT_NAMES,
  KINDS,
  LINE_KEYS,
  NOTE_TYPES,
  PAYLOAD_MAX_BYTES,
  SPAN_TYPES,
  STATUSES,
  SUMMARY_MAX,
  VIAS,
  type EventName,
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
const skillList: Check = (v) =>
  Array.isArray(v) && v.every((s) => typeof s === 'string' && s.trim() !== '') ? null : 'must be a list of skill names';
const value: Check = (v) =>
  typeof v === 'number' || (typeof v === 'string' && v !== '') ? null : 'must be a number or a non-empty string';

const repoPath: Check = (v) =>
  typeof v === 'string' && v.trim() !== '' && !/^([/\\]|[A-Za-z]:)/.test(v) && !v.split(/[/\\]/).includes('..')
    ? null
    : 'must be a repo-relative path';
const isObject = (v: unknown): v is Fields => typeof v === 'object' && v !== null && !Array.isArray(v);
const payload: Check = (v) =>
  isObject(v) && Object.entries(v).every(([harness, extras]) => /^[a-z][a-z0-9_]*$/.test(harness) && isObject(extras))
    ? null
    : 'must map each harness, in snake_case, to an object';
const bytesOf = (v: unknown): number => new TextEncoder().encode(JSON.stringify(v)).length;

const CHECKS: Record<string, Check> = {
  t: matching(ISO, 'an ISO 8601 UTC time'),
  seq: count,
  trace_id: matching(TRACE_ID, '32 lowercase hex characters'),
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
  skills_invoked: skillList,
  value,
  payload,
  payload_truncated: (v) => (v === true ? null : 'must be true'),
  attributes: (v) => (isObject(v) ? null : 'must be an object'),
};

const ATTRIBUTE_CHECKS: Record<string, Check> = {
  'file.path': repoPath,
  'trigger_file.path': repoPath,
  'note.type': oneOf(NOTE_TYPES),
  adr: matching(/^[A-Z]+-\d{3}-[a-z0-9-]+$/, 'an ADR id and slug, GEN-002-adr-symlink-claude-rules'),
};

/** A span line's `source` says whether a number was measured; a score's `source` names the judge. */
const SOURCES: Record<'span' | 'score', Check> = {
  span: oneOf(['measured', 'typed']),
  score: matching(SCORE_SOURCE, 'agent:<job>/<role>, check:<name> or human:<name>'),
};

function checkFor(kind: Kind, key: string): Check {
  if (key === 'source') return SOURCES[kind === 'score' ? 'score' : 'span'];
  if (key === 'name' && kind === 'event') return oneOf(EVENT_NAMES);
  return CHECKS[key] ?? text;
}

interface Keys {
  required: readonly string[];
  optional: readonly string[];
}

const STARTS: readonly Kind[] = ['start', 'start-run'];

/** What an event handed to the writer must and may carry: the stored keys less what the writer stamps, plus a measured `t`. */
function inputKeys(kind: Kind): Keys {
  const { required, optional } = LINE_KEYS[kind];
  const stamped = STARTS.includes(kind) ? ['span_id'] : [];
  return { required: required.filter((key) => !stamped.includes(key)), optional: [...optional, 't', 'payload'] };
}

/** What a stored line must and may carry: its kind's keys and the envelope. */
function storedKeys(kind: Kind): Keys {
  const { required, optional } = LINE_KEYS[kind];
  return { required: [...required, 't', 'seq', 'trace_id'], optional: [...optional, 'payload', 'payload_truncated'] };
}

/** What a start line of each span type cannot omit: which Job, Attempt and role it belongs to. */
const NEEDED_BY_TYPE: Record<string, string[]> = { job: ['job'], attempt: ['job', 'attempt'], agent: ['job', 'role'] };

/** An event's attributes against its name's: none unknown, none missing, each well-formed. */
function attributeErrors(name: EventName, attributes: Fields): string[] {
  const { required, optional } = EVENT_ATTRIBUTES[name] as Keys;
  const known = new Set([...required, ...optional]);
  return [
    ...Object.keys(attributes)
      .filter((key) => !known.has(key))
      .map((key) => `attributes.${key} is not an attribute of a ${name} event`),
    ...required
      .filter((key) => attributes[key] === undefined)
      .map((key) => `attributes.${key} is required on a ${name} event`),
    ...Object.entries(attributes)
      .filter(([key, v]) => known.has(key) && v !== undefined)
      .flatMap(([key, v]) => {
        const problem = (ATTRIBUTE_CHECKS[key] ?? text)(v);
        return problem ? [`attributes.${key} ${problem}`] : [];
      }),
  ];
}

function fieldErrors(kind: Kind, fields: Fields, keys: Keys): string[] {
  const { required, optional } = keys;
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
  const named = EVENT_NAMES.includes(fields.name as EventName) && isObject(fields.attributes);
  const attributes =
    kind === 'event' && named ? attributeErrors(fields.name as EventName, fields.attributes as Fields) : [];
  return [...unknown, ...missing, ...invalid, ...attributes];
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

/** A payload over PAYLOAD_MAX_BYTES is dropped whole, and the line says so. */
function boundedPayload(fields: Fields): Fields {
  if (fields.payload === undefined) return {};
  return bytesOf(fields.payload) > PAYLOAD_MAX_BYTES ? { payload_truncated: true } : { payload: fields.payload };
}

function build(kind: Kind, fields: Fields, stamp: Stamp): RunLogLine {
  const own = STARTS.includes(kind) ? { span_id: stamp.spanId } : {};
  const rest = Object.entries(fields).filter(
    ([key, v]) => key !== 'kind' && key !== 't' && key !== 'payload' && v !== undefined,
  );
  const head = { kind, t: fields.t ?? stamp.t, seq: stamp.seq, trace_id: stamp.traceId };
  const line = { ...head, ...own, ...operationOf(kind, fields.type), ...Object.fromEntries(rest) };
  return { ...line, ...boundedPayload(fields) } as unknown as RunLogLine;
}

const kindOf = (fields: Fields): Kind | null => (KINDS.includes(fields.kind as Kind) ? (fields.kind as Kind) : null);
const KIND_ERROR = `kind must be one of ${KINDS.join(', ')}`;

/**
 * Builds one validated line from an event and a stamp, or lists why it is malformed. Deterministic: the same
 * event and stamp give the same line. A start takes its `span_id` from the stamp, so the writer decides ids;
 * every other kind must name the span it belongs to. A key its kind does not take is refused; a payload over
 * PAYLOAD_MAX_BYTES is dropped and the line marked `payload_truncated`.
 */
export function record(event: unknown, stamp: Stamp): RecordResult {
  if (!isObject(event)) return { ok: false, errors: ['event must be a JSON object'] };
  const kind = kindOf(event);
  if (kind === null) return { ok: false, errors: [KIND_ERROR] };
  const errors = [...fieldErrors(kind, event, inputKeys(kind)), ...stampErrors(kind, stamp)];
  return errors.length > 0 ? { ok: false, errors } : { ok: true, line: build(kind, event, stamp) };
}

/** Why a line read back from events.jsonl breaks the contract; empty when it holds. */
export function lineErrors(line: unknown): string[] {
  if (!isObject(line)) return ['line must be a JSON object'];
  const kind = kindOf(line);
  if (kind === null) return [KIND_ERROR];
  const tooLarge = line.payload !== undefined && bytesOf(line.payload) > PAYLOAD_MAX_BYTES;
  return [
    ...fieldErrors(kind, line, storedKeys(kind)),
    ...(tooLarge ? [`payload must be at most ${PAYLOAD_MAX_BYTES} bytes`] : []),
  ];
}
