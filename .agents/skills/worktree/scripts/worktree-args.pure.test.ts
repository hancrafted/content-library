import { describe, expect, it } from 'vitest';
import { parseArgs } from './worktree-args.pure.ts';

describe('success cases', () => {
  it('reads a command and branch, based on origin/main by default', () => {
    // ARRANGE
    const argv = ['new', 'feat/12-thing'];
    const expected = { command: 'new', branch: 'feat/12-thing', base: null };
    // ACT
    const args = parseArgs(argv);
    // ASSERT
    expect(args).toEqual(expected);
  });

  it('reads a base branch given after the branch, as a job worktree of an Episode passes it', () => {
    // ARRANGE
    const argv = ['done', 'episode/demo--write-research-x', '--base', 'episode/demo'];
    const expected = { command: 'done', branch: 'episode/demo--write-research-x', base: 'episode/demo' };
    // ACT
    const args = parseArgs(argv);
    // ASSERT
    expect(args).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names the usage when the branch, the command or the base value is missing', () => {
    // ARRANGE
    const argvs = [['new'], ['new', '--base', 'main'], ['make', 'feat/x'], ['new', 'feat/x', '--base']];
    const usage =
      'usage: npm run wt:new -- <branch> [--base <branch>]  |  npm run wt:done -- <branch> [--base <branch>]';
    const expected = [usage, usage, "unknown command 'make'; expected new or done", '--base needs a branch name'];
    // ACT
    const errors = argvs.map((argv) => parseArgs(argv));
    // ASSERT
    expect(errors).toEqual(expected.map((error) => ({ error })));
  });
});
