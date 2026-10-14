import { describe, expect, it } from 'vitest';
import { episodeBranches, unfinishedReminder } from './episode-reminder.pure.ts';
import type { RunStatus } from './status.pure.ts';

/* The reminder rules over plain values: which Episodes are unfinished and which worktrees hold one. */

const status = (...states: RunStatus['jobs'][number]['state'][]): RunStatus => ({
  jobs: states.map((state, i) => ({ id: `j${i}`, state })),
  running: [],
  problems: [],
  waiting: [],
});

describe('unfinishedReminder', () => {
  it('stays silent with no Episode worktree or when every job is done', () => {
    expect([unfinishedReminder([]), unfinishedReminder([{ slug: 'a', status: status('done') }])]).toEqual([null, null]);
  });

  it('names each Episode with a job not done and the status command', () => {
    const text = unfinishedReminder([
      { slug: 'a', status: status('done', 'ready') },
      { slug: 'c', status: status('done') },
    ]);
    expect(text).toContain('npm run episode:status -- a');
    expect(text).not.toContain('-- c');
    expect(text).toContain('todo list');
  });
});

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
    expect(episodeBranches(porcelain)).toEqual([{ slug: 'a', dir: '/repo/.worktrees/episode-a' }]);
  });
});
