// decision: docs/decision-records/0010-run-log-lines-are-a-typed-union-with-point-events.md
import path from 'node:path';
import { openJobs, subagentFiles } from './claude-adapter.pure.ts';
import { parseMarker, sessionsOf, type Marker } from './marker.pure.ts';
import type { EventAttributes, EventName, LogEvent, Payload, RunLogLine } from './run-log.pure.ts';
import { skillName } from './transcript.pure.ts';

interface HookIdentity {
  session_id: string;
  transcript_path: string;
  cwd?: string;
  agent_id?: string;
  agent_type?: string;
}

export interface ToolHookPayload extends HookIdentity {
  tool_name?: string;
  tool_input?: unknown;
}

export interface InstructionsHookPayload extends HookIdentity {
  file_path?: string;
  memory_type?: string;
  load_reason?: string;
  globs?: unknown;
  trigger_file_path?: string;
}

interface HookInput<P extends HookIdentity> {
  payload: P;
  marker: string | null;
  log: readonly RunLogLine[];
}

export type ToolHookInput = HookInput<ToolHookPayload>;

export interface ReadHookInput extends ToolHookInput {
  repoRoot: string;
}

export interface InstructionsHookInput extends HookInput<InstructionsHookPayload> {
  repoRoot: string;
  resolvedPath: string | null;
}

function invokingSpan(input: HookInput<HookIdentity>, marker: Marker): string | undefined {
  const { payload, log } = input;
  if (payload.agent_id !== undefined) {
    const transcript = subagentFiles({ ...payload, agent_id: payload.agent_id }).transcript;
    return log.find((l) => l.kind === 'start' && l.type === 'agent' && l.transcript_path === transcript)?.span_id;
  }
  return openJobs(log, marker.trace_id).find((l) => l.span_id === marker.job_span_id)?.span_id;
}

interface Fact<N extends EventName> {
  name: N;
  attributes: EventAttributes[N];
  payload?: Payload;
}

function pointEvent<N extends EventName>(input: HookInput<HookIdentity>, fact: Fact<N> | null): LogEvent | null {
  const marker = parseMarker(input.marker);
  if (marker === null || !sessionsOf(marker).includes(input.payload.session_id) || fact === null) return null;
  const span = invokingSpan(input, marker);
  if (span === undefined) return null;
  return { kind: 'event', span_id: span, source: 'measured', ...fact } as LogEvent;
}

function repoPath(root: string, file: unknown): string | null {
  if (typeof file !== 'string' || file.trim() === '') return null;
  const relative = path.relative(root, path.resolve(root, file));
  return relative === '' || relative.startsWith('..') || path.isAbsolute(relative)
    ? null
    : relative.split(path.sep).join('/');
}

const ADR_FILE = /^\.archgate\/adrs\/([A-Z]+-\d{3}-[a-z0-9-]+)\.md$/;

function adrOf(root: string, resolved: string | null): string | undefined {
  return ADR_FILE.exec(repoPath(root, resolved) ?? '')?.[1];
}

const definedOnly = <T extends Record<string, unknown>>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

export function adaptSkill(input: ToolHookInput): LogEvent | null {
  const name = input.payload.tool_name === 'Skill' ? skillName(input.payload.tool_input) : null;
  return pointEvent(input, name === null ? null : { name: 'skill.invoke', attributes: { 'skill.name': name } });
}

export function adaptRead(input: ReadHookInput): LogEvent | null {
  const { tool_name, tool_input } = input.payload;
  const toolInput =
    typeof tool_input === 'object' && tool_input !== null ? (tool_input as { file_path?: unknown }) : {};
  const file = tool_name === 'Read' ? repoPath(input.repoRoot, toolInput.file_path) : null;
  return pointEvent(input, file === null ? null : { name: 'file.read', attributes: { 'file.path': file } });
}

export function adaptInstructions(input: InstructionsHookInput): LogEvent | null {
  const { payload, repoRoot } = input;
  const file = repoPath(repoRoot, payload.file_path);
  const reason = payload.load_reason?.trim();
  if (file === null || !reason) return null;
  const trigger = payload.trigger_file_path === undefined ? null : repoPath(repoRoot, payload.trigger_file_path);
  const attributes = definedOnly({
    'file.path': file,
    load_reason: reason,
    'trigger_file.path': trigger ?? undefined,
    adr: adrOf(repoRoot, input.resolvedPath),
  });
  const extras = definedOnly({ memory_type: payload.memory_type, globs: payload.globs });
  const fact: Fact<'instructions.load'> = { name: 'instructions.load', attributes };
  return pointEvent(input, Object.keys(extras).length > 0 ? { ...fact, payload: { claude_code: extras } } : fact);
}
