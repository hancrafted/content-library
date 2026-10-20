import { describe, expect, it } from 'vitest';
import { parseArgs } from './worktree-args.pure.ts';

describe('success cases', () => {
  it('reads a command and branch, based on origin/main by default', () => {
    // ARRANGE
    const argv = ['new', 'feat/12-thing'];
    const expected = { command: 'new', branch: 'feat/12-thing', base: null, kill: false };
    // ACT
    const args = parseArgs(argv);
    // ASSERT
    expect(args).toEqual(expected);
  });

  it('reads a base branch given after the branch, as a job worktree of an Episode passes it', () => {
    // ARRANGE
    const argv = ['done', 'episode/demo--write-research-x', '--base', 'episode/demo'];
    const expected = { command: 'done', branch: 'episode/demo--write-research-x', base: 'episode/demo', kill: false };
    // ACT
    const args = parseArgs(argv);
    // ASSERT
    expect(args).toEqual(expected);
  });
});

describe('--kill and sync', () => {
  it('reads --kill on done, and sync with no branch', () => {
    // ARRANGE
    const argvs = [['done', 'feat/x', '--kill'], ['sync'], ['sync', '--base', 'episode/y']];
    // ACT
    const parsed = argvs.map((argv) => parseArgs(argv));
    // ASSERT
    expect(parsed).toEqual([
      { command: 'done', branch: 'feat/x', base: null, kill: true },
      { command: 'sync', branch: '', base: null, kill: false },
      { command: 'sync', branch: '', base: 'episode/y', kill: false },
    ]);
  });

  it('refuses --kill outside done', () => {
    // ACT
    const result = parseArgs(['new', 'feat/x', '--kill']);
    // ASSERT
    expect(result).toEqual({ error: '--kill belongs to done' });
  });
});

describe('failure cases', () => {
  it('names the usage when the branch, the command or the base value is missing', () => {
    // ARRANGE
    const argvs = [['new'], ['new', '--base', 'main'], ['make', 'feat/x'], ['new', 'feat/x', '--base']];
    const usage =
      'usage: npm run wt:new -- <branch> [--base <branch>]  |  npm run wt:done -- <branch> [--base <branch>] [--kill]  |  npm run wt:sync [-- --base <branch>]';
    const expected = [usage, usage, "unknown command 'make'; expected new, done or sync", '--base needs a branch name'];
    // ACT
    const errors = argvs.map((argv) => parseArgs(argv));
    // ASSERT
    expect(errors).toEqual(expected.map((error) => ({ error })));
  });
});
