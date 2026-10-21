// The worktree lifecycle: `new <branch>` makes a checkout that passes preflight,
// `done <branch> [--kill]` removes it and fast-forwards local main, `sync` merges origin/main into the current branch. With `--base <branch>`
// both work against that branch instead of main, and `done` merges into it first. See ../SKILL.md.
import { execFileSync, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { stopServers } from '../../new-episode/scripts/servers.ts';
import { parseArgs } from './worktree-args.pure.ts';
import { mergeIntoBase } from './worktree-merge.ts';
import { describeProc, killable, lineage, parseLsof, planSync, type Proc } from './worktree-process.pure.ts';

/** Runs a command and returns its output. */
const capture = (cmd: string, args: string[], cwd?: string): string =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();
/** Runs a command with its output streamed to the terminal. */
const stream = (cmd: string, args: string[], cwd?: string) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/** The main checkout, wherever this runs from: worktrees share its git dir. */
function mainRoot(): string {
  return path.dirname(path.resolve(capture('git', ['rev-parse', '--git-common-dir'])));
}

function worktreePath(branch: string): string {
  return path.join(mainRoot(), '.worktrees', branch.replaceAll('/', '-'));
}

/** The branch's Claude Desktop folder; skills/claude-project-context/scripts/sync.ts names it by the same slug. */
function removeContextFolder(branch: string): void {
  const folder = path.join(mainRoot(), 'docs', 'claude-project-context', branch.replaceAll('/', '-'));
  rmSync(folder, { recursive: true, force: true });
}

function create(branch: string, base: string | null): void {
  const target = worktreePath(branch);
  // A local base (an Episode's integration branch) may not be pushed yet, so only main is fetched.
  if (base === null) stream('git', ['fetch', 'origin']);
  stream('git', ['worktree', 'add', target, '-b', branch, base ?? 'origin/main']);
  // A real install, never a symlink: Turbopack, mh check and husky all need it.
  stream('npm', ['ci'], target);
  stream('npx', ['husky'], target);
  console.log(`✔ worktree ready: ${target}\n  next: cd ${target}`);
}

/** Processes whose cwd sits inside the worktree. */
function processesIn(target: string): Proc[] {
  // lsof exits 1 on harmless warnings, so read its output whatever the exit code.
  const { stdout } = spawnSync('lsof', ['-d', 'cwd', '-Fpcn'], { encoding: 'utf8' });
  return parseLsof(stdout, target);
}

/** This process and its ancestors (the agent's shell among them), which --kill never touches. */
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

/** SIGTERM, a short wait, then SIGKILL for whatever is left. */
function killProcesses(procs: Proc[]): void {
  const signal = (proc: Proc, sig: NodeJS.Signals) => {
    try {
      process.kill(proc.pid, sig);
    } catch {
      // already gone
    }
  };
  for (const proc of procs) signal(proc, 'SIGTERM');
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline && procs.some((p) => isAlive(p.pid))) spawnSync('sleep', ['0.1']);
  for (const proc of procs.filter((p) => isAlive(p.pid))) signal(proc, 'SIGKILL');
  for (const proc of procs) console.log(`✔ stopped ${describeProc(proc)}`);
}

function refuseInsideWorktree(target: string): void {
  if ((process.cwd() + '/').startsWith(target + '/'))
    fail(`run this from the main checkout, not from inside ${target}`);
}

/** Refuses while something still runs in the worktree; with `kill`, stops it first. Run last, once every other guard passed. */
function refuseWhileBusy(target: string, kill: boolean): void {
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

/** Checked before anything is removed, so a refusal leaves the worktree intact. */
function refuseUnpushedMain(): void {
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

/** The branch is merged into its base by now, so it goes. */
function deleteMerged(branch: string, base: string): void {
  capture('git', ['branch', '-D', branch]);
  console.log(`✔ deleted branch ${branch}, merged into ${base}`);
}

function mergeBeforeRemoval(branch: string, base: string): void {
  try {
    const result = mergeIntoBase(branch, base, mainRoot());
    console.log(result === 'merged' ? `✔ merged ${branch} into ${base}` : `✔ ${branch} already merged into ${base}`);
  } catch (error) {
    fail(`${(error as Error).message}\n  nothing was removed`);
  }
}

function finish(branch: string, base: string | null, kill: boolean): void {
  const target = worktreePath(branch);
  refuseInsideWorktree(target);
  if (base === null) refuseUnpushedMain();
  // Merged before anything is removed, so a failure leaves the worktree and branch intact.
  else mergeBeforeRemoval(branch, base);
  // Every refusing guard has passed; stopping processes comes last, just before removal.
  // The Run's own dev and Spec servers (pid files in the worktree); no other process is touched.
  for (const port of stopServers(target)) console.log(`✔ stopped the Run's server on :${port}`);
  refuseWhileBusy(target, kill);
  stream('git', ['worktree', 'remove', target]);
  removeContextFolder(branch);
  console.log(`✔ removed ${target} and its Claude Desktop folder`);
  if (base !== null) {
    deleteMerged(branch, base);
    return;
  }
  deleteBranch(branch);
  syncMain(mainRoot());
}

/** Fetches origin, then merges origin/main (or the base) into the current worktree's branch. */
function sync(base: string | null): void {
  const branch = capture('git', ['branch', '--show-current']);
  const dirty = capture('git', ['status', '--porcelain']) !== '';
  const plan = planSync({ branch, base, dirty });
  if ('error' in plan) fail(plan.error);
  stream('git', ['fetch', 'origin']);
  try {
    stream('git', ['merge', plan.target]);
  } catch {
    fail(`merge of ${plan.target} into ${branch} stopped; resolve it or run \`git merge --abort\``);
  }
  console.log(`✔ ${branch} merged with ${plan.target}`);
}

const args = parseArgs(process.argv.slice(2));
if ('error' in args) fail(args.error);
else if (args.command === 'new') create(args.branch, args.base);
else if (args.command === 'sync') sync(args.base);
else finish(args.branch, args.base, args.kill);
