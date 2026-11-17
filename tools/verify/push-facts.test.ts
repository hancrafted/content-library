import { execFileSync } from 'node:child_process';
import { mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { changesSinceMain } from './push-facts.ts';

// A commit hook exports GIT_DIR and friends, which would point these tmp repos at the real one.
for (const name of Object.keys(process.env)) if (name.startsWith('GIT_')) delete process.env[name];

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8' }).trim();

function repo() {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'push-facts-')));
  git(root, 'init', '-q', '-b', 'main');
  writeFileSync(path.join(root, 'a.txt'), 'a');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'init');
  const fetched = git(root, 'rev-parse', 'HEAD');
  git(root, 'update-ref', 'refs/remotes/origin/main', fetched);
  git(root, 'checkout', '-qb', 'work');
  return { root, fetched };
}

function commit(root: string, files: string[]): void {
  for (const file of files) writeFileSync(path.join(root, file), file);
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'change');
}

describe('changesSinceMain', () => {
  describe('success cases', () => {
    it('gives the merge-base with origin/main and every path changed from it to HEAD', () => {
      // ARRANGE
      const { root, fetched } = repo();
      commit(root, ['b.md', 'c.ts']);
      const expected = { mergeBase: fetched, changedPaths: ['b.md', 'c.ts'] };
      // ACT
      const facts = changesSinceMain(root);
      // ASSERT
      expect(facts).toEqual(expected);
    });
  });

  describe('failure cases', () => {
    it('throws, naming the git command, when there is no origin/main to compare with', () => {
      // ARRANGE
      const { root } = repo();
      git(root, 'update-ref', '-d', 'refs/remotes/origin/main');
      const expectedError = /git merge-base HEAD origin\/main/;
      // ACT
      const plan = () => changesSinceMain(root);
      // ASSERT
      expect(plan).toThrow(expectedError);
    });
  });

  describe('edge cases', () => {
    it('gives no merge-base and no paths when HEAD shares no history with origin/main', () => {
      // ARRANGE
      const { root } = repo();
      git(root, 'checkout', '-q', '--orphan', 'unrelated');
      commit(root, ['z.txt']);
      const expected = { mergeBase: null, changedPaths: [] };
      // ACT
      const facts = changesSinceMain(root);
      // ASSERT
      expect(facts).toEqual(expected);
    });
  });
});
