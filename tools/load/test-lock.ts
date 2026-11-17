// The test lock: pre-push's test steps queue on it, so the test runs of several worktrees on this machine take turns
// instead of slowing each other past their timeouts. Two places take it: `verify` around its full fast-suite step
// (tools/verify/verify.ts, through withTestLock) and `.husky/pre-push` around the slow lane, through this file's
// command line:
//
//   node tools/load/test-lock.ts [--poll-ms <ms>] [--timeout-ms <ms>] -- <command…>
//
// which runs the command holding the lock and exits with its exit code. Build, test:build and pre-commit never take
// it, and CI never does: a runner runs one job alone. Inside the lock the load-aware workers and timeout still apply
// (workers.mts), as a fallback for load the lock does not see.
import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import { type Holder, withLock } from './lock.ts';

/** The one lock name every test run of this clone queues on. */
export const TEST_LOCK = 'test';

/** How often a waiter looks again, and how long it waits before it fails. */
const TIMING = { pollMs: 2_000, timeoutMs: 15 * 60 * 1000 };

/** How long ago `since` was, as the waiting line prints it: `42 s`, `3 min 5 s`. */
function age(since: string, now: Date): string {
  const seconds = Math.max(Math.round((now.getTime() - new Date(since).getTime()) / 1000), 0);
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

/** The one line a waiter prints: whose run it waits for, by branch, pid and how long that run has held the lock. */
function waitingLine(holder: Holder | null, now: Date): string {
  if (holder === null) return 'test lock: waiting for another test run to finish';
  const branch = holder.branch || 'a detached HEAD';
  return `test lock: waiting for ${branch} (pid ${holder.pid}, holding for ${age(holder.since, now)}) to finish its tests`;
}

export interface TestLockOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  pollMs?: number;
  timeoutMs?: number;
}

/**
 * Runs `fn` holding the test lock, printing one waiting line to stderr while another run holds it, and throws
 * after 15 minutes of waiting, naming the lock and its holder. With `CI` set it runs `fn` at once, lock-free.
 */
export function withTestLock<T>(fn: () => T | Promise<T>, options: TestLockOptions = {}): Promise<T> {
  const { env = process.env, cwd = process.cwd(), pollMs = TIMING.pollMs, timeoutMs = TIMING.timeoutMs } = options;
  if (env.CI) return Promise.resolve().then(fn);
  const onWait = (holder: Holder | null) => console.error(waitingLine(holder, new Date()));
  return withLock(TEST_LOCK, { cwd, pollMs, timeoutMs, onWait }, fn);
}

/** Runs `command` with this process's stdio and resolves its exit code; a command killed by a signal counts as 1. */
function runCommand([file, ...args]: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
}

if (import.meta.main) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { 'poll-ms': { type: 'string' }, 'timeout-ms': { type: 'string' } },
  });
  if (positionals.length === 0) {
    console.error('usage: node tools/load/test-lock.ts [--poll-ms <ms>] [--timeout-ms <ms>] -- <command…>');
    process.exit(2);
  }
  const number = (value: string | undefined) => (value === undefined ? undefined : Number(value));
  try {
    const code = await withTestLock(() => runCommand(positionals), {
      pollMs: number(values['poll-ms']),
      timeoutMs: number(values['timeout-ms']),
    });
    process.exit(code);
  } catch (error) {
    console.error(`test lock: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
