import { execFileSync, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { stopServers } from '../../../src/pipeline/lib/servers.ts';
import { slowTestReport, trimSlowTests } from '../../../tools/load/slow-tests.mts';
import { parseArgs, refuseNewBranch } from './worktree-args.pure.ts';
import { forkDateBeforeMerge, mergeIntoBase, withMergeLock } from './worktree-merge.ts';
import { describeProc, killable, lineage, parseLsof, planSync, type Proc } from './worktree-process.pure.ts';
import { removeWorktree } from './worktree-remove.ts';
import { signalProcess } from './worktree-signal.ts';

const capture = (cmd: string, args: string[], cwd?: string): string =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();
const stream = (cmd: string, args: string[], cwd?: string) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function mainRoot(): string {
  return path.dirname(path.resolve(capture('git', ['rev-parse', '--git-common-dir'])));
}

function worktreePath(branch: string): string {
  return path.join(mainRoot(), '.worktrees', branch.replaceAll('/', '-'));
}

function removeClaudeDesktopContextFolder(branch: string): void {
  const folder = path.join(mainRoot(), 'docs', 'claude-project-context', branch.replaceAll('/', '-'));
  rmSync(folder, { recursive: true, force: true });
}

function create(branch: string, base: string | null): void {
  const target = worktreePath(branch);
  const branchesFromMain = base === null;
  if (branchesFromMain) stream('git', ['fetch', 'origin']);
  stream('git', ['worktree', 'add', target, '-b', branch, base ?? 'origin/main']);
  const installNodeModulesForRealNeverSymlinked = () => stream('npm', ['ci'], target);
  installNodeModulesForRealNeverSymlinked();
  stream('npx', ['husky'], target);
  console.log(`✔ worktree ready: ${target}\n  next: cd ${target}`);
}

function processesIn(target: string): Proc[] {
  const { stdout: lsofStdoutWhateverItsExitCode } = spawnSync('lsof', ['-d', 'cwd', '-Fpcn'], {
    encoding: 'utf8',
  });
  return parseLsof(lsofStdoutWhateverItsExitCode, target);
}

function protectedPids(): Set<number> {
  const parentOf = new Map<number, number>();
  for (const line of capture('ps', ['-axo', 'pid=,ppid=']).split('\n')) {
    if (line.trim() === '') continue;
    const [pid, ppid] = line.trim().split(/\s+/).map(Number);
    parentOf.set(pid, ppid);
  }
  return lineage(process.pid, parentOf);
}

const isAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

function killProcesses(procs: Proc[]): void {
  for (const proc of procs) signalProcess(proc.pid, 'SIGTERM');
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline && procs.some((p) => isAlive(p.pid))) spawnSync('sleep', ['0.1']);
  for (const proc of procs.filter((p) => isAlive(p.pid))) signalProcess(proc.pid, 'SIGKILL');
  for (const proc of procs) console.log(`✔ stopped ${describeProc(proc)}`);
}

function refuseInsideWorktree(target: string): void {
  if ((process.cwd() + '/').startsWith(target + '/'))
    fail(`run this from the main checkout, not from inside ${target}`);
}

function refuseWhileBusyLastBeforeRemoval(target: string, kill: boolean): void {
  let busy = processesIn(target);
  if (kill && busy.length > 0) {
    killProcesses(killable(busy, protectedPids()));
    busy = processesIn(target);
  }
  if (busy.length > 0)
    fail(
      `still in use, stop these first (a dev server?) or rerun with --kill:\n  ${busy.map(describeProc).join('\n  ')}`,
    );
}

function deleteBranch(branch: string): void {
  try {
    capture('git', ['branch', '-d', branch]);
    console.log(`✔ deleted branch ${branch}`);
  } catch {
    console.warn(
      `! kept branch ${branch}: git sees unmerged commits (squash merge?). Delete with \`git branch -D ${branch}\` once its PR merged.`,
    );
  }
}

function refuseUnpushedMainBeforeAnyRemoval(): void {
  stream('git', ['fetch', 'origin']);
  const unpushed = capture('git', ['log', '--oneline', 'origin/main..main']);
  if (unpushed) fail(`local main holds unpushed commits; push or move them, then rerun:\n${unpushed}`);
}

function syncMain(root: string): void {
  if (capture('git', ['branch', '--show-current'], root) === 'main')
    stream('git', ['merge', '--ff-only', 'origin/main'], root);
  else stream('git', ['fetch', 'origin', 'main:main']);
  console.log('✔ local main fast-forwarded to origin/main');
}

function forceDeleteMergedBranch(branch: string, base: string): void {
  capture('git', ['branch', '-D', branch]);
  console.log(`✔ deleted branch ${branch}, merged into ${base}`);
}

async function mergeBeforeRemoval(branch: string, base: string): Promise<void> {
  const forked = forkDateBeforeMerge(branch, base, mainRoot());
  const note = `since it branched off ${base}`;
  const slowTests = forked === null ? [] : slowTestReport({ cwd: mainRoot(), branch, since: forked, note });
  try {
    const result = await mergeIntoBase(branch, base, { cwd: mainRoot(), log: console.log });
    console.log(result === 'merged' ? `✔ merged ${branch} into ${base}` : `✔ ${branch} already merged into ${base}`);
    for (const line of slowTests) console.log(line);
  } catch (error) {
    fail(`${(error as Error).message}\n  nothing was removed`);
  }
}

function removeCheckout(target: string, branch: string): void {
  try {
    const result = removeWorktree(target, branch, mainRoot());
    if (result === 'leftovers-cleared')
      console.log(
        `✔ cleared what an interrupted removal left in ${target} (Finder metadata, ignored or committed files)`,
      );
    if (result === 'gone') console.log(`✔ ${target} was already removed`);
  } catch (error) {
    fail((error as Error).message);
  }
}

async function finish(branch: string, base: string | null, kill: boolean): Promise<void> {
  const target = worktreePath(branch);
  refuseInsideWorktree(target);
  if (base === null) refuseUnpushedMainBeforeAnyRemoval();
  else await mergeBeforeRemoval(branch, base);
  const portsOfTheRunsOwnServers = stopServers(target);
  for (const port of portsOfTheRunsOwnServers) console.log(`✔ stopped the Run's server on :${port}`);
  refuseWhileBusyLastBeforeRemoval(target, kill);
  removeCheckout(target, branch);
  removeClaudeDesktopContextFolder(branch);
  console.log(`✔ removed ${target} and its Claude Desktop folder`);
  trimSlowTests({ cwd: mainRoot(), now: new Date() });
  if (base !== null) {
    forceDeleteMergedBranch(branch, base);
    return;
  }
  deleteBranch(branch);
  syncMain(mainRoot());
}

async function sync(base: string | null): Promise<void> {
  const branch = capture('git', ['branch', '--show-current']);
  const dirty = capture('git', ['status', '--porcelain']) !== '';
  const plan = planSync({ branch, base, dirty });
  if ('error' in plan) fail(plan.error);
  stream('git', ['fetch', 'origin']);
  const mergedReportedAfterLockRelease = await withMergeLock(
    branch,
    { cwd: process.cwd(), log: console.log },
    () => spawnSync('git', ['merge', plan.target], { stdio: 'inherit' }).status === 0,
  );
  if (!mergedReportedAfterLockRelease)
    fail(`merge of ${plan.target} into ${branch} stopped; resolve it or run \`git merge --abort\``);
  console.log(`✔ ${branch} merged with ${plan.target}`);
}

function localBranchExists(branch: string): boolean {
  return spawnSync('git', ['show-ref', '--verify', '--quiet', `refs/heads/${branch}`]).status === 0;
}

const args = parseArgs(process.argv.slice(2));
if ('error' in args) fail(args.error);
else if (args.command === 'new') {
  const refusal = refuseNewBranch(args, localBranchExists);
  if (refusal !== null) fail(refusal);
  create(args.branch, args.base);
} else if (args.command === 'sync') await sync(args.base);
else await finish(args.branch, args.base, args.kill);
