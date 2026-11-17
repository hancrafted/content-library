// The test lock: the full test runs of several worktrees on this machine queue on it, so they take turns instead of
// slowing each other past their timeouts. One place takes it: `verify` (tools/verify/verify.ts), around its steps
// marked `testLock`, held once from the first to the last: the fast suite, and at a push the slow lane after it.
// Build, test:build and pre-commit never take it, and CI never does: a runner runs one job alone. Inside the lock the
// load-aware workers and timeout still apply (workers.ts), as a fallback for load the lock does not see.
import type { Holder } from './lock-owner.ts';
import { type Timing, withLock } from './lock.ts';

/** The one lock name every test run of this clone queues on. */
export const TEST_LOCK = 'test';

/** How often a waiter looks again, and how long it waits before it fails. */
const TIMING: Timing = { pollMs: 2_000, timeoutMs: 15 * 60 * 1000 };

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
