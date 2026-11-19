import type { SubagentEntry } from './log.pure.ts';

export interface HookPayload {
  session_id: string;
  transcript_path: string;
  cwd?: string;
  agent_id?: string;
}

export type HookMode = 'start' | 'stop';

export const isHookMode = (value: string | undefined): value is HookMode => value === 'start' || value === 'stop';

export function subagentEntry(
  mode: HookMode,
  payload: HookPayload,
  when: { branch: string | null; now: Date },
): SubagentEntry {
  return {
    t: when.now.toISOString(),
    event: mode === 'start' ? 'subagent-start' : 'subagent-stop',
    session: payload.session_id,
    transcript: payload.transcript_path,
    agent: payload.agent_id ?? null,
    branch: when.branch,
  };
}
