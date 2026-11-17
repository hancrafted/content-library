// Merging a finished branch into its --base, before its worktree is removed.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { type Timing, withLock } from '../../../tools/load/lock.ts';
import { git } from './git.ts';

/** A worktree's own git dir, where git keeps its merge, rebase and cherry-pick state. */
const gitDirOf = (tree: string) => git(tree, ['rev-parse', '--absolute-git-dir']).stdout.trim();

/** The branch a worktree is rebasing, from `rebase-merge/head-name` or `rebase-apply/head-name`, or null. */
function rebasing(tree: string): string | null {
  for (const dir of ['rebase-merge', 'rebase-apply']) {
    const headName = path.join(gitDirOf(tree), dir, 'head-name');
    if (existsSync(headName)) return readFileSync(headName, 'utf8').trim();
  }
  return null;
}

/**
 * The worktree that has `base` checked out, from `git worktree list --porcelain`. A rebase detaches HEAD, so a
 * detached worktree that is rebasing `base` counts too.
 */
function checkoutOf(base: string, cwd: string): string | null {
  const listing = execFileSync('git', ['worktree', 'list', '--porcelain'], {
    cwd,
    encoding: 'utf8',
  });
  for (const entry of listing.split('\n\n')) {
    const lines = entry.split('\n');
    const dir = lines.find((line) => line.startsWith('worktree '))?.slice('worktree '.length);
    if (!dir) continue;
    if (lines.includes(`branch refs/heads/${base}`)) return dir;
    if (lines.includes('detached') && rebasing(dir) === `refs/heads/${base}`) return dir;
  }
  return null;
}

/** What a merge, rebase or cherry-pick in progress leaves in a worktree's git dir, and how to name it. */
const IN_PROGRESS = [
  ['MERGE_HEAD', 'a merge'],
  ['REBASE_HEAD', 'a rebase'],
  ['rebase-merge', 'a rebase'],
  ['rebase-apply', 'a rebase'],
  ['CHERRY_PICK_HEAD', 'a cherry-pick'],
] as const;

/** What keeps `tree` busy (a merge, rebase or cherry-pick in progress), or null when nothing does. */
function busyWith(tree: string): string | null {
  const gitDir = gitDirOf(tree);
  return IN_PROGRESS.find(([name]) => existsSync(path.join(gitDir, name)))?.[1] ?? null;
}

/** Where a merge runs from (a directory inside the repository) and where its progress lines go. */
export interface MergeContext {
  cwd: string;
  log: (line: string) => void;
}

/**
 * Runs `fn` holding the merge lock of `branch` (tools/load/lock.ts), which every merge into `branch` holds:
 * `wt:done --base` merging into it and `wt:sync` run on it. Logs one line while it waits for another holder.
 */
export function withMergeLock<T>(branch: string, { cwd, log }: MergeContext, fn: () => T | Promise<T>): Promise<T> {
  const onWait = () => log(`… waiting for another merge into ${branch} to finish`);
  return withLock(`wt-merge/${branch}`, { pollMs: 100, timeoutMs: 10 * 60 * 1000, cwd, onWait }, fn);
}

/** A merge of `branch` into `base`, run from `cwd`, a directory inside the repository. */
interface Merge {
  branch: string;
  base: string;
  cwd: string;
}

/** Git's own message for merging `branch` into `base`, which leaves out " into main" and " into master". */
const mergeMessage = ({ branch, base }: Merge) =>
  `Merge branch '${branch}'${['main', 'master'].includes(base) ? '' : ` into ${base}`}`;

/**
 * The merge commit of the branch into the commit `baseTip`, built in the object store alone (`git merge-tree`, then
 * `git commit-tree` with both as parents), so no worktree, index or ref changes. Throws, naming the conflicting
 * paths, when the merge conflicts.
 */
function buildMerge(merge: Merge, baseTip: string): string {
  const { branch, base, cwd } = merge;
  const result = git(cwd, ['merge-tree', '--write-tree', '--name-only', baseTip, branch]);
  const [tree, ...rest] = result.stdout.split('\n');
  if (result.status === 1) {
    // After the tree: the conflicting paths, a blank line, then git's CONFLICT messages.
    const blank = rest.indexOf('');
    const paths = rest.slice(0, blank === -1 ? rest.length : blank);
    const messages =
      blank === -1
        ? ''
        : rest
            .slice(blank + 1)
            .join('\n')
            .trim();
    throw new Error(
      `merging ${branch} into ${base} conflicts in:\n  ${paths.join('\n  ')}\n${messages}\n${base} was left as it was`,
    );
  }
  if (result.status !== 0) throw new Error(`git merge-tree failed:\n${result.stderr}`);
  const commit = git(cwd, ['commit-tree', tree, '-p', baseTip, '-p', branch, '-m', mergeMessage(merge)]);
  if (commit.status !== 0) throw new Error(`git commit-tree failed:\n${commit.stderr}`);
  return commit.stdout.trim();
}

/** How long a merge waits for a busy base, and how often it looks again. */
const BUSY_WAIT: Timing = { pollMs: 5000, timeoutMs: 10 * 60 * 1000 };

/** One attempt's outcome: done, or the base's worktree busy with something (`detail` adds git's own words). */
type Attempt = { done: 'merged' | 'already-merged' } | { tree: string; busy: string; detail: string };

/**
 * One attempt at the merge: fast-forwards the base's worktree to the merge commit unless that worktree is busy.
 * `built` keeps the commit between attempts, rebuilt only when the base tip moved since: whoever made the base busy
 * may have committed onto it meanwhile.
 */
function attempt(merge: Merge, built: { on: string; commit: string }): Attempt {
  const { branch, base, cwd } = merge;
  if (git(cwd, ['merge-base', '--is-ancestor', branch, base]).status === 0) return { done: 'already-merged' };
  const tree = checkoutOf(base, cwd);
  if (tree === null) throw new Error(`${base} is not checked out in any worktree; check it out, then rerun`);
  const baseTip = git(cwd, ['rev-parse', '--verify', `refs/heads/${base}`]).stdout.trim();
  if (built.on !== baseTip) Object.assign(built, { on: baseTip, commit: buildMerge(merge, baseTip) });
  const busy = busyWith(tree);
  if (busy !== null) return { tree, busy, detail: '' };
  const forward = git(tree, ['merge', '--ff-only', built.commit]);
  if (forward.status === 0) return { done: 'merged' };
  return {
    tree,
    busy: 'a refused fast-forward',
    detail: `:\n${forward.stdout}${forward.stderr}`.trimEnd(),
  };
}

/**
 * Merges `branch` into `base` with a merge commit. The commit is built outside any worktree (`buildMerge`), then
 * `base` fast-forwards to it inside the worktree that has `base` checked out, so a conflict changes nothing.
 * While that worktree is busy (a merge, rebase or cherry-pick in progress, or the fast-forward refused, say over
 * local changes), it waits and looks again every `pollMs`, logging one line, and rebuilds the commit when the
 * base tip moved meanwhile. Holds the base's merge lock (`withMergeLock`) throughout, so merges into one base
 * serialize. Rejects, with the base left as it was, when the base is checked out nowhere, the merge conflicts or
 * the base stays busy past `timeoutMs`.
 */
export function mergeIntoBase(
  branch: string,
  base: string,
  options: MergeContext & Partial<Timing>,
): Promise<'merged' | 'already-merged'> {
  const { cwd, log, pollMs, timeoutMs } = { ...BUSY_WAIT, ...options };
  return withMergeLock(base, { cwd, log }, async () => {
    const deadline = Date.now() + timeoutMs;
    const built = { on: '', commit: '' };
    for (let round = 0; ; round++) {
      const outcome = attempt({ branch, base, cwd }, built);
      if ('done' in outcome) return outcome.done;
      const { tree, busy, detail } = outcome;
      if (Date.now() >= deadline)
        throw new Error(
          `${base} in ${tree} stayed busy with ${busy} for ${timeoutMs / 1000} s; finish it, then rerun${detail}`,
        );
      if (round === 0)
        log(
          `… ${base} in ${tree} is busy with ${busy}; looking again every ${pollMs / 1000} s for up to ${timeoutMs / 60_000} min`,
        );
      await sleep(pollMs);
    }
  });
}

/**
 * The committer date of the merge-base of `branch` and `base`: when the branch forked, as far as the slow-tests log
 * is concerned. Null when the two share no history. Ask before merging: afterwards the merge-base is the tip.
 */
export function forkDate(branch: string, base: string, cwd: string): Date | null {
  const fork = git(cwd, ['merge-base', branch, base]).stdout.trim();
  if (fork === '') return null;
  return new Date(git(cwd, ['log', '-1', '--format=%cI', fork]).stdout.trim());
}
