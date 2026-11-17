// decision: docs/decision-records/0010-run-log-lines-are-a-typed-union-with-point-events.md
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

const POINT_LOCK_WAIT_MILLISECONDS = 2_000;
const LOCK_WAIT_FLAG = '--lock-wait-ms=';
type PointMode = 'skill' | 'read' | 'instructions';
type Mode = PointMode | 'start' | 'stop';
type AdapterPayload = HookPayload & ToolHookPayload & InstructionsHookPayload;
type PointInput = InstructionsHookInput & { payload: ToolHookPayload & InstructionsHookPayload };
const POINT_HANDLERS: Record<PointMode, (input: PointInput) => ReturnType<typeof adaptSkill>> = {
  skill: adaptSkill,
  read: adaptRead,
  instructions: adaptInstructions,
};

const runOf = (payload: { cwd?: string; session_id: string }) =>
  findRun(payload.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), payload.session_id);

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

function resolvedUnder(repoRoot: string, file: string | undefined): string | null {
  const [real, realRoot] = [realPath(file), realPath(repoRoot)];
  return real === null || realRoot === null ? null : path.resolve(repoRoot, path.relative(realRoot, real));
}

function pointFact(
  mode: PointMode,
  payload: ToolHookPayload & InstructionsHookPayload,
  lockWaitMilliseconds: number,
): void {
  const run = runOf(payload);
  if (run === null) return;
  const { root, marker } = run;
  const input = { payload, marker: run.text, log: readLog(marker.log, root).lines };
  const repoRoot = repoRootOf(payload.cwd ?? root);
  const line = POINT_HANDLERS[mode]({ ...input, repoRoot, resolvedPath: resolvedUnder(repoRoot, payload.file_path) });
  if (line !== null) appendEvent({ root, file: marker.log }, line, { lockWaitMilliseconds });
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

function pointLockWait(args: readonly string[]): number {
  const ms = Number(args.find((arg) => arg.startsWith(LOCK_WAIT_FLAG))?.slice(LOCK_WAIT_FLAG.length));
  return Number.isInteger(ms) && ms > 0 ? ms : POINT_LOCK_WAIT_MILLISECONDS;
}

function isPointMode(value: string | undefined): value is PointMode {
  return value !== undefined && Object.hasOwn(POINT_HANDLERS, value);
}

function isMode(value: string | undefined): value is Mode {
  return value === 'start' || value === 'stop' || isPointMode(value);
}

function main(mode: Mode, args: readonly string[]): void {
  const payload = JSON.parse(readFileSync(0, 'utf8')) as AdapterPayload;
  if (isPointMode(mode)) pointFact(mode, payload, pointLockWait(args));
  else subagent(mode, payload);
}

const mode = process.argv[2];
try {
  if (isMode(mode)) main(mode, process.argv.slice(3));
} catch (error) {
  if (error instanceof LockTimeoutError) {
    process.stderr.write(`new-episode adapter: ${error.message}\n`);
    process.exitCode = isPointMode(mode) ? 0 : 1;
  }
}
