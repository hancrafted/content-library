import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
  vi.restoreAllMocks();
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const DEV = 4002;
const SPEC = 4003;
const DEV_PID = 111;
const SPEC_PID = 222;

describe('success cases', () => {
  it('stops the one server of a port and removes its pid file', () => {
    // ARRANGE
    const root = worktree({ [DEV]: DEV_PID, [SPEC]: SPEC_PID });
    const killed: number[] = [];
    // ACT
    const stopped = stopServers(root, { port: DEV, kill: (pid) => void killed.push(pid) });
    // ASSERT
    expect(stopped).toEqual([DEV]);
    expect(killed).toEqual([DEV_PID]);
    expect(existsSync(pidFile(root, 'demo', DEV))).toBe(false);
    expect(existsSync(pidFile(root, 'demo', SPEC))).toBe(true);
  });

  it('stops every server of the worktree when no port is named', () => {
    // ARRANGE
    const root = worktree({ [DEV]: DEV_PID, [SPEC]: SPEC_PID });
    const killed: number[] = [];
    // ACT
    const stopped = stopServers(root, { kill: (pid) => void killed.push(pid) });
    // ASSERT
    expect(stopped.sort()).toEqual([DEV, SPEC]);
    expect(killed.sort()).toEqual([DEV_PID, SPEC_PID]);
  });
});

describe('failure cases', () => {
  it('stops nothing for a port the Run recorded no server on', () => {
    // ARRANGE
    const root = worktree({ [DEV]: DEV_PID });
    const killed: number[] = [];
    // ACT
    const stopped = stopServers(root, { port: SPEC, kill: (pid) => void killed.push(pid) });
    // ASSERT
    expect(stopped).toEqual([]);
    expect(killed).toEqual([]);
    expect(existsSync(pidFile(root, 'demo', DEV))).toBe(true);
  });

  describe('process kill', () => {
    const refusedWith = (code: string) => () => {
      throw Object.assign(new Error(`kill ${code}`), { code });
    };

    it('treats a server group that already stopped as stopped and removes its pid file', () => {
      // ARRANGE
      const root = worktree({ [DEV]: DEV_PID });
      vi.spyOn(process, 'kill').mockImplementation(refusedWith('ESRCH'));
      // ACT
      const stopped = stopServers(root, { port: DEV });
      // ASSERT
      expect(stopped).toEqual([DEV]);
      expect(existsSync(pidFile(root, 'demo', DEV))).toBe(false);
    });

    it('surfaces a kill the system refused instead of reporting the server stopped', () => {
      // ARRANGE
      const root = worktree({ [DEV]: DEV_PID });
      vi.spyOn(process, 'kill').mockImplementation(refusedWith('EPERM'));
      // ACT
      const stop = () => stopServers(root, { port: DEV });
      // ASSERT
      expect(stop).toThrow(/EPERM/);
    });
  });
});

describe('edge cases', () => {
  it('finds nothing to stop in a worktree that started no server', () => {
    // ARRANGE
    const root = worktree({});
    // ACT
    const stopped = stopServers(root, { kill: () => expect.fail('nothing to kill') });
    // ASSERT
    expect(stopped).toEqual([]);
  });
});
