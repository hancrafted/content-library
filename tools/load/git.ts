import { spawnSync } from 'node:child_process';

const git = (cwd: string, ...args: string[]) => spawnSync('git', args, { cwd, encoding: 'utf8' });

export function gitCommonDir(cwd: string): string | null {
  const common = git(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir');
  return common.status === 0 ? common.stdout.trim() : null;
}

export const currentBranch = (cwd: string): string => git(cwd, 'branch', '--show-current').stdout?.trim() ?? '';
