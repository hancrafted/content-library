import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { mergeIntoBase } from './worktree-merge.ts';

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
  return { main, baseTree, workTree };
}

describe('mergeIntoBase', () => {
  describe('success cases', () => {
    it('merges the branch into a base checked out in another worktree', () => {
      // ARRANGE
      const { main, baseTree } = fixture();
      // ACT
      const result = mergeIntoBase('work', 'base', main);
      // ASSERT
      expect(result).toBe('merged');
      expect(existsSync(path.join(baseTree, 'work.txt'))).toBe(true);
      expect(() => git(main, 'merge-base', '--is-ancestor', 'work', 'base')).not.toThrow();
    });

    it('reports an already merged branch without a new commit', () => {
      // ARRANGE
      const { main, baseTree } = fixture();
      mergeIntoBase('work', 'base', main);
      const head = git(baseTree, 'rev-parse', 'HEAD');
      // ACT
      const result = mergeIntoBase('work', 'base', main);
      // ASSERT
      expect(result).toBe('already-merged');
      expect(git(baseTree, 'rev-parse', 'HEAD')).toBe(head);
    });
  });

  describe('failure cases', () => {
    it('throws when the base is checked out nowhere, merging nothing', () => {
      // ARRANGE
      const { main, baseTree } = fixture();
      git(main, 'worktree', 'remove', baseTree);
      const before = git(main, 'rev-parse', 'base');
      // ACT
      const run = () => mergeIntoBase('work', 'base', main);
      // ASSERT
      expect(run).toThrow(/not checked out/);
      expect(git(main, 'rev-parse', 'base')).toBe(before);
    });

    it('aborts a conflicting merge and leaves the base clean', () => {
      // ARRANGE
      const { main, baseTree, workTree } = fixture();
      writeFileSync(path.join(workTree, 'a.txt'), 'from work');
      git(workTree, 'commit', '-aqm', 'edit a');
      writeFileSync(path.join(baseTree, 'a.txt'), 'from base');
      git(baseTree, 'commit', '-aqm', 'edit a on base');
      // ACT
      const run = () => mergeIntoBase('work', 'base', main);
      // ASSERT
      expect(run).toThrow(/conflict/i);
      expect(git(baseTree, 'status', '--porcelain')).toBe('');
    });
  });
});
