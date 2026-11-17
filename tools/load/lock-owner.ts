import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export interface Holder {
  pid: number;
  started: string;
  branch: string;
  since: string;
}

export type ProcessStart = { state: 'running'; started: string } | { state: 'gone' } | { state: 'unknown' };

export function psStartTime(pid: number): ProcessStart {
  const ps = spawnSync('ps', ['-o', 'lstart=', '-p', String(pid)], {
    encoding: 'utf8',
    env: { ...process.env, LC_ALL: 'C' },
  });
  if (ps.error !== undefined || ps.status === null) return { state: 'unknown' };
  const started = ps.stdout.trim().replace(/\s+/g, ' ');
  return ps.status === 0 && started !== '' ? { state: 'running', started } : { state: 'gone' };
}

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

export function describeOwner(ownerText: string): string {
  const owner = parseOwner(ownerText);
  if (owner === null) return 'no readable owner';
  const branch = owner.branch ? ` on branch ${owner.branch}` : '';
  return `pid ${owner.pid} (started ${owner.started})${branch} since ${owner.since}`;
}

export function isStale(ownerText: string, startTimeOf: (pid: number) => ProcessStart): boolean {
  const owner = parseOwner(ownerText);
  if (owner === null) return true;
  const holder = startTimeOf(owner.pid);
  if (holder.state === 'unknown') return false;
  return holder.state === 'gone' || holder.started !== owner.started;
}
