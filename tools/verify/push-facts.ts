import { spawnSync } from 'node:child_process';

function git(cwd: string, args: string[], allowed: readonly number[] = [0]) {
  const run = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (run.status === null || !allowed.includes(run.status))
    throw new Error(`git ${args.join(' ')} failed: ${(run.stderr || run.error?.message || '').trim()}`);
  return { status: run.status, stdout: run.stdout.trim() };
}

/**
 * The merge-base of HEAD with origin/main, and every path changed from it to HEAD. Without a common ancestor
 * (git's exit 1) the merge-base is null and no paths are listed. Throws when origin/main is missing: run
 * `git fetch origin`.
 */
export function changesSinceMain(cwd: string): { mergeBase: string | null; changedPaths: string[] } {
  const base = git(cwd, ['merge-base', 'HEAD', 'origin/main'], [0, 1]);
  if (base.status === 1) return { mergeBase: null, changedPaths: [] };
  const diff = git(cwd, ['diff', '--name-only', base.stdout, 'HEAD']).stdout;
  return { mergeBase: base.stdout, changedPaths: diff === '' ? [] : diff.split('\n') };
}
