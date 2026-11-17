import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { withLock } from './lock.ts';

// A commit hook exports GIT_DIR and friends, which would point these tmp repos at the real one.
for (const name of Object.keys(process.env)) if (name.startsWith('GIT_')) delete process.env[name];

/** A fresh repository with a linked worktree; the locks live in the git common directory both share. */
function repo() {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'load-lock-')));
  const main = path.join(root, 'main');
  const linked = path.join(root, 'linked');
  execFileSync('git', ['init', '-q', main]);
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'init'], {
    cwd: main,
  });
  execFileSync('git', ['worktree', 'add', '-q', '-b', 'linked', linked], { cwd: main });
  return { root, main, linked, locks: path.join(main, '.git', 'locks') };
}

const FAST = { pollMs: 10, timeoutMs: 5000 };

/** A promise and the function that settles it, so a test decides when a holder lets go. */
function gate() {
  let open: () => void = () => undefined;
  const opened = new Promise<void>((resolve) => (open = resolve));
  return { open, opened };
}

/** A pid that belonged to a process which has exited. */
const deadPid = (): number =>
  Number(execFileSync(process.execPath, ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }).trim());

/** Plants a lock as a holder that is gone would have left it. */
function plantLock(lock: string, owner: { pid: number; started: string }): void {
  mkdirSync(lock, { recursive: true });
  writeFileSync(path.join(lock, 'owner'), JSON.stringify(owner));
}

const MODULE = path.join(import.meta.dirname, 'lock.ts');

/** Runs `body` in its own Node process with `withLock` imported, as a second `wt:done` or `verify` would. */
function child(body: string, args: string[], onLine?: (line: string, kill: (s: NodeJS.Signals) => void) => void) {
  const code = `import { withLock } from ${JSON.stringify(MODULE)};\nimport fs from 'node:fs';\n${body}`;
  return new Promise<{ code: number | null; signal: NodeJS.Signals | null; output: string }>((resolve) => {
    const proc = spawn(process.execPath, ['--input-type=module', '-e', code, ...args]);
    let output = '';
    proc.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString();
      for (const line of chunk.toString().split('\n')) if (line) onLine?.(line, (s) => proc.kill(s));
    });
    proc.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()));
    proc.on('close', (exit, signal) => resolve({ code: exit, signal, output }));
  });
}

describe('withLock', () => {
  describe('success cases', () => {
    it('runs the function, returns its value and leaves the lock free for the next caller', async () => {
      // ARRANGE
      const { main } = repo();
      const expected = 'merged';
      // ACT
      const first = await withLock('base', { ...FAST, cwd: main }, () => expected);
      const second = await withLock('base', { ...FAST, cwd: main, timeoutMs: 0 }, () => expected);
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
      const after = await withLock('base', { ...FAST, cwd: main, timeoutMs: 0 }, () => next);
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
      const run = withLock('base', { ...FAST, cwd: main, timeoutMs: 50 }, () => 'never');
      // ASSERT
      await expect(run).rejects.toThrow(expected);
      holder.open();
      await first;
    });

    it('releases the lock and dies by the signal when interrupted while holding it, even mid synchronous work', async () => {
      // ARRANGE
      const { main, locks } = repo();
      const body = `await withLock('base', { cwd: process.argv[1], pollMs: 10, timeoutMs: 5000 }, () => {
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
      const result = await withLock('base', { ...FAST, cwd: main, timeoutMs: 0 }, () => expected);
      // ASSERT
      expect(result).toBe(expected);
    });

    it('takes over a lock whose pid now belongs to another process, told apart by its start time', async () => {
      // ARRANGE
      const { main, locks } = repo();
      plantLock(path.join(locks, 'base.lock'), { pid: process.pid, started: 'Thu Jan  1 00:00:00 1970' });
      const expected = 'taken over';
      // ACT
      const result = await withLock('base', { ...FAST, cwd: main, timeoutMs: 0 }, () => expected);
      // ASSERT
      expect(result).toBe(expected);
    });

    it('lets only one of several waiters take over a dead holder’s lock at a time', async () => {
      // ARRANGE
      const { root, main, locks } = repo();
      plantLock(path.join(locks, 'base.lock'), { pid: deadPid(), started: 'Thu Jan  1 00:00:00 1970' });
      const log = path.join(root, 'holders.log');
      const body = `await withLock('base', { cwd: process.argv[1], pollMs: 5, timeoutMs: 10000 }, () => {
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
      const second = await withLock('a-b/c', { ...FAST, cwd: main, timeoutMs: 0 }, () => expected);
      // ASSERT
      expect(second).toBe(expected);
      holder.open();
      await first;
    });
  });
});
