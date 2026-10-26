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
import {
  adaptInstructions,
  adaptRead,
  adaptSkill,
  type InstructionsHookInput,
  type InstructionsHookPayload,
  type ToolHookPayload,
} from '../../../src/pipeline/lib/claude-adapter-event.pure.ts';
import { adaptSubagent, subagentFiles, type HookPayload } from '../../../src/pipeline/lib/claude-adapter.pure.ts';
import { readOrNull as read, readLog } from '../../../src/pipeline/lib/episode-run-log.ts';
import { LockTimeoutError, appendEvent } from '../../../src/pipeline/lib/run-log-writer.ts';
import { agentModel } from './agent-definition.ts';
import { findRun } from './run-root.ts';

/** A point-fact hook waits at most this long for the lock, so a contended log never stalls the call it follows. */
const POINT_LOCK_WAIT_MS = 2_000;
type PointMode = 'skill' | 'read' | 'instructions';
type Mode = PointMode | 'start' | 'stop';
type AdapterPayload = HookPayload & ToolHookPayload & InstructionsHookPayload;
type PointInput = InstructionsHookInput & { payload: ToolHookPayload & InstructionsHookPayload };
const POINT_HANDLERS: Record<PointMode, (input: PointInput) => ReturnType<typeof adaptSkill>> = {
  skill: adaptSkill,
  read: adaptRead,
  instructions: adaptInstructions,
};

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
function pointFact(mode: PointMode, payload: ToolHookPayload & InstructionsHookPayload): void {
  const run = runOf(payload);
  if (run === null) return;
  const { root, marker } = run;
  const input = { payload, marker: run.text, log: readLog(marker.log, root).lines };
  const repoRoot = repoRootOf(payload.cwd ?? root);
  const line = POINT_HANDLERS[mode]({ ...input, repoRoot, resolvedPath: resolvedUnder(repoRoot, payload.file_path) });
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

const HANDLERS: Record<Mode, (payload: AdapterPayload) => void> = {
  start: (payload) => subagent('start', payload),
  stop: (payload) => subagent('stop', payload),
  skill: (payload) => pointFact('skill', payload),
  read: (payload) => pointFact('read', payload),
  instructions: (payload) => pointFact('instructions', payload),
};

function isMode(value: string | undefined): value is Mode {
  return value !== undefined && Object.hasOwn(HANDLERS, value);
}

function main(mode: Mode): void {
  const payload = JSON.parse(readFileSync(0, 'utf8')) as AdapterPayload;
  HANDLERS[mode](payload);
}

const mode = process.argv[2];
try {
  if (isMode(mode)) main(mode);
} catch (error) {
  if (error instanceof LockTimeoutError) {
    process.stderr.write(`new-episode adapter: ${error.message}\n`);
    process.exitCode = isMode(mode) && Object.hasOwn(POINT_HANDLERS, mode) ? 0 : 1;
  }
  // Any other failure: a hook must never fail the session or the run, so the line is simply missing.
}
