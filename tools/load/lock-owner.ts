// Who holds a lock (tools/load/lock.ts): its `owner` file, and whether the process it names still runs, told by its
// pid and its start time so a reused pid does not pass for the holder.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** Who holds a lock, as its `owner` file records it. */
export interface Holder {
  pid: number;
  /** The holder's process start time as `ps -o lstart` prints it, which tells a reused pid apart. */
  started: string;
  /** The branch checked out where the holder took the lock; empty on a detached HEAD. */
  branch: string;
  /** When the holder took the lock, as an ISO date. */
  since: string;
}

/**
 * What `ps` says about a pid: the process's start time, `gone` when no process has that pid, or `unknown` when `ps`
 * itself could not run (EAGAIN under load), which proves nothing about the holder.
 */
export type ProcessStart = { state: 'running'; started: string } | { state: 'gone' } | { state: 'unknown' };

/** What `ps` says about `pid` (see ProcessStart). */
export function psStartTime(pid: number): ProcessStart {
  const ps = spawnSync('ps', ['-o', 'lstart=', '-p', String(pid)], {
    encoding: 'utf8',
    env: { ...process.env, LC_ALL: 'C' },
  });
  if (ps.error !== undefined || ps.status === null) return { state: 'unknown' };
  const started = ps.stdout.trim().replace(/\s+/g, ' ');
  return ps.status === 0 && started !== '' ? { state: 'running', started } : { state: 'gone' };
}

/** The owner file's text, `''` when the lock exists without a readable one, or null when there is no lock. */
export function readOwner(lock: string): string | null {
  try {
    return readFileSync(path.join(lock, 'owner'), 'utf8');
  } catch {
    return existsSync(lock) ? '' : null;
  }
}

export function parseOwner(ownerText: string): Holder | null {
  try {
    return JSON.parse(ownerText) as Holder;
  } catch {
    return null;
  }
}

/** The holder as an error message names it. */
export function describeOwner(ownerText: string): string {
  const owner = parseOwner(ownerText);
  if (owner === null) return 'no readable owner';
  const branch = owner.branch ? ` on branch ${owner.branch}` : '';
  return `pid ${owner.pid} (started ${owner.started})${branch} since ${owner.since}`;
}

/**
 * Whether the holder is gone: dead, its pid reused by a process started at another time, or no owner at all. A
 * holder `ps` could not be asked about is not: the waiter keeps waiting rather than take a live lock.
 */
export function isStale(ownerText: string, startTimeOf: (pid: number) => ProcessStart): boolean {
  const owner = parseOwner(ownerText);
  if (owner === null) return true;
  const holder = startTimeOf(owner.pid);
  if (holder.state === 'unknown') return false;
  return holder.state === 'gone' || holder.started !== owner.started;
}
