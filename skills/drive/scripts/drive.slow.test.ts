import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// A commit hook exports GIT_DIR and friends, which would point these tmp repos at the real one.
for (const name of Object.keys(process.env)) if (name.startsWith('GIT_')) delete process.env[name];

const CLI = path.join(import.meta.dirname, 'drive.ts');
const LOCK = path.join(import.meta.dirname, '../../../tools/load/lock.ts');

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8' }).trim();

/** Runs `drive worktree <args>` in `cwd`. */
const drive = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [CLI, 'worktree', ...args], { cwd, encoding: 'utf8' });

const driveAsync = (cwd: string, ...args: string[]): Promise<{ status: number | null; out: string }> =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, 'worktree', ...args], { cwd });
    let out = '';
    child.stdout.on('data', (chunk) => (out += chunk));
    child.stderr.on('data', (chunk) => (out += chunk));
    child.on('close', (status) => resolve({ status, out }));
  });

const CONFIG = (lock: string) =>
  [
    'worktree:',
    '  dir: .trees',
    '  baseBranch: main',
    '  invoke: drive worktree',
    '  install: [touch installed]',
    '  preflight: echo preflight-ran',
    `  lock: ${lock}`,
    '  beforeRemove: ["echo before $DRIVE_BRANCH > $DRIVE_ROOT/before.txt"]',
    '  afterMerge: ["echo $DRIVE_BASE $DRIVE_BRANCH > $DRIVE_ROOT/merged.txt"]',
    '  afterRemove: ["echo after > $DRIVE_ROOT/after.txt"]',
  ].join('\n');

/** A repo `main` with a bare `origin`, a project config, and a branch `feat/x` checked out in its own worktree. */
function fixture(lock = LOCK) {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'drive-cli-')));
  const origin = path.join(root, 'origin.git');
  const main = path.join(root, 'main');
  git(root, 'init', '-q', '--bare', '-b', 'main', origin);
  git(root, 'clone', '-q', origin, main);
  git(main, 'config', 'user.name', 't');
  git(main, 'config', 'user.email', 't@t');
  mkdirSync(path.join(main, 'docs', 'drive'), { recursive: true });
  writeFileSync(path.join(main, 'docs', 'drive', 'project.yml'), CONFIG(lock));
  writeFileSync(path.join(main, '.gitignore'), '.trees\ninstalled\nbefore.txt\nafter.txt\nmerged.txt\n');
  writeFileSync(path.join(main, 'a.txt'), 'a');
  git(main, 'add', '.');
  git(main, 'commit', '-qm', 'init');
  git(main, 'push', '-q', 'origin', 'main');
  return { root, main, trees: path.join(main, '.trees') };
}

/** Makes `branch` through the CLI and commits one file on it. */
function task(main: string, branch: string, base: string | null): string {
  const file = `${branch.replaceAll('/', '-')}.txt`;
  const result = drive(main, 'new', branch, ...(base === null ? [] : ['--base', base]));
  expect(result.status).toBe(0);
  const tree = path.join(main, '.trees', branch.replaceAll('/', '-'));
  writeFileSync(path.join(tree, file), file);
  git(tree, 'add', '.');
  git(tree, 'commit', '-qm', `add ${file}`);
  return tree;
}

describe('drive worktree', () => {
  describe('success cases', () => {
    it('new makes a worktree under the configured folder and runs the install steps in it', () => {
      // ARRANGE
      const { main, trees } = fixture();
      // ACT
      const result = drive(main, 'new', 'feat/x');
      // ASSERT
      expect(result.status).toBe(0);
      expect(existsSync(path.join(trees, 'feat-x', 'installed'))).toBe(true);
      expect(git(path.join(trees, 'feat-x'), 'branch', '--show-current')).toBe('feat/x');
    });

    it('new --base starts a subagent branch from its parent without a fetch', () => {
      // ARRANGE
      const { main } = fixture();
      drive(main, 'new', 'feat/x');
      // ACT
      const result = drive(main, 'new', 'feat/x--1-task', '--base', 'feat/x');
      // ASSERT
      expect(result.status).toBe(0);
      expect(git(main, 'rev-parse', 'feat/x--1-task')).toBe(git(main, 'rev-parse', 'feat/x'));
    });

    it('done --base merges with a merge commit, runs the hooks with their environment and removes branch and worktree', () => {
      // ARRANGE
      const { main, trees } = fixture();
      drive(main, 'new', 'feat/x');
      const tree = task(main, 'feat/x--1-task', 'feat/x');
      // ACT
      const result = drive(main, 'done', 'feat/x--1-task', '--base', 'feat/x');
      // ASSERT
      expect(result.status).toBe(0);
      expect(existsSync(tree)).toBe(false);
      expect(existsSync(path.join(trees, 'feat-x', 'feat-x--1-task.txt'))).toBe(true);
      expect(git(main, 'rev-list', '--merges', '--count', 'feat/x')).toBe('1');
      expect(git(main, 'branch', '--list', 'feat/x--1-task')).toBe('');
      expect(readFileSync(path.join(main, 'merged.txt'), 'utf8').trim()).toBe('feat/x feat/x--1-task');
      expect(readFileSync(path.join(main, 'before.txt'), 'utf8').trim()).toBe('before feat/x--1-task');
      expect(readFileSync(path.join(main, 'after.txt'), 'utf8').trim()).toBe('after');
    });

    it('done without --base removes the worktree and fast-forwards local main from the remote', () => {
      // ARRANGE
      const { main, root } = fixture();
      const tree = task(main, 'feat/y', null);
      git(tree, 'push', '-q', 'origin', 'feat/y:main');
      // ACT
      const result = drive(main, 'done', 'feat/y');
      // ASSERT
      expect(result.status).toBe(0);
      expect(existsSync(tree)).toBe(false);
      expect(git(main, 'rev-parse', 'main')).toBe(git(root, '--git-dir', 'origin.git', 'rev-parse', 'main'));
      expect(existsSync(path.join(main, 'feat-y.txt'))).toBe(true);
    });

    it('two subagents finishing into the same integration branch at once both merge, one after the other', async () => {
      // ARRANGE
      const { main } = fixture();
      drive(main, 'new', 'feat/x');
      task(main, 'feat/x--1-a', 'feat/x');
      task(main, 'feat/x--2-b', 'feat/x');
      // ACT
      const runs = await Promise.all([
        driveAsync(main, 'done', 'feat/x--1-a', '--base', 'feat/x'),
        driveAsync(main, 'done', 'feat/x--2-b', '--base', 'feat/x'),
      ]);
      // ASSERT
      expect(runs.map((run) => run.status)).toEqual([0, 0]);
      expect(git(main, 'rev-list', '--merges', '--count', 'feat/x')).toBe('2');
      expect(existsSync(path.join(main, '.trees', 'feat-x', 'feat-x--1-a.txt'))).toBe(true);
      expect(existsSync(path.join(main, '.trees', 'feat-x', 'feat-x--2-b.txt'))).toBe(true);
    });

    it('sync merges the base into the worktree branch, and preflight runs the configured command', () => {
      // ARRANGE
      const { main, trees } = fixture();
      drive(main, 'new', 'feat/x');
      const tree = task(main, 'feat/x--1-a', 'feat/x');
      writeFileSync(path.join(trees, 'feat-x', 'base.txt'), 'b');
      git(path.join(trees, 'feat-x'), 'add', '.');
      git(path.join(trees, 'feat-x'), 'commit', '-qm', 'base moves');
      // ACT
      const synced = drive(tree, 'sync', '--base', 'feat/x');
      const preflight = drive(main, 'preflight');
      // ASSERT
      expect(synced.status).toBe(0);
      expect(existsSync(path.join(tree, 'base.txt'))).toBe(true);
      expect(preflight.stdout).toContain('preflight-ran');
    });
  });

  describe('failure cases', () => {
    it('refuses a subagent branch without its parent as --base and names the configured invocation', () => {
      // ARRANGE
      const { main } = fixture();
      // ACT
      const result = drive(main, 'new', 'feat/x--1-a');
      // ASSERT
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('run: drive worktree new feat/x--1-a --base feat/x');
    });

    it('stops a finish when a beforeRemove hook fails, leaving the worktree', () => {
      // ARRANGE
      const { main } = fixture();
      const config = path.join(main, 'docs', 'drive', 'project.yml');
      writeFileSync(config, readFileSync(config, 'utf8').replace(/beforeRemove: .*/, 'beforeRemove: ["exit 3"]'));
      git(main, 'commit', '-qam', 'failing hook');
      git(main, 'push', '-q', 'origin', 'main');
      const tree = task(main, 'feat/z', null);
      git(tree, 'push', '-q', 'origin', 'feat/z:main');
      // ACT
      const result = drive(main, 'done', 'feat/z');
      // ASSERT
      expect(result.status).toBe(1);
      expect(existsSync(tree)).toBe(true);
    });

    it('rejects a config that names a lock module without withLock', () => {
      // ARRANGE
      const { main } = fixture(path.join(import.meta.dirname, 'git.ts'));
      // ACT
      const result = drive(main, 'new', 'feat/x');
      // ASSERT
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('does not export withLock');
    });
  });
});
