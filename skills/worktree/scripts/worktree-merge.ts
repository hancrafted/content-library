// Merging a finished branch into its --base, before its worktree is removed.
import { execFileSync } from 'node:child_process';
import { withLock } from '../../../tools/load/lock.ts';
import { slowTestsLogPath, slowTestsSince } from '../../../vitest-slow-tests.mts';
import { git } from './git.ts';

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

const MERGE_LOCK = { pollMs: 100, timeoutMs: 10 * 60 * 1000 };

/**
 * Merges `branch` into `base` with a merge commit, inside the worktree that has `base` checked out.
 * Holds the base's merge lock (tools/load/lock.ts) throughout, so concurrent finishes into one base serialize.
 * Rejects, with the base left as it was, when the base is checked out nowhere or the merge fails.
 */
export function mergeIntoBase(branch: string, base: string, cwd: string): Promise<'merged' | 'already-merged'> {
  const onWait = () => console.log(`… waiting for another merge into ${base} to finish`);
  return withLock(`wt-merge/${base}`, { ...MERGE_LOCK, cwd, onWait }, () => {
    if (git(cwd, ['merge-base', '--is-ancestor', branch, base]).status === 0) return 'already-merged';
    const tree = checkoutOf(base, cwd);
    if (tree === null) throw new Error(`${base} is not checked out in any worktree; check it out, then rerun`);
    const merge = git(tree, ['merge', '--no-ff', '--no-edit', branch]);
    if (merge.status === 0) return 'merged';
    git(tree, ['merge', '--abort']);
    throw new Error(
      `merging ${branch} into ${base} failed (conflict or dirty ${tree}):\n${merge.stdout}${merge.stderr}`,
    );
  });
}

/**
 * The lines a finish prints about the fast-suite tests that ran past 5 s on `branch` since it branched off `base`:
 * the shared slow-tests log's entries (see vitest-slow-tests.mts) whose branch is `branch` and whose time is at or
 * after the committer date of the merge-base of `branch` and `base`, so the orchestrator sees creeping tests
 * in the merge output. Empty when there are none. Call it before merging: afterwards the merge-base is the tip.
 */
export function slowTestReport(branch: string, base: string, cwd: string): string[] {
  const log = slowTestsLogPath(cwd);
  const fork = git(cwd, ['merge-base', branch, base]).stdout.trim();
  if (log === null || fork === '') return [];
  const since = new Date(git(cwd, ['log', '-1', '--format=%cI', fork]).stdout.trim());
  const entries = slowTestsSince(log, branch, since);
  if (entries.length === 0) return [];
  const count = entries.length === 1 ? '1 test' : `${entries.length} tests`;
  return [
    `! ${count} ran past 5 s on ${branch} since it branched off ${base}:`,
    ...entries.map((e) => `  ${(e.ms / 1000).toFixed(1)} s  ${e.file} > ${e.test}  (${e.at})`),
  ];
}
