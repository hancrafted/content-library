import { existsSync, mkdirSync, readdirSync, readFileSync, utimesSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { dropGitEnvironment } from './git-environment.fixture.ts';
import { psStartTime } from './lock-owner.ts';
import { child, deadPid, FAST, gate, plantLock, repo } from './lock.fixture.ts';
import { withLock } from './lock.ts';

dropGitEnvironment(process.env);

describe('withLock', () => {
  describe('success cases', () => {
    it('runs the function, returns its value and leaves the lock free for the next caller', async () => {
      // ARRANGE
      const { main } = repo();
      const expected = 'merged';
      // ACT
      const first = await withLock('base', { ...FAST, cwd: main }, () => expected);
      const second = await withLock('base', { ...FAST, cwd: main, timeoutMilliseconds: 0 }, () => expected);
      // ASSERT
      expect(first).toBe(expected);
      expect(second).toBe(expected);
    });

    it('makes a second caller wait until the holder is done, telling it once that it waits', async () => {
      // ARRANGE
      const { main, linked } = repo();
      const holder = gate();
      const waiting = gate();
      const order: string[] = [];
      let waits = 0;
      const expectedOrder = ['first starts', 'first ends', 'second runs'];
      // ACT
      const first = withLock('base', { ...FAST, cwd: main }, async () => {
        order.push('first starts');
        await holder.opened;
        order.push('first ends');
      });
      const second = withLock(
        'base',
        {
          ...FAST,
          cwd: linked,
          onWait: () => {
            waits += 1;
            waiting.open();
          },
        },
        () => order.push('second runs'),
      );
      await waiting.opened;
      holder.open();
      await Promise.all([first, second]);
      // ASSERT
      expect(order).toEqual(expectedOrder);
      expect(waits).toBe(1);
    });
  });

  describe('failure cases', () => {
    it('releases the lock when the function throws, passing the error on', async () => {
      // ARRANGE
      const { main } = repo();
      const message = 'merge conflict';
      const next = 'next caller ran';
      const fails = () => {
        throw new Error(message);
      };
      // ACT
      const failed = await withLock('base', { ...FAST, cwd: main }, fails).catch((error: Error) => error.message);
      const after = await withLock('base', { ...FAST, cwd: main, timeoutMilliseconds: 0 }, () => next);
      // ASSERT
      expect(failed).toBe(message);
      expect(after).toBe(next);
    });

    it('gives up after the timeout while a live holder keeps the lock, naming the lock and its holder', async () => {
      // ARRANGE
      const { main } = repo();
      const holder = gate();
      const held = gate();
      const first = withLock('base', { ...FAST, cwd: main }, async () => {
        held.open();
        await holder.opened;
      });
      await held.opened;
      const expected = new RegExp(`timed out .*"base".* held by pid ${process.pid}`);
      // ACT
      const run = withLock('base', { ...FAST, cwd: main, timeoutMilliseconds: 50 }, () => 'never');
      // ASSERT
      await expect(run).rejects.toThrow(expected);
      holder.open();
      await first;
    });

    it('releases the lock and dies by the signal when interrupted while holding it, even mid synchronous work', async () => {
      // ARRANGE
      const { main, locks } = repo();
      const body = `await withLock('base', { cwd: process.argv[1], pollMilliseconds: 10, timeoutMilliseconds: 5000 }, () => {
        fs.writeSync(1, 'held\\n');
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
      });
      fs.writeSync(1, 'carried on\\n');`;
      const signal = 'SIGINT';
      const afterLock = 'carried on';
      // ACT
      const result = await child(body, [main], (line, kill) => line === 'held' && kill(signal));
      // ASSERT
      expect(result.signal, result.output).toBe(signal);
      expect(result.output).not.toContain(afterLock);
      expect(existsSync(path.join(locks, 'base.lock'))).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('takes over a lock whose holder died', async () => {
      // ARRANGE
      const { main, locks } = repo();
      plantLock(path.join(locks, 'base.lock'), { pid: deadPid(), started: 'Thu Jan  1 00:00:00 1970' });
      const expected = 'taken over';
      // ACT
      const result = await withLock('base', { ...FAST, cwd: main, timeoutMilliseconds: 0 }, () => expected);
      // ASSERT
      expect(result).toBe(expected);
    });

    it('takes over a lock whose pid now belongs to another process, told apart by its start time', async () => {
      // ARRANGE
      const { main, locks } = repo();
      plantLock(path.join(locks, 'base.lock'), { pid: process.pid, started: 'Thu Jan  1 00:00:00 1970' });
      const expected = 'taken over';
      // ACT
      const result = await withLock('base', { ...FAST, cwd: main, timeoutMilliseconds: 0 }, () => expected);
      // ASSERT
      expect(result).toBe(expected);
    });

    it('lets only one of several waiters take over a dead holder’s lock at a time', async () => {
      // ARRANGE
      const { root, main, locks } = repo();
      plantLock(path.join(locks, 'base.lock'), { pid: deadPid(), started: 'Thu Jan  1 00:00:00 1970' });
      const log = path.join(root, 'holders.log');
      const body = `await withLock('base', { cwd: process.argv[1], pollMilliseconds: 5, timeoutMilliseconds: 10000 }, () => {
        fs.appendFileSync(process.argv[2], 'start\\n');
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
        fs.appendFileSync(process.argv[2], 'end\\n');
      });`;
      const waiters = 6;
      const expected = Array.from({ length: waiters }, () => ['start', 'end']).flat();
      // ACT
      const results = await Promise.all(Array.from({ length: waiters }, () => child(body, [main, log])));
      // ASSERT
      expect(
        results.map((r) => r.code),
        results.map((r) => r.output).join('\n'),
      ).toEqual(Array.from({ length: waiters }, () => 0));
      expect(readFileSync(log, 'utf8').trim().split('\n')).toEqual(expected);
    });

    it('keeps waiting rather than take over a lock whose holder ps could not be asked about', async () => {
      // ARRANGE
      const { main, locks } = repo();
      plantLock(path.join(locks, 'base.lock'), { pid: deadPid(), started: 'Thu Jan  1 00:00:00 1970' });
      const psFailsForOthers = (pid: number) =>
        pid === process.pid ? psStartTime(pid) : ({ state: 'unknown' } as const);
      const expected = /timed out .*"base"/;
      // ACT
      const run = withLock(
        'base',
        { ...FAST, cwd: main, timeoutMilliseconds: 50, startTimeOf: psFailsForOthers },
        () => 'never',
      );
      // ASSERT
      await expect(run).rejects.toThrow(expected);
    });

    it('deletes the pending and stale directories killed takers left over an hour ago, and only those', async () => {
      // ARRANGE
      const { main, locks } = repo();
      const now = new Date('2026-11-17T12:00:00.000Z');
      const leftovers = {
        'base.lock.pending-old': new Date('2026-11-17T10:00:00.000Z'),
        'base.lock.stale-old': new Date('2026-11-17T10:59:00.000Z'),
        'base.lock.pending-recent': new Date('2026-11-17T11:30:00.000Z'),
        'other.lock.stale-recent': new Date('2026-11-17T11:59:00.000Z'),
      };
      for (const [name, changed] of Object.entries(leftovers)) {
        mkdirSync(path.join(locks, name), { recursive: true });
        utimesSync(path.join(locks, name), changed, changed);
      }
      const expected = ['base.lock.pending-recent', 'other.lock.stale-recent'];
      // ACT
      await withLock('base', { ...FAST, cwd: main, now }, () => undefined);
      // ASSERT
      expect(readdirSync(locks).sort()).toEqual(expected);
    });

    it('keeps names apart that differ only in where a slash and a dash sit', async () => {
      // ARRANGE
      const { main } = repo();
      const holder = gate();
      const held = gate();
      const first = withLock('a/b-c', { ...FAST, cwd: main }, async () => {
        held.open();
        await holder.opened;
      });
      await held.opened;
      const expected = 'not blocked';
      // ACT
      const second = await withLock('a-b/c', { ...FAST, cwd: main, timeoutMilliseconds: 0 }, () => expected);
      // ASSERT
      expect(second).toBe(expected);
      holder.open();
      await first;
    });
  });
});
