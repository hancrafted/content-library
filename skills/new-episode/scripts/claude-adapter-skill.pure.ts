// The Claude Code adapter's PostToolUse half (design-ADR 0009): a Skill tool call's hook payload, the active-run marker
// and the run log so far in; the `skill` event for the core writer to append, or null, out. Pure; `claude-adapter.ts
// skill` is the I/O.
import { openJobs, subagentFiles } from './claude-adapter.pure.ts';
import { isRecord, parseMarker, sessionsOf, type Marker } from './marker.pure.ts';
import type { LogEvent, RunLogLine } from './run-log.pure.ts';

/** The PostToolUse payload fields the skill hook reads; `agent_id` is present only when a subagent made the call. */
export interface SkillHookPayload {
  session_id: string;
  transcript_path: string;
  cwd?: string;
  agent_id?: string;
  agent_type?: string;
  tool_name?: string;
  tool_input?: unknown;
}

export interface SkillHookInput {
  payload: SkillHookPayload;
  /** The marker file's text, null when there is none. */
  marker: string | null;
  /** The run log's lines so far: the agent's start, or the open Job the marker names. */
  log: readonly RunLogLine[];
}

/** The skill a Skill tool call names, as `skills_invoked` records it; `command` is the input's older name. */
function skillName(toolInput: unknown): string | null {
  if (!isRecord(toolInput)) return null;
  const name = toolInput.skill ?? toolInput.command;
  return typeof name === 'string' && name.trim() !== '' ? name : null;
}

/** The span a Skill call belongs to: the subagent's agent span, else the open Job the orchestrator is in; never a guess. */
function invokingSpan(input: SkillHookInput, marker: Marker): string | undefined {
  const { payload, log } = input;
  if (payload.agent_id !== undefined) {
    const transcript = subagentFiles({ ...payload, agent_id: payload.agent_id }).transcript;
    return log.find((l) => l.kind === 'start' && l.type === 'agent' && l.transcript_path === transcript)?.span_id;
  }
  return openJobs(log, marker.trace_id).find((l) => l.span_id === marker.job_span_id)?.span_id;
}

/** The `skill` event for a PostToolUse call of the Skill tool, or null: no marker, another session, another tool, or no span to attribute it to. */
export function adaptSkill(input: SkillHookInput): LogEvent | null {
  const marker = parseMarker(input.marker);
  if (marker === null || !sessionsOf(marker).includes(input.payload.session_id)) return null;
  const name = input.payload.tool_name === 'Skill' ? skillName(input.payload.tool_input) : null;
  if (name === null) return null;
  const span = invokingSpan(input, marker);
  return span === undefined ? null : { kind: 'skill', span_id: span, name, source: 'measured' };
}
