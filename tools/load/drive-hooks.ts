// This repo's hooks for the `drive` CLI's worktree finish, named in docs/drive/project.yml. The CLI runs each as
// `node tools/load/drive-hooks.ts <hook>` with DRIVE_* in the environment, so the skill itself knows none of this.
import { rmSync } from 'node:fs';
import path from 'node:path';
import { stopServers } from '../../src/pipeline/lib/servers.ts';
import { slowTestReport, trimSlowTests } from './slow-tests.mts';

const env = (name: string): string => process.env[name] ?? '';
const slug = env('DRIVE_BRANCH').replaceAll('/', '-');

const hooks: Record<string, () => void> = {
  /** The Run's own dev and Spec servers (pid files in the worktree); no other process is touched. */
  'stop-servers': () => {
    for (const port of stopServers(env('DRIVE_WORKTREE'))) console.log(`✔ stopped the Run's server on :${port}`);
  },
  /** Every fast-suite test that ran past 750 ms on the branch since it forked off its base. */
  'slow-tests': () => {
    const since = new Date(env('DRIVE_FORKED_AT'));
    if (Number.isNaN(since.getTime())) return;
    const note = `since it branched off ${env('DRIVE_BASE')}`;
    for (const line of slowTestReport({ cwd: env('DRIVE_ROOT'), branch: env('DRIVE_BRANCH'), since, note }))
      console.log(line);
  },
  /** The branch's Claude Desktop folder; skills/claude-project-context/scripts/sync.ts names it by the same slug. */
  'remove-context': () => {
    rmSync(path.join(env('DRIVE_ROOT'), 'docs', 'claude-project-context', slug), { recursive: true, force: true });
    console.log('✔ removed its Claude Desktop folder');
  },
  /** Keeps the slow-tests log to its last 30 days. */
  'trim-slow-tests': () => trimSlowTests({ cwd: env('DRIVE_ROOT'), now: new Date() }),
};

const hook = hooks[process.argv[2] ?? ''];
if (hook === undefined) {
  console.error(`✖ unknown hook '${process.argv[2]}'; expected ${Object.keys(hooks).join(', ')}`);
  process.exit(1);
}
hook();
