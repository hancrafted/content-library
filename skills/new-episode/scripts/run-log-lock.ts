// A lock file for the run log: created exclusively, so concurrent writers on one machine never interleave. A lock
// its holder never released (a crashed writer) is broken after ten seconds.
import { closeSync, existsSync, openSync, statSync, unlinkSync } from 'node:fs';

const STALE_LOCK_MS = 10_000;
const LOCK_WAIT_MS = 15_000;

const sleep = (ms: number): unknown => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** Creates the lock file exclusively; false when another writer holds it. */
function tryLock(lockFile: string): boolean {
  try {
    closeSync(openSync(lockFile, 'wx'));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false;
    throw error;
  }
}

/** Removes a lock its holder never released, such as one left by a crashed writer. */
function breakStaleLock(lockFile: string): void {
  try {
    if (Date.now() - statSync(lockFile).mtimeMs > STALE_LOCK_MS) unlinkSync(lockFile);
  } catch {
    // the holder released it between our checks
  }
}

function lock(lockFile: string): void {
  const deadline = Date.now() + LOCK_WAIT_MS;
  while (!tryLock(lockFile)) {
    if (Date.now() > deadline) throw new Error(`could not take ${lockFile}`);
    breakStaleLock(lockFile);
    sleep(20);
  }
}

/** Runs `work` while holding the lock, and releases it however `work` ends. */
export function withLock<T>(lockFile: string, work: () => T): T {
  lock(lockFile);
  try {
    return work();
  } finally {
    if (existsSync(lockFile)) unlinkSync(lockFile);
  }
}
