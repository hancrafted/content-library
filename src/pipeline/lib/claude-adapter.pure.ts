import path from 'node:path';
import { verdictFirst } from './agent-summary.pure.ts';
import { openedByCommand, unclaimedAgents } from './claude-adapter-spans.pure.ts';
import { parseDescription, type ParsedDescription } from './episode-spawn-description.pure.ts';
import { isRecord, parseJson, parseMarker, sessionsOf, type Marker } from './marker.pure.ts';
import type { IdentityFacts, LogEvent, MeasuredFacts, RunLogLine } from './run-log.pure.ts';
import { SUMMARY_MAX } from './run-log.pure.ts';
import { entries, modelOf, promptOf, skillsInvoked, usageOf, type Entry } from './transcript.pure.ts';
import { measuredUsage } from './usage-window.pure.ts';

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
  marker: string | null;
  meta: string | null;
  transcript: string | null;
  log: readonly RunLogLine[];
  agentModel?: string;
}

export { parseDescription } from './episode-spawn-description.pure.ts';

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

export function openJobs(log: readonly RunLogLine[], trace: string): RunLogLine[] {
  const ended = new Set(log.filter((l) => l.kind === 'end').map((l) => l.span_id));
  return log.filter((l) => l.kind === 'start' && l.type === 'job' && l.trace_id === trace && !ended.has(l.span_id));
}

function identityOf(description: string, jobs: readonly RunLogLine[]): Partial<ParsedDescription> {
  const parsed = parseDescription(description);
  if (parsed !== null) return parsed;
  return jobs.length === 1 && jobs[0].job !== undefined
    ? { job: jobs[0].job, role: 'skill-spawned' }
    : { role: 'skill-spawned' };
}

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

const requestedModel = (input: AdapterInput): string | undefined => metaOf(input.meta).model ?? input.agentModel;

function claimsOpenSpan(input: AdapterInput, trace: string, description: string): boolean {
  if (input.meta === null) return unclaimedAgents(input.log, trace).length > 0;
  return openedByCommand(input.log, trace, description) !== undefined;
}

function startEvent(input: AdapterInput, marker: Marker, files: { transcript: string }): LogEvent | null {
  const { description, requestShape } = metaOf(input.meta);
  if (claimsOpenSpan(input, marker.trace_id, description)) return null;
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

function lateStartFacts(started: RunLogLine, all: readonly Entry[]): MeasuredFacts {
  const launched = all[0]?.timestamp;
  return {
    start_t: launched !== undefined && launched !== started.t ? launched : undefined,
    'gen_ai.input.messages': started['gen_ai.input.messages'] === undefined ? promptOf(all) : undefined,
  };
}

export function identityFact(meta: string | null, log: readonly RunLogLine[], started: RunLogLine): IdentityFacts {
  if (started.role !== 'skill-spawned') return {};
  const { description } = metaOf(meta);
  const parsed = parseDescription(description);
  if (parsed === null) return {};
  const trace = started.trace_id;
  const parent = parentOf({ log, trace }, parsed, openJobs(log, trace));
  return { ...parsed, parent_span_id: parent, name: description, description };
}

const lateModel = (input: AdapterInput, started: RunLogLine): IdentityFacts => ({
  'gen_ai.request.model': started['gen_ai.request.model'] === undefined ? requestedModel(input) : undefined,
});

const lateSkills = (transcript: string | null, all: readonly Entry[]): MeasuredFacts =>
  transcript === null ? {} : { skills_invoked: skillsInvoked(all) };

const startOf = (input: AdapterInput, marker: Marker, files: { transcript: string }): RunLogLine | undefined =>
  input.log.find((l) => l.kind === 'start' && l.type === 'agent' && l.transcript_path === files.transcript) ??
  openedByCommand(input.log, marker.trace_id, metaOf(input.meta).description);

function stopEvent(input: AdapterInput, marker: Marker, files: { transcript: string }): LogEvent | null {
  const started = startOf(input, marker, files);
  if (started?.span_id === undefined) return null;
  const stopAlreadyDelivered = input.log.some((l) => l.kind === 'end' && l.span_id === started.span_id);
  if (stopAlreadyDelivered) return null;
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
    summary: verdictFirst(input.payload.last_assistant_message ?? '', SUMMARY_MAX) || undefined,
    transcript_path: files.transcript,
    'gen_ai.response.model': modelOf(all),
    ...usageOf(all),
    ...lateSkills(input.transcript, all),
  });
}

export function adaptSubagent(input: AdapterInput): LogEvent | null {
  const marker = parseMarker(input.marker);
  if (marker === null) return null;
  const files = subagentFiles(input.payload);
  if (input.event === 'start') {
    const fromCurrentSession = marker.session_id === input.payload.session_id;
    return fromCurrentSession ? startEvent(input, marker, files) : null;
  }
  const fromAnySessionOfRun = sessionsOf(marker).includes(input.payload.session_id);
  return fromAnySessionOfRun ? stopEvent(input, marker, files) : null;
}

export function runUsageEvent(
  log: readonly RunLogLine[],
  marker: Marker,
  transcripts: readonly (string | null)[],
): LogEvent | null {
  const run = log.find((l) => l.kind === 'start-run' && l.trace_id === marker.trace_id);
  const ended = [...log].reverse().find((l) => l.kind === 'end-run' && l.span_id === run?.span_id);
  if (run?.span_id === undefined || ended === undefined || ended['gen_ai.usage.input_tokens'] !== undefined)
    return null;
  const measured = measuredUsage(run.t, ended.t, transcripts);
  if (measured === null) return null;
  return definedOnly({
    kind: 'end-run',
    span_id: run.span_id,
    status: ended.status,
    summary: ended.summary,
    ...measured,
  });
}
