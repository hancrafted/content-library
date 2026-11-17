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

export interface Timing {
  pollMilliseconds: number;
  timeoutMilliseconds: number;
}

export interface LockOptions extends Timing {
  cwd?: string;
  onWait?: (holder: Holder | null) => void;
  startTimeOf?: (pid: number) => ProcessStart;
  now?: Date;
}

const MARKER_STALE_MILLISECONDS = 10_000;

const errorCode = (error: unknown) => (error as NodeJS.ErrnoException).code;

function removeLock(lock: string): void {
  const aside = mkdtempSync(`${lock}.stale-`);
  renameSync(lock, path.join(aside, 'lock'));
  rmSync(aside, { recursive: true, force: true });
}

function takeOver(lock: string, staleOwner: string): boolean {
  const marker = path.join(lock, 'takeover');
  try {
    mkdirSync(marker);
  } catch (error) {
    const claimed = errorCode(error) === 'EEXIST' ? statSync(marker, { throwIfNoEntry: false })?.mtimeMs : undefined;
    if (claimed !== undefined && Date.now() - claimed > MARKER_STALE_MILLISECONDS)
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

function lockPath(name: string, cwd: string): string {
  const common = gitCommonDir(cwd);
  if (common === null) throw new Error(`no git repository at ${cwd}`);
  return path.join(common, 'locks', `${encodeURIComponent(name)}.lock`);
}

const LEFTOVER_MILLISECONDS = 60 * 60 * 1000;

function sweepLeftovers(locks: string, now: Date): void {
  for (const entry of readdirSync(locks)) {
    if (!/\.lock\.(pending|stale)-/.test(entry)) continue;
    const dir = path.join(locks, entry);
    const changed = statSync(dir, { throwIfNoEntry: false })?.mtimeMs;
    if (changed !== undefined && now.getTime() - changed > LEFTOVER_MILLISECONDS)
      rmSync(dir, { recursive: true, force: true });
  }
}

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

function release(claim: Claim): void {
  rmSync(claim.pending, { recursive: true, force: true });
  if (claim.held && readOwner(claim.lock) === claim.ownerText) removeLock(claim.lock);
  claim.held = false;
}

function retryNow(lock: string, owner: string | null, options: LockOptions): boolean {
  return owner === null || (isStale(owner, options.startTimeOf ?? psStartTime) && takeOver(lock, owner));
}

async function acquire(claim: Claim, name: string, options: LockOptions): Promise<void> {
  const deadline = Date.now() + options.timeoutMilliseconds;
  let onWait = options.onWait;
  while (!take(claim)) {
    const owner = readOwner(claim.lock);
    if (retryNow(claim.lock, owner, options)) continue;
    if (Date.now() >= deadline)
      throw new Error(
        `timed out after ${options.timeoutMilliseconds / 1000} s waiting for the lock "${name}" at ${claim.lock}, held by ${describeOwner(owner ?? '')}`,
      );
    onWait?.(parseOwner(owner ?? ''));
    onWait = undefined;
    await sleep(options.pollMilliseconds);
  }
}

const SIGNALS = ['SIGINT', 'SIGTERM'] as const;

const turnEventLoopOnceSoASignalFromSynchronousWorkIsDispatched = () => new Promise((resolve) => setImmediate(resolve));

function onSignals(handle: () => void): () => void {
  const handler = (signal: NodeJS.Signals) => {
    handle();
    for (const s of SIGNALS) process.removeListener(s, handler);
    if (process.listenerCount(signal) === 0) process.kill(process.pid, signal);
  };
  for (const s of SIGNALS) process.on(s, handler);
  return () => {
    for (const s of SIGNALS) process.removeListener(s, handler);
  };
}

export async function withLock<T>(name: string, options: LockOptions, fn: () => T | Promise<T>): Promise<T> {
  const claim = prepare(name, options.cwd ?? process.cwd(), options);
  const stopListening = onSignals(() => release(claim));
  try {
    await acquire(claim, name, options);
    return await fn();
  } finally {
    release(claim);
    await turnEventLoopOnceSoASignalFromSynchronousWorkIsDispatched();
    stopListening();
  }
}
