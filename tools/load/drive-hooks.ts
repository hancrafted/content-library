import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { stopServers } from '../../src/pipeline/lib/servers.ts';
import { branchDiffRange, buildIfNeeded } from './build-if-needed.pure.ts';
import { slowTestReport, trimSlowTests } from './slow-tests.mts';

const env = (name: string): string => process.env[name] ?? '';
const slug = env('DRIVE_BRANCH').replaceAll('/', '-');

function changedPathsOfBranch(): string[] {
  const range = branchDiffRange(env('DRIVE_BASE'), env('DRIVE_BRANCH'));
  if (typeof range !== 'string') throw new Error(range.error);
  const diff = spawnSync('git', ['diff', '--name-only', range], { encoding: 'utf8' });
  if (diff.status !== 0) throw new Error(`git diff failed: ${diff.stderr.trim()}`);
  return diff.stdout.split('\n').filter(Boolean);
}

const hooks: Record<string, () => void> = {
  'build-if-needed': () => {
    const built = buildIfNeeded({
      changedPaths: changedPathsOfBranch(),
      run: (command) => spawnSync(command, { shell: true, stdio: 'inherit' }).status,
      log: console.log,
    });
    if (!built) process.exit(1);
  },
  'stop-servers': () => {
    for (const port of stopServers(env('DRIVE_WORKTREE'))) console.log(`✔ stopped the Run's server on :${port}`);
  },
  'slow-tests': () => {
    const since = new Date(env('DRIVE_FORKED_AT'));
    if (Number.isNaN(since.getTime())) return;
    const note = `since it branched off ${env('DRIVE_BASE')}`;
    for (const line of slowTestReport({
      cwd: env('DRIVE_ROOT'),
      branch: env('DRIVE_BRANCH'),
      since,
      note,
    }))
      console.log(line);
  },
  'remove-context': () => {
    rmSync(path.join(env('DRIVE_ROOT'), 'docs', 'claude-project-context', slug), { recursive: true, force: true });
    console.log('✔ removed its Claude Desktop folder');
  },
  'trim-slow-tests': () => trimSlowTests({ cwd: env('DRIVE_ROOT'), now: new Date() }),
};

const hook = hooks[process.argv[2] ?? ''];
if (hook === undefined) {
  console.error(`✖ unknown hook '${process.argv[2]}'; expected ${Object.keys(hooks).join(', ')}`);
  process.exit(1);
}
hook();
