// A named lock shared by this clone and its worktrees, so work that must not overlap runs one at a time:
// `wt:done` and `wt:sync` merging into one base, and the test lock pre-push's tests queue on.
//
// The lock is a directory `locks/<name>.lock` in the git common directory, holding an `owner` file with the
// holder's pid, process start time, branch and the time it took the lock. It appears whole, by renaming a filled temporary directory into place, so
// a lock never exists without its owner and only one of several takers gets it. A lock whose holder died, or whose
// pid now belongs to another process (its start time differs), is stale and is taken over (see `takeOver`). A lock
// leaves by the same rename, moved aside whole before it is deleted, so no taker ever finds it half gone.
import { mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { currentBranch, gitCommonDir } from './git.ts';
import {
  describeOwner,
  type Holder,
  isStale,
  parseOwner,
  type ProcessStart,
  psStartTime,
  readOwner,
} from './lock-owner.ts';

/** How often a waiter looks again, and how long it waits before it gives up. */
export interface Timing {
  pollMs: number;
  timeoutMs: number;
}

export interface LockOptions extends Timing {
  /** A directory inside the repository; its git common directory holds the lock. Default: the current directory. */
  cwd?: string;
  /** Called once, when the lock is held by another process and this one starts to wait, with that holder if readable. */
  onWait?: (holder: Holder | null) => void;
  /** How a pid's start time is read. Default: `ps` (psStartTime). */
  startTimeOf?: (pid: number) => ProcessStart;
  /** The time a leftover directory's age is measured against (see sweepLeftovers). Default: the current time. */
  now?: Date;
}

/** A takeover marker this old belongs to a waiter killed mid-takeover, which takes microseconds. */
const MARKER_STALE_MS = 10_000;

const errorCode = (error: unknown) => (error as NodeJS.ErrnoException).code;

/**
 * Removes the lock directory `lock` without a moment where it exists half empty: one rename moves it aside to a
 * `<lock>.stale-*` directory, which is then deleted. Deleting in place would empty it first, and a taker could
 * rename its own directory onto the empty one, or read no owner, call it stale and take it over, before the last
 * rmdir fails on what the taker put there.
 */
function removeLock(lock: string): void {
  const aside = mkdtempSync(`${lock}.stale-`);
  renameSync(lock, path.join(aside, 'lock'));
  rmSync(aside, { recursive: true, force: true });
}

/**
 * Removes a lock found stale with owner `staleOwner`, unless another waiter already is, and says whether it did. A
 * waiter first claims the takeover by making a `takeover` directory inside the lock, which only one can; then checks
 * the lock still is the stale one, since it may have been replaced since it was read; then moves it aside with one
 * rename and deletes it. Only the claimant moves that lock, so no waiter moves a newer holder's lock away. A claim
 * left by a waiter killed mid-takeover is cleared after MARKER_STALE_MS.
 */
function takeOver(lock: string, staleOwner: string): boolean {
  const marker = path.join(lock, 'takeover');
  try {
    mkdirSync(marker);
  } catch (error) {
    // Gone meanwhile, or another waiter's takeover, unless that waiter was killed mid-takeover.
    const claimed = errorCode(error) === 'EEXIST' ? statSync(marker, { throwIfNoEntry: false })?.mtimeMs : undefined;
    if (claimed !== undefined && Date.now() - claimed > MARKER_STALE_MS)
      rmSync(marker, { recursive: true, force: true });
    return false;
  }
  if (readOwner(lock) !== staleOwner) {
    rmSync(marker, { recursive: true, force: true });
    return false;
  }
  removeLock(lock);
  return true;
}

/** The lock directory for `name` in the git common directory of `cwd`; names are escaped whole, so `a/b-c` ≠ `a-b/c`. */
function lockPath(name: string, cwd: string): string {
  const common = gitCommonDir(cwd);
  if (common === null) throw new Error(`no git repository at ${cwd}`);
  return path.join(common, 'locks', `${encodeURIComponent(name)}.lock`);
}

/**
 * A `*.pending-*` or `*.stale-*` directory older than this was left by a process killed between making and removing
 * it. No waiter waits this long (the longest, the test lock, gives up after 15 minutes), so none is still in use.
 */
const LEFTOVER_MS = 60 * 60 * 1000;

/** Deletes the leftover directories in `locks` last changed more than LEFTOVER_MS before `now`. */
function sweepLeftovers(locks: string, now: Date): void {
  for (const entry of readdirSync(locks)) {
    if (!/\.lock\.(pending|stale)-/.test(entry)) continue;
    const dir = path.join(locks, entry);
    const changed = statSync(dir, { throwIfNoEntry: false })?.mtimeMs;
    if (changed !== undefined && now.getTime() - changed > LEFTOVER_MS) rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * One call's claim on a lock: the holder it would record, its owner file's text as last written, and the directory
 * it renames into place to take it.
 */
interface Claim {
  lock: string;
  identity: Omit<Holder, 'since'>;
  ownerText: string;
  pending: string;
  held: boolean;
}

function prepare(name: string, cwd: string, options: LockOptions): Claim {
  const lock = lockPath(name, cwd);
  const self = (options.startTimeOf ?? psStartTime)(process.pid);
  if (self.state !== 'running') throw new Error("cannot read this process's start time with ps");
  mkdirSync(path.dirname(lock), { recursive: true });
  sweepLeftovers(path.dirname(lock), options.now ?? new Date());
  const pending = mkdtempSync(`${lock}.pending-`);
  const identity = { pid: process.pid, started: self.started, branch: currentBranch(cwd) };
  return { lock, identity, ownerText: '', pending, held: false };
}

/**
 * Takes the lock if it is free: the rename fails while another lock directory sits in place. The owner file is
 * written into the still private directory first, stamped with this attempt's time, so `since` is when it took it.
 */
function take(claim: Claim): boolean {
  claim.ownerText = JSON.stringify({ ...claim.identity, since: new Date().toISOString() } satisfies Holder);
  writeFileSync(path.join(claim.pending, 'owner'), claim.ownerText);
  try {
    renameSync(claim.pending, claim.lock);
    claim.held = true;
    return true;
  } catch (error) {
    if (['ENOTEMPTY', 'EEXIST'].includes(errorCode(error) ?? '')) return false;
    throw error;
  }
}

/** Removes what this claim made: the lock if it holds it (and it is still its own), and its unused directory. */
function release(claim: Claim): void {
  rmSync(claim.pending, { recursive: true, force: true });
  if (claim.held && readOwner(claim.lock) === claim.ownerText) removeLock(claim.lock);
  claim.held = false;
}

/** Whether to try again at once, because the lock went or was taken over, rather than wait a poll. */
function retryNow(lock: string, owner: string | null, options: LockOptions): boolean {
  return owner === null || (isStale(owner, options.startTimeOf ?? psStartTime) && takeOver(lock, owner));
}

async function acquire(claim: Claim, name: string, options: LockOptions): Promise<void> {
  const deadline = Date.now() + options.timeoutMs;
  let onWait = options.onWait;
  while (!take(claim)) {
    const owner = readOwner(claim.lock);
    if (retryNow(claim.lock, owner, options)) continue;
    if (Date.now() >= deadline)
      throw new Error(
        `timed out after ${options.timeoutMs / 1000} s waiting for the lock "${name}" at ${claim.lock}, held by ${describeOwner(owner ?? '')}`,
      );
    onWait?.(parseOwner(owner ?? ''));
    onWait = undefined;
    await sleep(options.pollMs);
  }
}

const SIGNALS = ['SIGINT', 'SIGTERM'] as const;

/**
 * Runs `handle` on SIGINT or SIGTERM, then stops listening and lets the process die by that signal. Returns the
 * uninstaller.
 */
function onSignals(handle: () => void): () => void {
  const handler = (signal: NodeJS.Signals) => {
    handle();
    for (const s of SIGNALS) process.removeListener(s, handler);
    // Die by the signal, as the process would have without this handler, unless someone else handles it.
    if (process.listenerCount(signal) === 0) process.kill(process.pid, signal);
  };
  for (const s of SIGNALS) process.on(s, handler);
  return () => {
    for (const s of SIGNALS) process.removeListener(s, handler);
  };
}

/**
 * Runs `fn` holding the lock `name`, waiting while another process holds it, and releases it however `fn` ends:
 * on return, on a throw, and on SIGINT or SIGTERM, after which the process still dies by that signal. Throws after `timeoutMs` of waiting. Before taking it, deletes what killed
 * takers left behind (sweepLeftovers). Not reentrant: a process waits on its own lock like on anyone's.
 */
export async function withLock<T>(name: string, options: LockOptions, fn: () => T | Promise<T>): Promise<T> {
  const claim = prepare(name, options.cwd ?? process.cwd(), options);
  const stopListening = onSignals(() => release(claim));
  try {
    await acquire(claim, name, options);
    return await fn();
  } finally {
    release(claim);
    // A signal that arrived during synchronous work in `fn` is dispatched only once the event loop turns: turn it
    // once while the handler is still installed, so the process dies by that signal instead of carrying on.
    await new Promise((resolve) => setImmediate(resolve));
    stopListening();
  }
}
