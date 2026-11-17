import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { gate } from './lock.fixture.ts';
import { withLock } from './lock.ts';
import { TEST_LOCK } from './test-lock.ts';

// A commit hook exports GIT_DIR and friends, and CI sets CI: either would change what these runs see.
for (const name of Object.keys(process.env)) if (name.startsWith('GIT_') || name === 'CI') delete process.env[name];

function repo() {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'test-lock-')));
  execFileSync('git', ['init', '-q', '-b', 'work', root]);
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'init'], {
    cwd: root,
  });
  return { root, order: path.join(root, 'order.txt') };
}

const MODULE = path.join(import.meta.dirname, 'test-lock.ts');

function taker(
  cwd: string,
  id: string,
  options: { holdMilliseconds?: number; timeoutMilliseconds?: number; env?: Record<string, string> },
) {
  const run = `fs.appendFileSync('order.txt', 'start-${id}\\n'); console.log('started');
    await new Promise((resolve) => setTimeout(resolve, ${options.holdMilliseconds ?? 0}));
    fs.appendFileSync('order.txt', 'end-${id}\\n');`;
  const code = `import { withTestLock } from ${JSON.stringify(MODULE)}; import fs from 'node:fs';
    await withTestLock(async () => { ${run} }, { pollMilliseconds: 20, timeoutMilliseconds: ${options.timeoutMilliseconds ?? 10_000} });`;
  const proc = spawn(process.execPath, ['--input-type=module', '-e', code], {
    cwd,
    env: { ...process.env, ...options.env },
  });
  let stderr = '';
  let started: () => void = () => undefined;
  let waits: () => void = () => undefined;
  const runStarted = new Promise<void>((resolve) => (started = resolve));
  const waiting = new Promise<void>((resolve) => (waits = resolve));
  proc.stdout.on('data', (chunk: Buffer) => chunk.toString().includes('started') && started());
  proc.stderr.on('data', (chunk: Buffer) => {
    stderr += chunk.toString();
    if (stderr.includes('test lock: waiting')) waits();
  });
  const done = new Promise<{ code: number | null; stderr: string }>((resolve) =>
    proc.on('close', (exitCode) => resolve({ code: exitCode, stderr })),
  );
  return { pid: proc.pid, runStarted, waiting, done };
}

async function holdTestLock(root: string) {
  const released = gate();
  const holding = gate();
  const holder = withLock(TEST_LOCK, { cwd: root, pollMilliseconds: 20, timeoutMilliseconds: 10_000 }, async () => {
    holding.open();
    await released.opened;
  });
  await holding.opened;
  return async () => {
    released.open();
    await holder;
  };
}

const lines = (file: string) => readFileSync(file, 'utf8').trim().split('\n');

describe('withTestLock', () => {
  describe('success cases', () => {
    it('runs the test runs of two processes one after the other, never overlapping', async () => {
      // ARRANGE
      const { root, order } = repo();
      const expectedOrder = ['start-first', 'end-first', 'start-second', 'end-second'];
      // ACT
      const first = taker(root, 'first', { holdMilliseconds: 300 });
      await first.runStarted;
      const second = taker(root, 'second', {});
      const results = await Promise.all([first.done, second.done]);
      // ASSERT
      expect(lines(order)).toEqual(expectedOrder);
      expect(results.map((result) => result.code)).toEqual([0, 0]);
    });

    it("prints one waiting line naming the holder's branch, pid and age", async () => {
      // ARRANGE
      const { root } = repo();
      const release = await holdTestLock(root);
      const expected = new RegExp(`^test lock: waiting for work \\(pid ${process.pid}, holding for \\d+ s\\)`);
      // ACT
      const second = taker(root, 'second', {});
      await second.waiting;
      await release();
      const { stderr } = await second.done;
      const waiting = stderr.split('\n').filter((line) => line.startsWith('test lock: waiting'));
      // ASSERT
      expect(waiting).toHaveLength(1);
      expect(waiting[0]).toMatch(expected);
    });
  });

  describe('failure cases', () => {
    it('fails after its timeout without running, naming the lock and its holder', async () => {
      // ARRANGE
      const { root, order } = repo();
      const release = await holdTestLock(root);
      const expectedError = new RegExp(`"${TEST_LOCK}".* held by pid ${process.pid} .*on branch work`);
      const expectedCode = 1;
      // ACT
      const result = await taker(root, 'never', { timeoutMilliseconds: 100 }).done;
      await release();
      // ASSERT
      expect(result.code).toBe(expectedCode);
      expect(result.stderr).toMatch(expectedError);
      expect(() => lines(order)).toThrow();
    });
  });

  describe('edge cases', () => {
    it('never takes the lock on CI: the run goes ahead while another process holds it', async () => {
      // ARRANGE
      const { root, order } = repo();
      const release = await holdTestLock(root);
      const expectedOrder = ['start-ci', 'end-ci'];
      // ACT
      const result = await taker(root, 'ci', { env: { CI: 'true' }, timeoutMilliseconds: 100 }).done;
      await release();
      // ASSERT
      expect(result.code).toBe(0);
      expect(lines(order)).toEqual(expectedOrder);
    });
  });
});
