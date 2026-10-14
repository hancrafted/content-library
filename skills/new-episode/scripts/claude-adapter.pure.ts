// The Claude Code adapter's pure half (issue #166): a SubagentStart/SubagentStop hook payload, the subagent's
// meta.json and transcript, the active-run marker and the run log so far in; the event for the core writer
// (`log.ts`) to append, or null, out. It adds what only Claude Code knows (launch and end times, the model
// asked for and the model that ran, tokens, the prompt) and never writes a line. `claude-adapter.ts` is the I/O.
import path from 'node:path';
import { JOB_ID } from '../../../src/lib/episode-pipeline-jobs.pure.ts';
import { isRecord, parseJson, parseMarker, sessionsOf, type Marker } from './marker.pure.ts';
import type { LogEvent, RunLogLine } from './run-log.pure.ts';
import { SUMMARY_MAX } from './run-log.pure.ts';
import { entries, promptOf, usageOf, type Entry } from './transcript.pure.ts';

/** The hook payload fields the adapter reads. */
export interface HookPayload {
  session_id: string;
  transcript_path: string;
  cwd?: string;
  agent_id: string;
  agent_type?: string;
  last_assistant_message?: string;
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
  /** The `model` in the agent type's definition frontmatter (see `frontmatterModel`), when one could be found. */
  agentModel?: string;
}

export interface ParsedDescription {
  job: string;
  attempt: number;
  role: string;
  ticket?: number;
}

/** `<job>#<attempt>/<role>[/#<ticket>]`; job and role follow `JOB_ID` (the pipeline check's grammar), attempt and ticket are positive integers. */
const ID = JOB_ID.source.slice(1, -1);
const DESCRIPTION = new RegExp(`^(${ID})#([1-9]\\d*)/(${ID})(?:/#([1-9]\\d*))?$`);

export function parseDescription(description: string): ParsedDescription | null {
  const m = DESCRIPTION.exec(description);
  if (m === null) return null;
  return { job: m[1], attempt: Number(m[2]), role: m[3], ...(m[4] === undefined ? {} : { ticket: Number(m[4]) }) };
}

/** Where the subagent's transcript and meta.json sit: `<session dir>/subagents/agent-<id>.*`. */
export function subagentFiles(payload: HookPayload): { transcript: string; meta: string } {
  const dir = path.join(payload.transcript_path.replace(/\.jsonl$/, ''), 'subagents');
  return {
    transcript: path.join(dir, `agent-${payload.agent_id}.jsonl`),
    meta: path.join(dir, `agent-${payload.agent_id}.meta.json`),
  };
}

const definedOnly = (o: Record<string, unknown>): LogEvent =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as unknown as LogEvent;

function metaOf(text: string | null): { description: string; model?: string; requestShape?: string } {
  const meta = parseJson(text);
  const read = (key: string): string | undefined =>
    isRecord(meta) && typeof meta[key] === 'string' ? (meta[key] as string) : undefined;
  return { description: read('description') ?? '', model: read('model'), requestShape: read('requestShape') };
}

/** The Jobs of this Run that have no end line yet. */
function openJobs(log: readonly RunLogLine[], trace: string): RunLogLine[] {
  const ended = new Set(log.filter((l) => l.kind === 'end').map((l) => l.span_id));
  return log.filter((l) => l.kind === 'start' && l.type === 'job' && l.trace_id === trace && !ended.has(l.span_id));
}

/** Who the agent is: its parsed description, else a skill-spawned agent of the one open Job; of no Job when several are open. */
function identityOf(description: string, jobs: readonly RunLogLine[]): Partial<ParsedDescription> {
  const parsed = parseDescription(description);
  if (parsed !== null) return parsed;
  return jobs.length === 1 && jobs[0].job !== undefined
    ? { job: jobs[0].job, role: 'skill-spawned' }
    : { role: 'skill-spawned' };
}

/** The newest Attempt span of this Run and Job that has no end line yet: where a parsed agent nests. */
function openAttempt(
  log: readonly RunLogLine[],
  trace: string,
  who: { job: string; attempt: number },
): RunLogLine | undefined {
  const ended = new Set(log.filter((l) => l.kind === 'end').map((l) => l.span_id));
  const attempts = log.filter(
    (l) =>
      l.kind === 'start' &&
      l.type === 'attempt' &&
      l.trace_id === trace &&
      l.job === who.job &&
      l.attempt === who.attempt,
  );
  return [...attempts].reverse().find((l) => !ended.has(l.span_id));
}

/**
 * Where an agent nests: the open Attempt its description names, else its Job while open; an unparsed agent the one
 * open Job. Otherwise the Run, since a closed or never-begun Job is no place to guess.
 */
function parentOf(
  where: { log: readonly RunLogLine[]; trace: string },
  identity: Partial<ParsedDescription>,
  jobs: readonly RunLogLine[],
): string | undefined {
  const { log, trace } = where;
  const { job, attempt } = identity;
  const ownAttempt = job !== undefined && attempt !== undefined ? openAttempt(log, trace, { job, attempt }) : undefined;
  const own = ownAttempt ?? jobs.find((l) => job !== undefined && l.job === job);
  if (own !== undefined) return own.span_id;
  return log.find((l) => l.kind === 'start-run' && l.trace_id === trace)?.span_id;
}

/** The model asked for: meta.json's, else the agent type's frontmatter. */
const requestedModel = (input: AdapterInput): string | undefined => metaOf(input.meta).model ?? input.agentModel;

function startEvent(input: AdapterInput, marker: Marker, files: { transcript: string }): LogEvent | null {
  const { description, requestShape } = metaOf(input.meta);
  const model = requestedModel(input);
  const all = entries(input.transcript);
  const jobs = openJobs(input.log, marker.trace_id);
  const identity = identityOf(description, jobs);
  const parent = parentOf({ log: input.log, trace: marker.trace_id }, identity, jobs);
  if (parent === undefined) return null;
  return definedOnly({
    kind: 'start',
    type: 'agent',
    t: all[0]?.timestamp,
    parent_span_id: parent,
    name: description || `${identity.job ?? 'run'}/${identity.role}`,
    ...identity,
    harness: 'claude-code',
    source: 'measured',
    description: description || undefined,
    transcript_path: files.transcript,
    request_shape: requestShape,
    'gen_ai.agent.name': input.payload.agent_type,
    'gen_ai.request.model': model,
    'gen_ai.input.messages': promptOf(all),
  });
}

const modelOf = (all: readonly Entry[]): string | undefined =>
  [...all].reverse().find((e) => e.type === 'assistant' && e.message?.model)?.message?.model;

/** The transcript may not have existed at SubagentStart: the launch time and prompt the start could not measure. */
function lateStartFacts(started: RunLogLine, all: readonly Entry[]): Partial<LogEvent> {
  const launched = all[0]?.timestamp;
  return {
    start_t: launched !== undefined && launched !== started.t ? launched : undefined,
    'gen_ai.input.messages': started['gen_ai.input.messages'] === undefined ? promptOf(all) : undefined,
  };
}

/** The identity meta.json names by SubagentStop (or, for a log that predates that, by the backfill), for a start filed provisionally (meta.json did not exist yet): the fold applies it over the start. */
export function identityFact(meta: string | null, log: readonly RunLogLine[], started: RunLogLine): Partial<LogEvent> {
  if (started.role !== 'skill-spawned') return {};
  const { description } = metaOf(meta);
  const parsed = parseDescription(description);
  if (parsed === null) return {};
  const trace = started.trace_id;
  const parent = parentOf({ log, trace }, parsed, openJobs(log, trace));
  return { ...parsed, parent_span_id: parent, name: description, description };
}

/** The requested model, when only SubagentStop knows it. */
const lateModel = (input: AdapterInput, started: RunLogLine): Partial<LogEvent> => ({
  'gen_ai.request.model': started['gen_ai.request.model'] === undefined ? requestedModel(input) : undefined,
});

function stopEvent(input: AdapterInput, marker: Marker, files: { transcript: string }): LogEvent | null {
  const started = input.log.find(
    (l) => l.kind === 'start' && l.type === 'agent' && l.transcript_path === files.transcript,
  );
  if (started?.span_id === undefined) return null;
  // A repeated delivery of the same stop must not append a second completion.
  if (input.log.some((l) => l.kind === 'end' && l.span_id === started.span_id)) return null;
  const all = entries(input.transcript);
  return definedOnly({
    kind: 'end',
    span_id: started.span_id,
    ...lateStartFacts(started, all),
    ...identityFact(input.meta, input.log, started),
    ...lateModel(input, started),
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
  if (marker === null) return null;
  const files = subagentFiles(input.payload);
  // A start only from the current session; a stop from any session of the Run (S2).
  if (input.event === 'start')
    return marker.session_id === input.payload.session_id ? startEvent(input, marker, files) : null;
  return sessionsOf(marker).includes(input.payload.session_id) ? stopEvent(input, marker, files) : null;
}

/**
 * The orchestrator's own cost for the Run span, when the Run ends: a second `end-run` line for the Run that
 * repeats the first one's status and summary and adds the orchestrator's model and the usage it spent inside the
 * Run (from start-run to the end of end-run's second), summed over the transcripts of every session that drove it. The latest end line
 * wins when folded. Null when the Run has no `end-run` yet, already carries usage, or the transcripts report none.
 */
export function runUsageEvent(
  log: readonly RunLogLine[],
  marker: Marker,
  transcripts: readonly (string | null)[],
): LogEvent | null {
  const run = log.find((l) => l.kind === 'start-run' && l.trace_id === marker.trace_id);
  const ended = [...log].reverse().find((l) => l.kind === 'end-run' && l.span_id === run?.span_id);
  if (run?.span_id === undefined || ended === undefined || ended['gen_ai.usage.input_tokens'] !== undefined)
    return null;
  // Line times are whole seconds, transcript times milliseconds: the window runs to the end of end-run's second.
  const from = Date.parse(run.t);
  const until = Date.parse(ended.t) + 1000;
  const inside = (e: Entry): boolean => {
    const at = e.timestamp === undefined ? Number.NaN : Date.parse(e.timestamp);
    return at >= from && at < until;
  };
  const all = transcripts.flatMap((t) => entries(t)).filter(inside);
  const usage = usageOf(all);
  if (Object.keys(usage).length === 0) return null;
  return definedOnly({
    kind: 'end-run',
    span_id: run.span_id,
    status: ended.status,
    summary: ended.summary,
    source: 'measured',
    'gen_ai.response.model': modelOf(all),
    ...usage,
  });
}
