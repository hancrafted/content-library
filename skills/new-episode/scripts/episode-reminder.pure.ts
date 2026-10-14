// The SessionStart reminder's pure rules: which Episodes have a job not done, and which worktrees are Episode
// integration worktrees. The reader that supplies the statuses is episode-status.ts.
import type { RunStatus } from './status.pure.ts';

/** An Episode with a job not done, as the hook sees it. */
export interface EpisodeRun {
  slug: string;
  /** The worktree holding the Episode: the printed command enters it, so it works from any cwd. */
  dir: string;
  status: RunStatus;
}

const shellQuote = (value: string): string => `'${value.replaceAll("'", `'\\''`)}'`;

/** The SessionStart reminder, or null when no Episode has a job that is not done. */
export function unfinishedReminder(runs: readonly EpisodeRun[]): string | null {
  const open = runs.filter(({ status }) => status.jobs.some(({ state }) => state !== 'done'));
  if (open.length === 0) return null;
  const lines = open.map(({ slug, dir }) => `- cd ${shellQuote(dir)} && npm run episode:status -- ${slug}`);
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
