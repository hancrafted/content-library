// A named lock shared by this clone and its worktrees, so work that must not overlap runs one at a time:
// `wt:done` and `wt:sync` merging into one base, and the test lock pre-push's tests queue on.
//
// The lock is a directory `locks/<name>.lock` in the git common directory, holding an `owner` file with the
// holder's pid and process start time. It appears whole, by renaming a filled temporary directory into place, so
// a lock never exists without its owner and only one of several takers gets it. A lock whose holder died, or whose
// pid now belongs to another process (its start time differs), is stale and is taken over (see `takeOver`).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export interface LockOptions {
  /** A directory inside the repository; its git common directory holds the lock. Default: the current directory. */
  cwd?: string;
  /** How often a waiter looks again. */
  pollMs: number;
  /** How long a waiter waits before it throws. */
  timeoutMs: number;
  /** Called once, when the lock is held by another process and this one starts to wait. */
  onWait?: () => void;
}

interface Owner {
  pid: number;
  /** The holder's process start time as `ps -o lstart` prints it, which tells a reused pid apart. */
  started: string;
}

/** A takeover marker this old belongs to a waiter killed mid-takeover, which takes microseconds. */
const MARKER_STALE_MS = 10_000;

const errorCode = (error: unknown) => (error as NodeJS.ErrnoException).code;

/** The start time of a running process, or null when no process has that pid. */
function startTime(pid: number): string | null {
  const ps = spawnSync('ps', ['-o', 'lstart=', '-p', String(pid)], {
    encoding: 'utf8',
    env: { ...process.env, LC_ALL: 'C' },
  });
  const started = ps.stdout?.trim().replace(/\s+/g, ' ') ?? '';
  return ps.status === 0 && started !== '' ? started : null;
}

/** The owner file's text, `''` when the lock exists without a readable one, or null when there is no lock. */
function readOwner(lock: string): string | null {
  try {
    return readFileSync(path.join(lock, 'owner'), 'utf8');
  } catch {
    return existsSync(lock) ? '' : null;
  }
}

function parseOwner(ownerText: string): Owner | null {
  try {
    return JSON.parse(ownerText) as Owner;
  } catch {
    return null;
  }
}

/** The holder as an error message names it. */
function describeOwner(ownerText: string): string {
  const owner = parseOwner(ownerText);
  return owner === null ? 'no readable owner' : `pid ${owner.pid} (started ${owner.started})`;
}

/** Whether the holder is gone: dead, its pid reused by a process started at another time, or no owner at all. */
function isStale(ownerText: string): boolean {
  const owner = parseOwner(ownerText);
  return owner === null || startTime(owner.pid) !== owner.started;
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
  const aside = mkdtempSync(`${lock}.stale-`);
  renameSync(lock, path.join(aside, 'lock'));
  rmSync(aside, { recursive: true, force: true });
  return true;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The lock directory for `name` in the git common directory of `cwd`; names are escaped whole, so `a/b-c` ≠ `a-b/c`. */
function lockPath(name: string, cwd: string): string {
  const common = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd,
    encoding: 'utf8',
  });
  if (common.status !== 0) throw new Error(`no git repository at ${cwd}: ${common.stderr.trim()}`);
  return path.join(common.stdout.trim(), 'locks', `${encodeURIComponent(name)}.lock`);
}

/** One call's claim on a lock: its own owner text, and the filled directory it renames into place to take it. */
interface Claim {
  lock: string;
  mine: string;
  pending: string;
  held: boolean;
}

function prepare(name: string, cwd: string): Claim {
  const lock = lockPath(name, cwd);
  const started = startTime(process.pid);
  if (started === null) throw new Error("cannot read this process's start time with ps");
  const mine = JSON.stringify({ pid: process.pid, started } satisfies Owner);
  mkdirSync(path.dirname(lock), { recursive: true });
  const pending = mkdtempSync(`${lock}.pending-`);
  writeFileSync(path.join(pending, 'owner'), mine);
  return { lock, mine, pending, held: false };
}

/** Takes the lock if it is free: the rename fails while another lock directory sits in place. */
function take(claim: Claim): boolean {
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
  if (claim.held && readOwner(claim.lock) === claim.mine) rmSync(claim.lock, { recursive: true, force: true });
  claim.held = false;
}

/** Whether to try again at once, because the lock went or was taken over, rather than wait a poll. */
function retryNow(lock: string, owner: string | null): boolean {
  return owner === null || (isStale(owner) && takeOver(lock, owner));
}

async function acquire(claim: Claim, name: string, options: LockOptions): Promise<void> {
  const deadline = Date.now() + options.timeoutMs;
  let onWait = options.onWait;
  while (!take(claim)) {
    const owner = readOwner(claim.lock);
    if (retryNow(claim.lock, owner)) continue;
    if (Date.now() >= deadline)
      throw new Error(
        `timed out after ${options.timeoutMs / 1000} s waiting for the lock "${name}" at ${claim.lock}, held by ${describeOwner(owner ?? '')}`,
      );
    onWait?.();
    onWait = undefined;
    await sleep(options.pollMs);
  }
}

const SIGNALS = ['SIGINT', 'SIGTERM'] as const;

/** Runs `cleanup` on SIGINT or SIGTERM, then lets the process die by that signal; returns the uninstaller. */
function onSignals(cleanup: () => void): () => void {
  const handler = (signal: NodeJS.Signals) => {
    cleanup();
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
 * on return, on a throw, and on SIGINT or SIGTERM, after which the process still dies by that signal. Throws after
 * `timeoutMs` of waiting. Not reentrant: a process waits on its own lock like on anyone's.
 */
export async function withLock<T>(name: string, options: LockOptions, fn: () => T | Promise<T>): Promise<T> {
  const claim = prepare(name, options.cwd ?? process.cwd());
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
