// SubagentStart / SubagentStop hook (`claude-adapter.ts start|stop`), and the point-fact hooks (design-ADR-0010):
// PostToolUse on the Skill tool (`skill`) and the Read tool (`read`), and InstructionsLoaded (`instructions`). A plugin
// over the core writer. It acts only
// when some worktree's `.scratch/active-run` lists the hook's session; otherwise it prints nothing and exits 0, so
// a retro or review session never touches a run's log. The mapping lives in claude-adapter.pure.ts; the line is
// written by run-log-writer.ts, which owns the shape, the clock, the lock and the sequence.
// A lock timeout is the one failure it reports: a line on stderr and exit 1, which Claude Code does not treat as
// blocking (exit 2 would block SubagentStop). A point-fact hook waits only 2 s, reports it too, and exits 0: what it
// records already happened.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { agentModel } from './agent-definition.ts';
import {
  adaptInstructions,
  adaptRead,
  adaptSkill,
  type InstructionsHookPayload,
  type ToolHookPayload,
} from './claude-adapter-event.pure.ts';
import { adaptSubagent, subagentFiles, type HookPayload } from './claude-adapter.pure.ts';
import { readOrNull as read, readLog } from './episode-run-log.ts';
import { LockTimeoutError, appendEvent } from './run-log-writer.ts';
import { findRun } from './run-root.ts';

/** A point-fact hook waits at most this long for the lock, so a contended log never stalls the call it follows. */
const POINT_LOCK_WAIT_MS = 2_000;
const POINT_MODES = ['skill', 'read', 'instructions'];

/** The worktree whose marker lists the hook's session, scanned from the payload's cwd. */
const runOf = (payload: { cwd?: string; session_id: string }) =>
  findRun(payload.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), payload.session_id);

/** The checkout the hook ran in: the nearest folder up from its cwd holding `.git` (a worktree's is a file). */
function repoRootOf(cwd: string): string {
  for (let dir = path.resolve(cwd); ; dir = path.dirname(dir)) {
    if (existsSync(path.join(dir, '.git'))) return dir;
    if (path.dirname(dir) === dir) return path.resolve(cwd);
  }
}

const realPath = (file: string | undefined): string | null => {
  try {
    return file === undefined ? null : realpathSync(file);
  } catch {
    return null;
  }
};

/** Where a loaded file really lives (a rule's symlink followed), spelled under `repoRoot` as the hook spells paths. */
function resolvedUnder(repoRoot: string, file: string | undefined): string | null {
  const [real, realRoot] = [realPath(file), realPath(repoRoot)];
  return real === null || realRoot === null ? null : path.resolve(repoRoot, path.relative(realRoot, real));
}

/** Skill, Read or InstructionsLoaded: one `event` line on the span that made the call, when there is one. */
function pointFact(mode: string, payload: ToolHookPayload & InstructionsHookPayload): void {
  const run = runOf(payload);
  if (run === null) return;
  const { root, marker } = run;
  const input = { payload, marker: run.text, log: readLog(marker.log, root).lines };
  const repoRoot = repoRootOf(payload.cwd ?? root);
  let line;
  if (mode === 'skill') line = adaptSkill(input);
  else if (mode === 'read') line = adaptRead({ ...input, repoRoot });
  else line = adaptInstructions({ ...input, repoRoot, resolvedPath: resolvedUnder(repoRoot, payload.file_path) });
  if (line !== null) appendEvent({ root, file: marker.log }, line, { lockWaitMs: POINT_LOCK_WAIT_MS });
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
  if (POINT_MODES.includes(mode ?? '')) pointFact(mode as string, payload as ToolHookPayload & InstructionsHookPayload);
  else subagent(mode === 'stop' ? 'stop' : 'start', payload as HookPayload);
}

const mode = process.argv[2];
try {
  main(mode);
} catch (error) {
  if (error instanceof LockTimeoutError) {
    process.stderr.write(`new-episode adapter: ${error.message}\n`);
    process.exitCode = POINT_MODES.includes(mode ?? '') ? 0 : 1;
  }
  // Any other failure: a hook must never fail the session or the run, so the line is simply missing.
}
