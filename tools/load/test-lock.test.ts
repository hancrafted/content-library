import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
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
  options: { env?: Record<string, string>; timeoutMs?: number } = {},
) {
  const args = [CLI, '--poll-ms', '20', '--timeout-ms', String(options.timeoutMs ?? 10_000), '--', ...command];
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
  const done = new Promise<{ code: number | null; stderr: string }>((resolve) =>
    proc.on('close', (code) => resolve({ code, stderr })),
  );
  return { pid: proc.pid, commandStarted, done };
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
      let release: () => void = () => undefined;
      const released = new Promise<void>((resolve) => (release = resolve));
      let held: () => void = () => undefined;
      const holding = new Promise<void>((resolve) => (held = resolve));
      const holder = withLock(TEST_LOCK, { cwd: root, pollMs: 20, timeoutMs: 10_000 }, async () => {
        held();
        await released;
      });
      await holding;
      const expectedError = new RegExp(`"${TEST_LOCK}".* held by pid ${process.pid} .*on branch work`);
      const expectedCode = 1;
      // ACT
      const result = await run(root, marked('never', 0), { timeoutMs: 100 }).done;
      release();
      await holder;
      // ASSERT
      expect(result.code).toBe(expectedCode);
      expect(result.stderr).toMatch(expectedError);
      expect(() => lines(order)).toThrow();
    });
  });

  describe('edge cases', () => {
    it('never takes the lock on CI: the command runs while another process holds it', async () => {
      // ARRANGE
      const { root, order } = repo();
      let release: () => void = () => undefined;
      const released = new Promise<void>((resolve) => (release = resolve));
      let held: () => void = () => undefined;
      const holding = new Promise<void>((resolve) => (held = resolve));
      const holder = withLock(TEST_LOCK, { cwd: root, pollMs: 20, timeoutMs: 10_000 }, async () => {
        held();
        await released;
      });
      await holding;
      const expectedOrder = ['start-ci', 'end-ci'];
      // ACT
      const result = await run(root, marked('ci', 0), { env: { CI: 'true' }, timeoutMs: 100 }).done;
      release();
      await holder;
      // ASSERT
      expect(result.code).toBe(0);
      expect(lines(order)).toEqual(expectedOrder);
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
