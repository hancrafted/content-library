// The Claude Code adapter's pure half (issue #166): a SubagentStart/SubagentStop hook payload, the subagent's
// meta.json and transcript, the active-run marker and the run log so far in; the event for the core writer
// (`log.ts`) to append, or null, out. It adds what only Claude Code knows (launch and end times, the model
// asked for and the model that ran, tokens, the prompt) and never writes a line. `claude-adapter.ts` is the I/O.
import path from 'node:path';
import type { LogEvent, RunLogLine } from './run-log.pure.ts';
import { SUMMARY_MAX } from './run-log.pure.ts';

/** The hook payload fields the adapter reads. */
export interface HookPayload {
  session_id: string;
  transcript_path: string;
  cwd?: string;
  agent_id: string;
  agent_type?: string;
  last_assistant_message?: string;
}

/**
 * `.scratch/active-run`: JSON written at run start and removed at run end. `log` is the log path, `session_id` the
 * orchestrator's, `trace_id` the Run's, `job_span_id` the orchestrator-session Job span that unparsed agents join.
 */
export interface Marker {
  log: string;
  session_id: string;
  trace_id: string;
  job_span_id: string;
}

export interface AdapterInput {
  event: 'start' | 'stop';
  payload: HookPayload;
  /** The marker file's text, null when there is none. */
  marker: string | null;
  /** The subagent's meta.json text, null when unreadable. */
  meta: string | null;
  /** The subagent's transcript text, null when unreadable. */
  transcript: string | null;
  /** The run log's lines so far: a stop finds its start, an unparsed start finds its Job. */
  log: readonly RunLogLine[];
}

export interface ParsedDescription {
  job: string;
  attempt: number;
  role: string;
  ticket?: number;
}

/** `<job>#<attempt>/<role>[/#<ticket>]`; job and role are kebab-case ids, attempt and ticket positive integers. */
const DESCRIPTION = /^([a-z0-9][a-z0-9-]*)#([1-9]\d*)\/([a-z0-9][a-z0-9-]*)(?:\/#([1-9]\d*))?$/;

export function parseDescription(description: string): ParsedDescription | null {
  const m = DESCRIPTION.exec(description);
  if (m === null) return null;
  return { job: m[1], attempt: Number(m[2]), role: m[3], ...(m[4] === undefined ? {} : { ticket: Number(m[4]) }) };
}

function json(text: string | null): unknown {
  try {
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function parseMarker(text: string | null): Marker | null {
  const m = json(text);
  if (!isRecord(m)) return null;
  const ok = ['log', 'session_id', 'trace_id', 'job_span_id'].every((k) => typeof m[k] === 'string' && m[k] !== '');
  return ok ? (m as unknown as Marker) : null;
}

/** Where the subagent's transcript and meta.json sit: `<session dir>/subagents/agent-<id>.*`. */
export function subagentFiles(payload: HookPayload): { transcript: string; meta: string } {
  const dir = path.join(payload.transcript_path.replace(/\.jsonl$/, ''), 'subagents');
  return { transcript: path.join(dir, `agent-${payload.agent_id}.jsonl`), meta: path.join(dir, `agent-${payload.agent_id}.meta.json`) };
}

interface Entry {
  timestamp?: string;
  type?: string;
  message?: { id?: string; role?: string; model?: string; content?: unknown; usage?: Record<string, unknown> };
}

function entries(transcript: string | null): Entry[] {
  return (transcript ?? '').split('\n').flatMap((raw) => {
    const parsed = json(raw.trim() === '' ? null : raw);
    return isRecord(parsed) ? [parsed as Entry] : [];
  });
}

function promptOf(all: readonly Entry[]): string | undefined {
  const first = all.find((e) => e.type === 'user' && e.message?.role === 'user');
  const content = first?.message?.content;
  if (typeof content === 'string') return content.trim() === '' ? undefined : content;
  if (!Array.isArray(content)) return undefined;
  const text = content.flatMap((b) => (isRecord(b) && b.type === 'text' && typeof b.text === 'string' ? [b.text] : [])).join('\n');
  return text === '' ? undefined : text;
}

const num = (v: unknown): number => (typeof v === 'number' ? v : 0);

/** Summed usage: a streamed message repeats under one id, so only its last entry counts. */
function usageOf(all: readonly Entry[]): Partial<LogEvent> {
  const byMessage = new Map<string, Record<string, unknown>>();
  all.forEach((e, at) => {
    if (e.type === 'assistant' && e.message?.usage) byMessage.set(e.message.id ?? `#${at}`, e.message.usage);
  });
  if (byMessage.size === 0) return {};
  const sum = (key: string): number => [...byMessage.values()].reduce((total, u) => total + num(u[key]), 0);
  return {
    'gen_ai.usage.input_tokens': sum('input_tokens'),
    'gen_ai.usage.output_tokens': sum('output_tokens'),
    'gen_ai.usage.cache_read.input_tokens': sum('cache_read_input_tokens'),
  };
}

const definedOnly = (o: Record<string, unknown>): LogEvent => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as unknown as LogEvent;

function metaOf(text: string | null): { description: string; model?: string } {
  const meta = json(text);
  const read = (key: string): string | undefined => (isRecord(meta) && typeof meta[key] === 'string' ? (meta[key] as string) : undefined);
  return { description: read('description') ?? '', model: read('model') };
}

/** Who the agent is: its parsed description, else the Job the orchestrator session is in as a skill-spawned agent. */
function identityOf(description: string, jobSpan: RunLogLine | undefined): Partial<ParsedDescription> | null {
  const parsed = parseDescription(description);
  if (parsed !== null) return parsed;
  return jobSpan?.job === undefined ? null : { job: jobSpan.job, role: 'skill-spawned' };
}

function startEvent(input: AdapterInput, marker: Marker, files: { transcript: string }): LogEvent | null {
  const { description, model } = metaOf(input.meta);
  const all = entries(input.transcript);
  const jobSpan = input.log.find((l) => l.span_id === marker.job_span_id && l.type === 'job');
  const identity = identityOf(description, jobSpan);
  if (identity === null) return null;
  return definedOnly({
    kind: 'start',
    type: 'agent',
    t: all[0]?.timestamp,
    parent_span_id: marker.job_span_id,
    name: description || `${identity.job}/${identity.role}`,
    ...identity,
    harness: 'claude-code',
    source: 'measured',
    description: description || undefined,
    transcript_path: files.transcript,
    'gen_ai.agent.name': input.payload.agent_type,
    'gen_ai.request.model': model,
    'gen_ai.input.messages': promptOf(all),
  });
}

const modelOf = (all: readonly Entry[]): string | undefined => [...all].reverse().find((e) => e.type === 'assistant' && e.message?.model)?.message?.model;

function stopEvent(input: AdapterInput, files: { transcript: string }): LogEvent | null {
  const started = input.log.find((l) => l.kind === 'start' && l.type === 'agent' && l.transcript_path === files.transcript);
  if (started?.span_id === undefined) return null;
  const all = entries(input.transcript);
  return definedOnly({
    kind: 'end',
    span_id: started.span_id,
    t: all.at(-1)?.timestamp,
    status: 'ok',
    source: 'measured',
    summary: input.payload.last_assistant_message?.slice(0, SUMMARY_MAX) || undefined,
    transcript_path: files.transcript,
    'gen_ai.response.model': modelOf(all),
    ...usageOf(all),
  });
}

/** The event to append for this hook call, or null: no marker, another session's marker, or nothing to attribute. */
export function adaptSubagent(input: AdapterInput): LogEvent | null {
  const marker = parseMarker(input.marker);
  if (marker === null || marker.session_id !== input.payload.session_id) return null;
  const files = subagentFiles(input.payload);
  return input.event === 'start' ? startEvent(input, marker, files) : stopEvent(input, files);
}
