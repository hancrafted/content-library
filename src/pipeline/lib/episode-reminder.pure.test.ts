import { describe, expect, it } from 'vitest';
import { episodeBranches, unfinishedReminder } from './episode-reminder.pure.ts';
import type { RunStatus } from './status.pure.ts';

/* The reminder rules over plain values: which Episodes are unfinished and which worktrees hold one. */

const status = (...states: RunStatus['jobs'][number]['state'][]): RunStatus => ({
  jobs: states.map((state, i) => ({ id: `j${i}`, state })),
  running: [],
  problems: [],
  waiting: [],
  skillWarnings: [],
});
describe('success cases', () => {
  describe('unfinishedReminder', () => {
    it('names each Episode with a job not done and the status command', () => {
      // ARRANGE
      const runs = [
        { slug: 'a', dir: '/w/a', status: status('done', 'ready') },
        { slug: 'c', dir: '/w/c', status: status('done') },
      ];
      // ACT
      const text = unfinishedReminder(runs);
      // ASSERT
      expect(text).toContain('npm run episode:status -- a');
      expect(text).not.toContain('-- c');
      expect(text).toContain('todo list');
    });

    it('prints each command so it works from any directory: it enters the Episode worktree first', () => {
      // ARRANGE
      const runs = [{ slug: 'a', dir: '/work trees/a', status: status('ready') }];
      // ACT
      const text = unfinishedReminder(runs);
      // ASSERT
      expect(text).toContain("cd '/work trees/a' && npm run episode:status -- a");
    });
  });
});

describe('failure cases', () => {
  describe('episodeBranches', () => {
    const porcelain = [
      'worktree /repo',
      'branch refs/heads/main',
      '',
      'worktree /repo/.worktrees/episode-a',
      'branch refs/heads/episode/a',
      '',
      'worktree /repo/.worktrees/episode-a--write-research-x',
      'branch refs/heads/episode/a--write-research-x',
      '',
      'worktree /repo/.worktrees/detached',
      'detached',
      '',
    ].join('\n');

    it('lists the integration worktrees, not job worktrees nor other branches', () => {
      // ARRANGE
      // ACT
      const actual = episodeBranches(porcelain);
      // ASSERT
      expect(actual).toEqual([{ slug: 'a', dir: '/repo/.worktrees/episode-a' }]);
    });
  });
});

describe('edge cases', () => {
  describe('unfinishedReminder', () => {
    it('stays silent with no Episode worktree or when every job is done', () => {
      // ARRANGE
      // ACT
      const actual = [unfinishedReminder([]), unfinishedReminder([{ slug: 'a', dir: '/w/a', status: status('done') }])];
      // ASSERT
      expect(actual).toEqual([null, null]);
    });
  });
});
