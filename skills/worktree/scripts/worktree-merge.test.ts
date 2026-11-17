import { execFileSync, spawn } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { mergeIntoBase, slowTestReport } from './worktree-merge.ts';

// A commit hook exports GIT_DIR and friends, which would point these tmp repos at the real one.
for (const name of Object.keys(process.env)) if (name.startsWith('GIT_')) delete process.env[name];

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8' }).trim();

/** A repo with `base` checked out in a worktree and `work` holding one extra commit in its own worktree. */
function fixture() {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'wt-merge-')));
  const main = path.join(root, 'main');
  git(root, 'init', '-q', '-b', 'main', main);
  // mergeIntoBase runs git without -c, so the repo carries its own identity: CI has no global one.
  git(main, 'config', 'user.name', 't');
  git(main, 'config', 'user.email', 't@t');
  writeFileSync(path.join(main, 'a.txt'), 'a');
  git(main, 'add', '.');
  git(main, 'commit', '-qm', 'init');
  git(main, 'branch', 'base');
  const baseTree = path.join(root, 'base-tree');
  const workTree = path.join(root, 'work-tree');
  git(main, 'worktree', 'add', '-q', baseTree, 'base');
  git(main, 'worktree', 'add', '-q', workTree, '-b', 'work', 'base');
  writeFileSync(path.join(workTree, 'work.txt'), 'w');
  git(workTree, 'add', '.');
  git(workTree, 'commit', '-qm', 'work');
  return { root, main, baseTree, workTree };
}

/** A second branch, `other`, off `base` with its own commit in its own worktree. */
function addOtherBranch(root: string, main: string): void {
  const otherTree = path.join(root, 'other-tree');
  git(main, 'worktree', 'add', '-q', otherTree, '-b', 'other', 'base');
  writeFileSync(path.join(otherTree, 'other.txt'), 'o');
  git(otherTree, 'add', '.');
  git(otherTree, 'commit', '-qm', 'other');
}

/** A merge hook that logs when each merge commit starts and ends, holding the merge open a moment. */
function logMerges(root: string, main: string): string {
  const log = path.join(root, 'merges.log');
  const hook = path.join(main, '.git', 'hooks', 'pre-merge-commit');
  writeFileSync(hook, `#!/bin/sh\necho start >> ${log}\nsleep 0.3\necho end >> ${log}\n`);
  chmodSync(hook, 0o755);
  return log;
}

const MODULE = path.join(import.meta.dirname, 'worktree-merge.ts');

/** Runs mergeIntoBase in its own process, as a second `wt:done` would. */
function mergeInChild(branch: string, cwd: string): Promise<{ code: number | null; output: string }> {
  const code = `import { mergeIntoBase } from ${JSON.stringify(MODULE)}; console.log(await mergeIntoBase(process.argv[1], 'base', process.argv[2]));`;
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', code, branch, cwd], {
      encoding: 'utf8',
    } as never);
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('close', (exit) => resolve({ code: exit, output }));
  });
}

describe('mergeIntoBase', () => {
  describe('success cases', () => {
    it('merges the branch into a base checked out in another worktree', async () => {
      // ARRANGE
      const { main, baseTree } = fixture();
      // ACT
      const result = await mergeIntoBase('work', 'base', main);
      // ASSERT
      expect(result).toBe('merged');
      expect(existsSync(path.join(baseTree, 'work.txt'))).toBe(true);
      expect(() => git(main, 'merge-base', '--is-ancestor', 'work', 'base')).not.toThrow();
    });

    it('reports an already merged branch without a new commit', async () => {
      // ARRANGE
      const { main, baseTree } = fixture();
      await mergeIntoBase('work', 'base', main);
      const head = git(baseTree, 'rev-parse', 'HEAD');
      // ACT
      const result = await mergeIntoBase('work', 'base', main);
      // ASSERT
      expect(result).toBe('already-merged');
      expect(git(baseTree, 'rev-parse', 'HEAD')).toBe(head);
    });

    it('merges two branches finishing at once one after the other, both into the base', async () => {
      // ARRANGE
      const { root, main } = fixture();
      addOtherBranch(root, main);
      const log = logMerges(root, main);
      // ACT
      const results = await Promise.all([mergeInChild('work', main), mergeInChild('other', main)]);
      // ASSERT
      expect(
        results.map((r) => r.code),
        results.map((r) => r.output).join('\n'),
      ).toEqual([0, 0]);
      expect(readFileSync(log, 'utf8').trim().split('\n')).toEqual(['start', 'end', 'start', 'end']);
      expect(() => git(main, 'merge-base', '--is-ancestor', 'work', 'base')).not.toThrow();
      expect(() => git(main, 'merge-base', '--is-ancestor', 'other', 'base')).not.toThrow();
    });

    it('takes over a merge lock left by a process that was killed mid-merge', async () => {
      // ARRANGE
      const { main } = fixture();
      const lock = path.join(main, '.git', 'locks', 'wt-merge%2Fbase.lock');
      mkdirSync(lock, { recursive: true });
      const dead = Number(execFileSync(process.execPath, ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }));
      writeFileSync(path.join(lock, 'owner'), JSON.stringify({ pid: dead, started: 'Thu Jan  1 00:00:00 1970' }));
      // ACT
      const result = await mergeIntoBase('work', 'base', main);
      // ASSERT
      expect(result).toBe('merged');
      expect(existsSync(lock)).toBe(false);
    });
  });

  describe('failure cases', () => {
    it('throws when the base is checked out nowhere, merging nothing', async () => {
      // ARRANGE
      const { main, baseTree } = fixture();
      git(main, 'worktree', 'remove', baseTree);
      const before = git(main, 'rev-parse', 'base');
      // ACT
      const run = mergeIntoBase('work', 'base', main);
      // ASSERT
      await expect(run).rejects.toThrow(/not checked out/);
      expect(git(main, 'rev-parse', 'base')).toBe(before);
    });

    it('aborts a conflicting merge and leaves the base clean', async () => {
      // ARRANGE
      const { main, baseTree, workTree } = fixture();
      writeFileSync(path.join(workTree, 'a.txt'), 'from work');
      git(workTree, 'commit', '-aqm', 'edit a');
      writeFileSync(path.join(baseTree, 'a.txt'), 'from base');
      git(baseTree, 'commit', '-aqm', 'edit a on base');
      // ACT
      const run = mergeIntoBase('work', 'base', main);
      // ASSERT
      await expect(run).rejects.toThrow(/conflict/i);
      expect(git(baseTree, 'status', '--porcelain')).toBe('');
    });

    it('releases the merge lock when the merge fails, so the next merge into the base runs', async () => {
      // ARRANGE
      const { root, main, baseTree, workTree } = fixture();
      addOtherBranch(root, main);
      writeFileSync(path.join(workTree, 'a.txt'), 'from work');
      git(workTree, 'commit', '-aqm', 'edit a');
      writeFileSync(path.join(baseTree, 'a.txt'), 'from base');
      git(baseTree, 'commit', '-aqm', 'edit a on base');
      await expect(mergeIntoBase('work', 'base', main)).rejects.toThrow(/conflict/i);
      // ACT
      const result = await mergeIntoBase('other', 'base', main);
      // ASSERT
      expect(result).toBe('merged');
    });
  });
});

/** One slow-tests log line, as the fast suite's reporter writes it. */
const slowEntry = (test: string, branch: string, at: Date) =>
  JSON.stringify({ test, file: 'src/walk.test.ts', ms: 1200, loadFactor: 2.4, branch, at: at.toISOString() }) + '\n';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe('slowTestReport', () => {
  describe('success cases', () => {
    it('trims the shared log to the last 30 days as it reads it', () => {
      // ARRANGE
      const { main } = fixture();
      const forkedAt = new Date(git(main, 'log', '-1', '--format=%cI', git(main, 'merge-base', 'work', 'base')));
      const now = new Date(forkedAt.getTime() + 2 * HOUR);
      const log = path.join(main, '.git', 'slow-tests.jsonl');
      const recent = slowEntry('on another branch', 'other', new Date(now.getTime() - DAY));
      writeFileSync(log, slowEntry('long ago', 'other', new Date(now.getTime() - 31 * DAY)) + recent);
      // ACT
      slowTestReport('work', 'base', { cwd: main, now });
      // ASSERT
      expect(readFileSync(log, 'utf8')).toBe(recent);
    });

    it("keeps only the merging branch's entries logged at or after its merge-base's committer date", () => {
      // ARRANGE
      const { main } = fixture();
      const forkedAt = new Date(git(main, 'log', '-1', '--format=%cI', git(main, 'merge-base', 'work', 'base')));
      const now = new Date(forkedAt.getTime() + 2 * HOUR);
      writeFileSync(
        path.join(main, '.git', 'slow-tests.jsonl'),
        slowEntry('before the fork', 'work', new Date(forkedAt.getTime() - HOUR)) +
          slowEntry('after the fork', 'work', new Date(forkedAt.getTime() + HOUR)) +
          slowEntry('on another branch', 'other', new Date(forkedAt.getTime() + HOUR)),
      );
      const header = '! 1 test ran past 750 ms on work since it branched off base:';
      const line = `  1.2 s at load 2.4  src/walk.test.ts > after the fork  (${new Date(forkedAt.getTime() + HOUR).toISOString()})`;
      // ACT
      const report = slowTestReport('work', 'base', { cwd: main, now });
      // ASSERT
      expect(report).toEqual([header, line]);
    });
  });

  describe('edge cases', () => {
    it('prints nothing when the repository has no slow-tests log yet', () => {
      // ARRANGE
      const { main } = fixture();
      const now = new Date('2026-11-17T12:00:00.000Z');
      // ACT
      const report = slowTestReport('work', 'base', { cwd: main, now });
      // ASSERT
      expect(report).toEqual([]);
    });
  });
});
