// Merging a finished branch into its --base, before its worktree is removed.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const git = (cwd: string, ...args: string[]) => spawnSync('git', args, { cwd, encoding: 'utf8' });

/** The worktree that has `base` checked out, from `git worktree list --porcelain`. */
function checkoutOf(base: string, cwd: string): string | null {
  const listing = execFileSync('git', ['worktree', 'list', '--porcelain'], { cwd, encoding: 'utf8' });
  for (const entry of listing.split('\n\n')) {
    const lines = entry.split('\n');
    const dir = lines.find((line) => line.startsWith('worktree '))?.slice('worktree '.length);
    if (dir && lines.includes(`branch refs/heads/${base}`)) return dir;
  }
  return null;
}

const POLL_MS = 100;
const WAIT_LIMIT_MS = 10 * 60 * 1000;
/** A lock folder this old without an owner file was left by a process killed between the two writes. */
const OWNERLESS_GRACE_MS = 10 * 1000;

const sleep = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const isAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
};

/** Whether the lock's holder is gone (killed mid-merge), so the lock may be taken over. */
function isStale(lock: string): boolean {
  try {
    return !isAlive(Number(readFileSync(path.join(lock, 'pid'), 'utf8')));
  } catch {
    try {
      return Date.now() - statSync(lock).mtimeMs > OWNERLESS_GRACE_MS;
    } catch {
      return false; // released meanwhile; the next mkdir decides
    }
  }
}

/**
 * Runs `fn` holding a lock per base in the git common directory, shared by every worktree,
 * so merges into one base run one at a time. The lock is released however `fn` ends.
 */
function withBaseLock<T>(base: string, cwd: string, fn: () => T): T {
  const commonDir = git(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir').stdout.trim();
  const lock = path.join(commonDir, `wt-merge-${base.replaceAll('/', '-')}.lock`);
  const deadline = Date.now() + WAIT_LIMIT_MS;
  let announced = false;
  for (;;) {
    try {
      mkdirSync(lock);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
    if (isStale(lock)) {
      rmSync(lock, { recursive: true, force: true });
      continue;
    }
    if (Date.now() > deadline)
      throw new Error(`timed out waiting for the merge lock ${lock}; remove it if no merge runs`);
    if (!announced) console.log(`… waiting for another merge into ${base} to finish`);
    announced = true;
    sleep(POLL_MS);
  }
  try {
    writeFileSync(path.join(lock, 'pid'), String(process.pid));
    return fn();
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

/**
 * Merges `branch` into `base` with a merge commit, inside the worktree that has `base` checked out.
 * Holds the base's merge lock throughout, so concurrent finishes into one base serialize.
 * Throws, with the base left as it was, when the base is checked out nowhere or the merge fails.
 */
export function mergeIntoBase(branch: string, base: string, cwd: string): 'merged' | 'already-merged' {
  return withBaseLock(base, cwd, () => {
    if (git(cwd, 'merge-base', '--is-ancestor', branch, base).status === 0) return 'already-merged';
    const tree = checkoutOf(base, cwd);
    if (tree === null) throw new Error(`${base} is not checked out in any worktree; check it out, then rerun`);
    const merge = git(tree, 'merge', '--no-ff', '--no-edit', branch);
    if (merge.status === 0) return 'merged';
    git(tree, 'merge', '--abort');
    throw new Error(
      `merging ${branch} into ${base} failed (conflict or dirty ${tree}):\n${merge.stdout}${merge.stderr}`,
    );
  });
}
