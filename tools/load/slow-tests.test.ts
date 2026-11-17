import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { TestCase } from 'vitest/node';
import { SlowTestsLog, slowTestReport, trimSlowTests } from './slow-tests.mts';

// A commit hook exports GIT_DIR and friends, which would point these tmp repos at the real one.
for (const name of Object.keys(process.env)) if (name.startsWith('GIT_')) delete process.env[name];

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8' }).trim();

function fixture() {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'slow-tests-')));
  const main = path.join(root, 'main');
  git(root, 'init', '-q', '-b', 'main', main);
  writeFileSync(path.join(main, 'a.txt'), 'a');
  git(main, 'add', '.');
  git(main, 'commit', '-qm', 'init');
  const workTree = path.join(root, 'work-tree');
  git(main, 'worktree', 'add', '-q', workTree, '-b', 'work');
  return { main, workTree, log: path.join(main, '.git', 'slow-tests.jsonl') };
}

const finished = (fullName: string, file: string, duration: number) =>
  ({ fullName, module: { relativeModuleId: file }, diagnostic: () => ({ duration }) }) as unknown as TestCase;

const AT = new Date('2026-11-16T08:00:00.000Z');

describe('SlowTestsLog', () => {
  describe('success cases', () => {
    it('appends a test over 750 ms, with the load factor it ran at, to the log in the git common directory', () => {
      // ARRANGE
      const { workTree, log } = fixture();
      const reporter = new SlowTestsLog({ cwd: workTree, now: () => AT, loadFactor: 2.345 });
      const expected = {
        test: 'registry > walks it',
        file: 'src/registry.test.ts',
        ms: 751,
        loadFactor: 2.3,
        branch: 'work',
        at: AT.toISOString(),
      };
      // ACT
      reporter.onTestCaseResult(finished('registry > walks it', 'src/registry.test.ts', 751));
      // ASSERT
      expect(
        readFileSync(log, 'utf8')
          .trim()
          .split('\n')
          .map((line) => JSON.parse(line)),
      ).toEqual([expected]);
    });
  });

  describe('failure cases', () => {
    it('logs nothing outside a git repository rather than failing the run', () => {
      // ARRANGE
      const outside = realpathSync(mkdtempSync(path.join(tmpdir(), 'no-repo-')));
      const reporter = new SlowTestsLog({ cwd: outside, now: () => AT, loadFactor: 1 });
      // ACT
      const report = () => reporter.onTestCaseResult(finished('a > b', 'a.test.ts', 6200));
      // ASSERT
      expect(report).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('leaves a test at or under 750 ms out of the log', () => {
      // ARRANGE
      const { workTree, log } = fixture();
      const reporter = new SlowTestsLog({ cwd: workTree, now: () => AT, loadFactor: 1 });
      // ACT
      reporter.onTestCaseResult(finished('quick', 'q.test.ts', 750));
      // ASSERT
      expect(existsSync(log)).toBe(false);
    });
  });
});

function logSlow(cwd: string, test: string, { at, ms = 1240 }: { at: Date; ms?: number }): void {
  new SlowTestsLog({ cwd, now: () => at, loadFactor: 2.4 }).onTestCaseResult(finished(test, 'src/walk.test.ts', ms));
}

const HOUR = 60 * 60 * 1000;

describe('slowTestReport', () => {
  describe('success cases', () => {
    it("prints a header naming the count, branch and the caller's note, then the branch's entries since the time given", () => {
      // ARRANGE
      const { main, workTree } = fixture();
      const since = new Date('2026-11-16T08:00:00.000Z');
      logSlow(workTree, 'before', { at: new Date(since.getTime() - HOUR) });
      logSlow(workTree, 'at the start', { at: since });
      logSlow(main, 'on main', { at: new Date(since.getTime() + HOUR) });
      logSlow(workTree, 'later', { at: new Date(since.getTime() + HOUR), ms: 900 });
      const expected = [
        '! 2 tests ran past 750 ms on work (CI fails at 3 s):',
        '  1.2 s at load 2.4  src/walk.test.ts > at the start  (2026-11-16T08:00:00.000Z)',
        '  0.9 s at load 2.4  src/walk.test.ts > later  (2026-11-16T09:00:00.000Z)',
      ];
      // ACT
      const report = slowTestReport({ cwd: main, branch: 'work', since, note: 'CI fails at 3 s' });
      // ASSERT
      expect(report).toEqual(expected);
    });
  });

  describe('failure cases', () => {
    it('prints nothing outside a git repository', () => {
      // ARRANGE
      const outside = realpathSync(mkdtempSync(path.join(tmpdir(), 'no-repo-')));
      // ACT
      const report = slowTestReport({ cwd: outside, branch: 'work', since: AT, note: 'CI fails at 3 s' });
      // ASSERT
      expect(report).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('prints nothing when there is no log yet, or the branch logged nothing since', () => {
      // ARRANGE
      const { main, workTree } = fixture();
      const before = slowTestReport({ cwd: main, branch: 'work', since: AT, note: 'n' });
      logSlow(workTree, 'earlier', { at: new Date(AT.getTime() - HOUR) });
      // ACT
      const after = slowTestReport({ cwd: main, branch: 'work', since: AT, note: 'n' });
      // ASSERT
      expect(before).toEqual([]);
      expect(after).toEqual([]);
    });

    it('says "1 test" for one entry', () => {
      // ARRANGE
      const { main, workTree } = fixture();
      logSlow(workTree, 'only', { at: AT });
      const expectedHeader = '! 1 test ran past 750 ms on work (since it branched off base):';
      // ACT
      const [header] = slowTestReport({ cwd: main, branch: 'work', since: AT, note: 'since it branched off base' });
      // ASSERT
      expect(header).toBe(expectedHeader);
    });
  });
});

const loggedTests = (log: string) =>
  readFileSync(log, 'utf8')
    .trim()
    .split('\n')
    .map((entry) => (JSON.parse(entry) as { test: string }).test);

describe('trimSlowTests', () => {
  describe('success cases', () => {
    it('keeps the entries of the last 30 days and drops the older ones', () => {
      // ARRANGE
      const { workTree, log } = fixture();
      const now = new Date('2026-11-17T12:00:00.000Z');
      logSlow(workTree, '31 days old', { at: new Date('2026-10-17T11:59:59.000Z') });
      logSlow(workTree, 'exactly 30 days old', { at: new Date('2026-10-18T12:00:00.000Z') });
      logSlow(workTree, 'yesterday', { at: new Date('2026-11-16T12:00:00.000Z') });
      const expectedTests = ['exactly 30 days old', 'yesterday'];
      // ACT
      trimSlowTests({ cwd: workTree, now });
      // ASSERT
      expect(loggedTests(log)).toEqual(expectedTests);
    });
  });

  describe('failure cases', () => {
    it('drops a line it cannot read', () => {
      // ARRANGE
      const { workTree, log } = fixture();
      const now = new Date('2026-11-17T12:00:00.000Z');
      writeFileSync(log, '{"test": "cut off mid-wri\n');
      logSlow(workTree, 'yesterday', { at: new Date('2026-11-16T12:00:00.000Z') });
      const expectedTests = ['yesterday'];
      // ACT
      trimSlowTests({ cwd: workTree, now });
      // ASSERT
      expect(loggedTests(log)).toEqual(expectedTests);
    });

    it('does nothing outside a git repository', () => {
      // ARRANGE
      const outside = realpathSync(mkdtempSync(path.join(tmpdir(), 'no-repo-')));
      const now = new Date('2026-11-17T12:00:00.000Z');
      // ACT
      const trim = () => trimSlowTests({ cwd: outside, now });
      // ASSERT
      expect(trim).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('creates no log when there is none yet', () => {
      // ARRANGE
      const { workTree, log } = fixture();
      const now = new Date('2026-11-17T12:00:00.000Z');
      // ACT
      trimSlowTests({ cwd: workTree, now });
      // ASSERT
      expect(existsSync(log)).toBe(false);
    });
  });
});
