import { describe, expect, it } from 'vitest';
import { episodeBranches, unfinishedReminder } from './remind.pure.ts';

/*
 * The SessionStart `compact` reminder: after a compaction the orchestrator forgets the run, so
 * a worktree with jobs not done tells it to rebuild its todo list from `episode:status`.
 */
describe('unfinishedReminder', () => {
  it('stays silent when every job of every Episode is done', () => {
    expect(unfinishedReminder([{ slug: 'a', states: ['done', 'done'] }])).toBeNull();
  });

  it('stays silent with no Episode worktree', () => {
    expect(unfinishedReminder([])).toBeNull();
  });

  it('names each Episode with a job not done and the status command', () => {
    const text = unfinishedReminder([
      { slug: 'a', states: ['done', 'ready', 'waiting'] },
      { slug: 'b', states: ['done'] },
      { slug: 'c', states: ['blocked'] },
    ]);
    expect(text).toContain('npm run episode:status -- a');
    expect(text).toContain('npm run episode:status -- c');
    expect(text).not.toContain('-- b');
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
