import { needsBuild } from '../verify/needs-build.pure.ts';

export const BUILD_COMMANDS = ['npm run build', 'npm run test:build'] as const;

export interface BuildIfNeeded {
  changedPaths: readonly string[];
  run: (command: string) => number | null;
  log: (line: string) => void;
}

export function buildIfNeeded({ changedPaths, run, log }: BuildIfNeeded): boolean {
  if (!needsBuild(changedPaths)) {
    log('✔ no build needed: the branch changes nothing the export reads');
    return true;
  }
  for (const command of BUILD_COMMANDS) {
    if (run(command) !== 0) {
      log(`✖ ${command} failed`);
      return false;
    }
  }
  log('✔ build and build tests passed');
  return true;
}

export function branchDiffRange(base: string, branch: string): string | { error: string } {
  if (base === '') return { error: 'DRIVE_BASE is empty; refusing to pass without diffing' };
  if (branch === '') return { error: 'DRIVE_BRANCH is empty; refusing to pass without diffing' };
  return `${base}...${branch}`;
}
