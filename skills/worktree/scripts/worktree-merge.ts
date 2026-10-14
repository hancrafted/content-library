// Merging a finished branch into its --base, before its worktree is removed.
import { execFileSync, spawnSync } from 'node:child_process';

const git = (cwd: string, ...args: string[]) => spawnSync('git', args, { cwd, encoding: 'utf8' });

/** The worktree that has `base` checked out, from `git worktree list --porcelain`. */
function checkoutOf(base: string, cwd: string): string | null {
  const listing = execFileSync('git', ['worktree', 'list', '--porcelain'], { cwd, encoding: 'utf8' });
  for (const entry of listing.split('\n\n')) {
    const lines = entry.split('\n');
    const dir = lines.find((line) => line.startsWith('worktree '))?.slice('worktree '.length);
    if (dir && lines.includes(`branch refs/heads/${base}`)) return dir;
  }
  return null;
}

/**
 * Merges `branch` into `base` with a merge commit, inside the worktree that has `base` checked out.
 * Throws, with the base left as it was, when the base is checked out nowhere or the merge fails.
 */
export function mergeIntoBase(branch: string, base: string, cwd: string): 'merged' | 'already-merged' {
  if (git(cwd, 'merge-base', '--is-ancestor', branch, base).status === 0) return 'already-merged';
  const tree = checkoutOf(base, cwd);
  if (tree === null) throw new Error(`${base} is not checked out in any worktree; check it out, then rerun`);
  const merge = git(tree, 'merge', '--no-ff', '--no-edit', branch);
  if (merge.status === 0) return 'merged';
  git(tree, 'merge', '--abort');
  throw new Error(`merging ${branch} into ${base} failed (conflict or dirty ${tree}):\n${merge.stdout}${merge.stderr}`);
}
