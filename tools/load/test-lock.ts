// The test lock: the full test runs of several worktrees on this machine queue on it, so they take turns instead of
// slowing each other past their timeouts. One place takes it: `verify` (tools/verify/verify.ts), around its steps
// marked `testLock`, held once from the first to the last: the fast suite, and at a push the slow lane after it.
// Build, test:build and pre-commit never take it, and CI never does: a runner runs one job alone. Inside the lock the
// load-aware workers and timeout still apply (workers.ts), as a fallback for load the lock does not see.
import type { Holder } from './lock-owner.ts';
import { type Timing, withLock } from './lock.ts';

export const TEST_LOCK = 'test';

const TIMING: Timing = { pollMilliseconds: 2_000, timeoutMilliseconds: 15 * 60 * 1000 };

function age(since: string, now: Date): string {
  const seconds = Math.max(Math.round((now.getTime() - new Date(since).getTime()) / 1000), 0);
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

function waitingLine(holder: Holder | null, now: Date): string {
  if (holder === null) return 'test lock: waiting for another test run to finish';
  const branch = holder.branch || 'a detached HEAD';
  return `test lock: waiting for ${branch} (pid ${holder.pid}, holding for ${age(holder.since, now)}) to finish its tests`;
}

export interface TestLockOptions extends Partial<Timing> {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export function withTestLock<T>(fn: () => T | Promise<T>, options: TestLockOptions = {}): Promise<T> {
  const {
    env = process.env,
    cwd = process.cwd(),
    pollMilliseconds = TIMING.pollMilliseconds,
    timeoutMilliseconds = TIMING.timeoutMilliseconds,
  } = options;
  if (env.CI) return Promise.resolve().then(fn);
  const onWait = (holder: Holder | null) => console.error(waitingLine(holder, new Date()));
  return withLock(TEST_LOCK, { cwd, pollMilliseconds, timeoutMilliseconds, onWait }, fn);
}
