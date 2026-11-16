import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { TestCase } from 'vitest/node';
import { SlowTestsLog } from './vitest-slow-tests.mts';

// A commit hook exports GIT_DIR and friends, which would point these tmp repos at the real one.
for (const name of Object.keys(process.env)) if (name.startsWith('GIT_')) delete process.env[name];

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8' }).trim();

/** A repo whose branch `work` is checked out in a second worktree, as a subagent's would be. */
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

/** A hand-built stand-in for the finished test case Vitest hands a reporter: only what the log reads. */
const finished = (fullName: string, file: string, duration: number) =>
  ({ fullName, module: { relativeModuleId: file }, diagnostic: () => ({ duration }) }) as unknown as TestCase;

const AT = new Date('2026-11-16T08:00:00.000Z');

describe('SlowTestsLog', () => {
  describe('success cases', () => {
    it('appends a test over 5 s to the log in the git common directory, shared by every worktree', () => {
      // ARRANGE
      const { workTree, log } = fixture();
      const reporter = new SlowTestsLog({ cwd: workTree, now: () => AT });
      const expected = {
        test: 'registry > walks it',
        file: 'src/registry.test.ts',
        ms: 6200,
        branch: 'work',
        at: AT.toISOString(),
      };
      // ACT
      reporter.onTestCaseResult(finished('registry > walks it', 'src/registry.test.ts', 6200));
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
      const reporter = new SlowTestsLog({ cwd: outside, now: () => AT });
      // ACT
      const report = () => reporter.onTestCaseResult(finished('a > b', 'a.test.ts', 6200));
      // ASSERT
      expect(report).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('leaves a test at or under 5 s out of the log', () => {
      // ARRANGE
      const { workTree, log } = fixture();
      const reporter = new SlowTestsLog({ cwd: workTree, now: () => AT });
      // ACT
      reporter.onTestCaseResult(finished('quick', 'q.test.ts', 5000));
      // ASSERT
      expect(existsSync(log)).toBe(false);
    });
  });
});
