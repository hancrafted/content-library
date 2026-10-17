import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { pidFile, stopServers } from './servers.ts';

const roots: string[] = [];
function worktree(pids: Record<number, number>): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'servers-'));
  roots.push(root);
  for (const [port, pid] of Object.entries(pids)) {
    mkdirSync(path.dirname(pidFile(root, 'demo', Number(port))), { recursive: true });
    writeFileSync(pidFile(root, 'demo', Number(port)), `${pid}\n`);
  }
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('stopServers', () => {
  it('stops the one server of a port and removes its pid file', () => {
    // ARRANGE
    const root = worktree({ 4002: 111, 4003: 222 });
    const killed: number[] = [];
    // ACT
    const stopped = stopServers(root, { port: 4002, kill: (pid) => void killed.push(pid) });
    // ASSERT
    expect(stopped).toEqual([4002]);
    expect(killed).toEqual([111]);
    expect(existsSync(pidFile(root, 'demo', 4002))).toBe(false);
    expect(existsSync(pidFile(root, 'demo', 4003))).toBe(true);
  });

  it('stops every server of the worktree when no port is named', () => {
    // ARRANGE
    const root = worktree({ 4002: 111, 4003: 222 });
    const killed: number[] = [];
    // ACT
    const stopped = stopServers(root, { kill: (pid) => void killed.push(pid) });
    // ASSERT
    expect(stopped.sort()).toEqual([4002, 4003]);
    expect(killed.sort()).toEqual([111, 222]);
  });

  it('finds nothing to stop in a worktree that started no server', () => {
    // ARRANGE
    const root = worktree({});
    // ACT / ASSERT
    expect(stopServers(root, { kill: () => expect.fail('nothing to kill') })).toEqual([]);
  });
});
