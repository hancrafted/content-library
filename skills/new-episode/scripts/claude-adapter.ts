// SubagentStart / SubagentStop hook (`claude-adapter.ts start|stop`), and PostToolUse on the Skill tool
// (`claude-adapter.ts skill`, design-ADR-0009): a plugin over the core writer. It acts only
// when some worktree's `.scratch/active-run` lists the hook's session; otherwise it prints nothing and exits 0, so
// a retro or review session never touches a run's log. The mapping lives in claude-adapter.pure.ts; the line is
// written by run-log-writer.ts, which owns the shape, the clock, the lock and the sequence.
// A lock timeout is the one failure it reports: a line on stderr and exit 1, which Claude Code does not treat as
// blocking (exit 2 would block SubagentStop). The skill hook waits only 2 s, reports it too, and exits 0: the tool call already ran.
import { readFileSync } from 'node:fs';
import { agentModel } from './agent-definition.ts';
import { adaptSkill, type SkillHookPayload } from './claude-adapter-skill.pure.ts';
import { adaptSubagent, subagentFiles, type HookPayload } from './claude-adapter.pure.ts';
import { readOrNull as read, readLog } from './episode-run-log.ts';
import { LockTimeoutError, appendEvent } from './run-log-writer.ts';
import { findRun } from './run-root.ts';

/** The skill hook waits at most this long for the lock, so a contended log never stalls the Skill call it follows. */
const SKILL_LOCK_WAIT_MS = 2_000;

/** The worktree whose marker lists the hook's session, scanned from the payload's cwd. */
const runOf = (payload: { cwd?: string; session_id: string }) =>
  findRun(payload.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), payload.session_id);

function skill(payload: SkillHookPayload): void {
  const run = runOf(payload);
  if (run === null) return;
  const { root, marker } = run;
  const line = adaptSkill({ payload, marker: run.text, log: readLog(marker.log, root).lines });
  if (line !== null) appendEvent({ root, file: marker.log }, line, { lockWaitMs: SKILL_LOCK_WAIT_MS });
}

function subagent(event: 'start' | 'stop', payload: HookPayload): void {
  const run = runOf(payload);
  if (run === null) return;
  const { root, marker } = run;
  const files = subagentFiles(payload);
  const line = adaptSubagent({
    event,
    payload,
    marker: run.text,
    meta: read(files.meta),
    transcript: read(files.transcript),
    log: readLog(marker.log, root).lines,
    agentModel: agentModel(root, payload.agent_type),
  });
  if (line === null) return;
  appendEvent({ root, file: marker.log }, line);
}

function main(mode: string | undefined): void {
  const payload: unknown = JSON.parse(readFileSync(0, 'utf8'));
  if (mode === 'skill') skill(payload as SkillHookPayload);
  else subagent(mode === 'stop' ? 'stop' : 'start', payload as HookPayload);
}

const mode = process.argv[2];
try {
  main(mode);
} catch (error) {
  if (error instanceof LockTimeoutError) {
    process.stderr.write(`new-episode adapter: ${error.message}\n`);
    process.exitCode = mode === 'skill' ? 0 : 1;
  }
  // Any other failure: a hook must never fail the session or the run, so the line is simply missing.
}
