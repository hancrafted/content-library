// A small lock module for the skill's tests, in the shape a project's `lock` module exports (see WithLock): a
// directory in the git common directory that one taker at a time can create.
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { git } from './git.ts';
import type { WithLock } from './worktree-merge.ts';

/** Makes the lock directory, or says it is held by someone else. */
function tryTake(lock: string): boolean {
  try {
    mkdirSync(lock);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false;
    throw error;
  }
}

export const withLock: WithLock = async (name, { pollMs, timeoutMs, cwd = process.cwd(), onWait }, fn) => {
  const common = path.resolve(cwd, git(cwd, ['rev-parse', '--git-common-dir']).stdout.trim());
  const lock = path.join(common, 'fixture-locks', `${encodeURIComponent(name)}.lock`);
  mkdirSync(path.dirname(lock), { recursive: true });
  const deadline = Date.now() + timeoutMs;
  for (let round = 0; !tryTake(lock); round++) {
    if (Date.now() >= deadline) throw new Error(`timed out waiting for the lock "${name}"`);
    if (round === 0) onWait?.();
    await sleep(pollMs);
  }
  try {
    return await fn();
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
};
