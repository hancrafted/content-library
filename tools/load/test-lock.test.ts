import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { gate } from './lock.fixture.ts';
import { withLock } from './lock.ts';
import { TEST_LOCK } from './test-lock.ts';

// A commit hook exports GIT_DIR and friends, and CI sets CI: either would change what these runs see.
for (const name of Object.keys(process.env)) if (name.startsWith('GIT_') || name === 'CI') delete process.env[name];

/** A fresh repository on branch `work`, where each run's command appends to `order.txt`. */
function repo() {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'test-lock-')));
  execFileSync('git', ['init', '-q', '-b', 'work', root]);
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'init'], {
    cwd: root,
  });
  return { root, order: path.join(root, 'order.txt') };
}

const CLI = path.join(import.meta.dirname, 'test-lock.ts');

/** A command that marks its start, says so on stdout, holds on for `ms`, then marks its end. */
const marked = (id: string, ms: number) =>
  ['sh', '-c', `echo start-${id} >> order.txt; echo started; sleep ${ms / 1000}; echo end-${id} >> order.txt`] as const;

/** Runs the test-lock CLI in `cwd` with short timings, as pre-push runs it with its own. */
function run(
  cwd: string,
  command: readonly string[],
  options: { env?: Record<string, string>; timeoutMilliseconds?: number; flags?: string[] } = {},
) {
  const flags = options.flags ?? ['--poll-ms', '20', '--timeout-ms', String(options.timeoutMilliseconds ?? 10_000)];
  const args = [CLI, ...flags, '--', ...command];
  const proc = spawn(process.execPath, args, { cwd, env: { ...process.env, ...options.env } });
  let stdout = '';
  let stderr = '';
  let started: () => void = () => undefined;
  const commandStarted = new Promise<void>((resolve) => (started = resolve));
  proc.stdout.on('data', (chunk: Buffer) => {
    stdout += chunk.toString();
    if (stdout.includes('started')) started();
  });
  proc.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()));
  const done = new Promise<{ code: number | null; signal: NodeJS.Signals | null; stderr: string }>((resolve) =>
    proc.on('close', (code, signal) => resolve({ code, signal, stderr })),
  );
  return { pid: proc.pid, commandStarted, done, kill: (signal: NodeJS.Signals) => proc.kill(signal) };
}

const lines = (file: string) => readFileSync(file, 'utf8').trim().split('\n');

describe('test-lock', () => {
  describe('success cases', () => {
    it('runs the commands of two concurrent invocations one after the other, never overlapping', async () => {
      // ARRANGE
      const { root, order } = repo();
      const expectedOrder = ['start-first', 'end-first', 'start-second', 'end-second'];
      // ACT
      const first = run(root, marked('first', 300));
      await first.commandStarted;
      const second = run(root, marked('second', 0));
      const results = await Promise.all([first.done, second.done]);
      // ASSERT
      expect(lines(order)).toEqual(expectedOrder);
      expect(results.map((result) => result.code)).toEqual([0, 0]);
    });

    it("prints one waiting line naming the holder's branch, pid and age", async () => {
      // ARRANGE
      const { root } = repo();
      const first = run(root, marked('first', 300));
      await first.commandStarted;
      const expected = new RegExp(`^test lock: waiting for work \\(pid ${first.pid}, holding for \\d+ s\\)`);
      // ACT
      const second = await run(root, marked('second', 0)).done;
      await first.done;
      const waiting = second.stderr.split('\n').filter((line) => line.startsWith('test lock: waiting'));
      // ASSERT
      expect(waiting).toHaveLength(1);
      expect(waiting[0]).toMatch(expected);
    });
  });

  describe('failure cases', () => {
    it('fails after its timeout without running the command, naming the lock and its holder', async () => {
      // ARRANGE
      const { root, order } = repo();
      const released = gate();
      const holding = gate();
      const holder = withLock(TEST_LOCK, { cwd: root, pollMilliseconds: 20, timeoutMilliseconds: 10_000 }, async () => {
        holding.open();
        await released.opened;
      });
      await holding.opened;
      const expectedError = new RegExp(`"${TEST_LOCK}".* held by pid ${process.pid} .*on branch work`);
      const expectedCode = 1;
      // ACT
      const result = await run(root, marked('never', 0), { timeoutMilliseconds: 100 }).done;
      released.open();
      await holder;
      // ASSERT
      expect(result.code).toBe(expectedCode);
      expect(result.stderr).toMatch(expectedError);
      expect(() => lines(order)).toThrow();
    });

    it.each([
      ['--timeout-ms', 'soon'],
      ['--poll-ms', '0'],
      ['--timeout-ms', '-5'],
    ])('refuses %s=%s without running the command', async (flag, value) => {
      // ARRANGE
      const { root, order } = repo();
      const expectedCode = 2;
      const expectedError = `${flag} takes a positive number of milliseconds, not "${value}"`;
      // ACT
      const result = await run(root, marked('never', 0), { flags: [`${flag}=${value}`] }).done;
      // ASSERT
      expect(result.code).toBe(expectedCode);
      expect(result.stderr).toContain(expectedError);
      expect(existsSync(order)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('never takes the lock on CI: the command runs while another process holds it', async () => {
      // ARRANGE
      const { root, order } = repo();
      const released = gate();
      const holding = gate();
      const holder = withLock(TEST_LOCK, { cwd: root, pollMilliseconds: 20, timeoutMilliseconds: 10_000 }, async () => {
        holding.open();
        await released.opened;
      });
      await holding.opened;
      const expectedOrder = ['start-ci', 'end-ci'];
      // ACT
      const result = await run(root, marked('ci', 0), { env: { CI: 'true' }, timeoutMilliseconds: 100 }).done;
      released.open();
      await holder;
      // ASSERT
      expect(result.code).toBe(0);
      expect(lines(order)).toEqual(expectedOrder);
    });

    it('passes a SIGTERM on to the command and keeps the lock until the command has exited, exiting as it did', async () => {
      // ARRANGE
      const { root, order } = repo();
      const lock = path.join(root, '.git', 'locks', `${TEST_LOCK}.lock`);
      const script = `trap '[ -d "${lock}" ] && echo lock-held >> order.txt; exit 7' TERM; echo started; while :; do sleep 0.02; done`;
      const expectedCode = 7;
      const expectedOrder = ['lock-held'];
      // ACT
      const cli = run(root, ['sh', '-c', script]);
      await cli.commandStarted;
      cli.kill('SIGTERM');
      const result = await cli.done;
      // ASSERT
      expect(result.code, result.stderr).toBe(expectedCode);
      expect(lines(order)).toEqual(expectedOrder);
      expect(existsSync(lock)).toBe(false);
    });

    it('dies by the signal that killed the command', async () => {
      // ARRANGE
      const { root } = repo();
      const signal = 'SIGTERM';
      // ACT
      const cli = run(root, ['sh', '-c', 'echo started; while :; do sleep 0.02; done']);
      await cli.commandStarted;
      cli.kill(signal);
      const result = await cli.done;
      // ASSERT
      expect(result.signal, result.stderr).toBe(signal);
    });

    it("exits with the command's own exit code", async () => {
      // ARRANGE
      const { root } = repo();
      const expectedCode = 3;
      // ACT
      const result = await run(root, ['sh', '-c', `exit ${expectedCode}`]).done;
      // ASSERT
      expect(result.code).toBe(expectedCode);
    });
  });
});
