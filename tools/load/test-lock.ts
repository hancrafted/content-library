// The test lock: pre-push's test steps queue on it, so the test runs of several worktrees on this machine take turns
// instead of slowing each other past their timeouts. Two places take it: `verify` around its full fast-suite step
// (tools/verify/verify.ts, through withTestLock) and `.husky/pre-push` around the slow lane, through this file's
// command line:
//
//   node tools/load/test-lock.ts [--poll-ms <ms>] [--timeout-ms <ms>] -- <command…>
//
// which runs the command holding the lock and exits as it did: with its exit code, or by the signal that killed it.
// A SIGINT or SIGTERM is passed on to the command, and the lock released once the command has exited. Build, test:build and pre-commit never take
// it, and CI never does: a runner runs one job alone. Inside the lock the load-aware workers and timeout still apply
// (workers.ts), as a fallback for load the lock does not see.
import { type ChildProcess, spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import type { Holder } from './lock-owner.ts';
import { type Timing, withLock } from './lock.ts';

/** The one lock name every test run of this clone queues on. */
export const TEST_LOCK = 'test';

/** How often a waiter looks again, and how long it waits before it fails. */
const TIMING: Timing = { pollMilliseconds: 2_000, timeoutMilliseconds: 15 * 60 * 1000 };

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

export interface TestLockOptions extends Partial<Timing> {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  /** See LockOptions.onSignal. */
  onSignal?: (signal: NodeJS.Signals) => void;
}

/**
 * Runs `fn` holding the test lock, printing one waiting line to stderr while another run holds it, and throws
 * after 15 minutes of waiting, naming the lock and its holder. With `CI` set it runs `fn` at once, lock-free.
 */
export function withTestLock<T>(fn: () => T | Promise<T>, options: TestLockOptions = {}): Promise<T> {
  const {
    env = process.env,
    cwd = process.cwd(),
    pollMilliseconds = TIMING.pollMilliseconds,
    timeoutMilliseconds = TIMING.timeoutMilliseconds,
  } = options;
  if (env.CI) return Promise.resolve().then(fn);
  const onWait = (holder: Holder | null) => console.error(waitingLine(holder, new Date()));
  return withLock(TEST_LOCK, { cwd, pollMilliseconds, timeoutMilliseconds, onWait, onSignal: options.onSignal }, fn);
}

/** How a command ended: its exit code, or the signal that killed it. */
interface Exit {
  code: number | null;
  signal: NodeJS.Signals | null;
}

/**
 * Runs `command` with this process's stdio, holding the test lock, and resolves how it ended. A SIGINT or SIGTERM
 * this process gets while the command runs is passed on to it, and the lock is released once it has exited.
 */
function runHoldingTestLock([file, ...args]: string[], timing: Partial<Timing>): Promise<Exit> {
  let child: ChildProcess | undefined;
  const run = () =>
    new Promise<Exit>((resolve, reject) => {
      child = spawn(file, args, { stdio: 'inherit' });
      child.on('error', reject);
      child.on('close', (code, signal) => resolve({ code, signal }));
    });
  return withTestLock(run, { ...timing, onSignal: (signal) => child?.kill(signal) });
}

/** A `--poll-ms` or `--timeout-ms` value as milliseconds; throws unless it is a positive number. */
function positiveMilliseconds(flag: string, value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const ms = Number(value);
  if (!Number.isFinite(ms) || ms <= 0)
    throw new Error(`--${flag} takes a positive number of milliseconds, not "${value}"`);
  return ms;
}

const USAGE = 'usage: node tools/load/test-lock.ts [--poll-ms <ms>] [--timeout-ms <ms>] -- <command…>';

/** The command and its timing from the command line; throws on a malformed one. */
function parseCommandLine(args: string[]): { command: string[]; timing: Partial<Timing> } {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: { 'poll-ms': { type: 'string' }, 'timeout-ms': { type: 'string' } },
  });
  if (positionals.length === 0) throw new Error('no command given');
  const timing = {
    pollMilliseconds: positiveMilliseconds('poll-ms', values['poll-ms']),
    timeoutMilliseconds: positiveMilliseconds('timeout-ms', values['timeout-ms']),
  };
  return { command: positionals, timing };
}

if (import.meta.main) {
  let commandLine: ReturnType<typeof parseCommandLine>;
  try {
    commandLine = parseCommandLine(process.argv.slice(2));
  } catch (error) {
    console.error(`test lock: ${(error as Error).message}\n${USAGE}`);
    process.exit(2);
  }
  try {
    const { code, signal } = await runHoldingTestLock(commandLine.command, commandLine.timing);
    // Die as the command did: by its signal, with the lock's own signal handlers gone by now.
    if (signal !== null) process.kill(process.pid, signal);
    else process.exit(code ?? 1);
  } catch (error) {
    console.error(`test lock: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
