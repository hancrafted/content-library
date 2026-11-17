// The two git facts the load tools read about where they run: the git common directory every worktree of the
// clone shares (the lock and the slow-tests log live there), and the branch checked out.
import { spawnSync } from 'node:child_process';

const git = (cwd: string, ...args: string[]) => spawnSync('git', args, { cwd, encoding: 'utf8' });

/** The absolute git common directory of the repository `cwd` sits in, or null outside a git repository. */
export function gitCommonDir(cwd: string): string | null {
  const common = git(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir');
  return common.status === 0 ? common.stdout.trim() : null;
}

/** The branch checked out at `cwd`; empty on a detached HEAD or outside a repository. */
export const currentBranch = (cwd: string): string => git(cwd, 'branch', '--show-current').stdout?.trim() ?? '';
