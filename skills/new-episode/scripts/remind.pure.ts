// The SessionStart `compact` reminder: which Episode worktrees still have jobs to run.
// The states come from `runStatus` (status.pure.ts), so this file only decides what to say.

import type { JobState } from './status.pure.ts';

export interface EpisodeRun {
  slug: string;
  states: readonly JobState[];
}

/** The reminder, or null when no Episode has a job that is not done. */
export function unfinishedReminder(runs: readonly EpisodeRun[]): string | null {
  const open = runs.filter(({ states }) => states.some((state) => state !== 'done'));
  if (open.length === 0) return null;
  const lines = open.map(({ slug }) => `- npm run episode:status -- ${slug}`);
  return [
    'Context was compacted while an Episode run has jobs not done. Before anything else, run the command for each Episode below and rebuild the todo list from its output, never from memory:',
    ...lines,
  ].join('\n');
}

/** The integration worktrees in `git worktree list --porcelain` output: branch `episode/<slug>`, not a `--` job branch. */
export function episodeBranches(porcelain: string): { slug: string; dir: string }[] {
  return porcelain.split('\n\n').flatMap((block) => {
    const dir = /^worktree (.+)$/m.exec(block)?.[1];
    const slug = /^branch refs\/heads\/episode\/(.+)$/m.exec(block)?.[1];
    return dir === undefined || slug === undefined || slug.includes('--') ? [] : [{ slug, dir }];
  });
}
