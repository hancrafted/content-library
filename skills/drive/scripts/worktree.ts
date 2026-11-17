// The worktree lifecycle, `drive worktree <command>`: `new <branch>` makes a checkout, `done <branch> [--kill]`
// removes it and fast-forwards the local base branch, `sync` merges the remote base branch into the current branch,
// `preflight` runs the project's health check. With `--base <branch>` the first three work against that branch
// instead, and `done` merges into it first. Every project-specific value comes from docs/drive/project.yml.
import { execFileSync, spawnSync } from 'node:child_process';
import { capture, fail, loadProject, mainRoot, type Project, runAfter, runHooks, worktreePath } from './project.ts';
import { parseArgs, refuseNewBranch } from './worktree-args.pure.ts';
import { insideWorktree, refuseWhileBusy } from './worktree-busy.ts';
import { forkDate, mergeIntoBase, withMergeLock } from './worktree-merge.ts';
import { planSync } from './worktree-process.pure.ts';
import { removeWorktree } from './worktree-remove.ts';

/** Runs a command with its output streamed to the terminal; throws when it fails. */
const stream = (cmd: string, args: string[], cwd?: string) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });

function create(project: Project, branch: string, base: string | null): void {
  const { config } = project;
  const target = worktreePath(project, branch);
  // A local base (an Episode's integration branch) may not be pushed yet, so only the remote base branch is fetched.
  if (base === null) stream('git', ['fetch', config.remote]);
  stream('git', ['worktree', 'add', target, '-b', branch, base ?? project.remoteBase]);
  for (const command of config.install)
    if (spawnSync(command, { shell: true, cwd: target, stdio: 'inherit' }).status !== 0)
      fail(`install step failed in ${target}: ${command}`);
  console.log(`✔ worktree ready: ${target}\n  next: cd ${target}`);
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
function refuseUnpushedBase(project: Project): void {
  const { remote, baseBranch } = project.config;
  stream('git', ['fetch', remote]);
  const unpushed = capture('git', ['log', '--oneline', `${project.remoteBase}..${baseBranch}`]);
  if (unpushed) fail(`local ${baseBranch} holds unpushed commits; push or move them, then rerun:\n${unpushed}`);
}

function syncBase(project: Project, root: string): void {
  const { remote, baseBranch } = project.config;
  if (capture('git', ['branch', '--show-current'], root) === baseBranch)
    stream('git', ['merge', '--ff-only', project.remoteBase], root);
  else stream('git', ['fetch', remote, `${baseBranch}:${baseBranch}`]);
  console.log(`✔ local ${baseBranch} fast-forwarded to ${project.remoteBase}`);
}

/** The branch is merged into its base by now, so it goes. */
function deleteMerged(branch: string, base: string): void {
  capture('git', ['branch', '-D', branch]);
  console.log(`✔ deleted branch ${branch}, merged into ${base}`);
}

/** Merges the branch into its base, then runs the project's after-merge hooks (a slow-test report, say). */
async function mergeBeforeRemoval(project: Project, finishing: Finish & { base: string }): Promise<void> {
  const { branch, base, target } = finishing;
  // Read before the merge, which moves the merge-base up to the branch tip.
  const forkedAt = forkDate(branch, base, mainRoot());
  try {
    const result = await mergeIntoBase(branch, base, {
      cwd: mainRoot(),
      log: console.log,
      withLock: project.withLock,
    });
    console.log(result === 'merged' ? `✔ merged ${branch} into ${base}` : `✔ ${branch} already merged into ${base}`);
  } catch (error) {
    fail(`${(error as Error).message}\n  nothing was removed`);
  }
  runAfter(project.config.afterMerge, { branch, base, worktree: target, forkedAt });
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

/** The branch being finished, its base (null for the config's base branch), its folder and whether --kill was given. */
interface Finish {
  branch: string;
  base: string | null;
  target: string;
  kill: boolean;
}

async function finish(project: Project, { branch, base, kill }: Omit<Finish, 'target'>): Promise<void> {
  const target = worktreePath(project, branch);
  const hook = { branch, base, worktree: target };
  if (insideWorktree(target)) fail(`run this from the main checkout, not from inside ${target}`);
  if (base === null) refuseUnpushedBase(project);
  // Merged before anything is removed, so a failure leaves the worktree and branch intact.
  else await mergeBeforeRemoval(project, { branch, base, target, kill });
  // Every refusing guard has passed; stopping processes comes last, just before removal.
  if (!runHooks(project.config.beforeRemove, hook)) fail('a hook before the removal failed; nothing was removed');
  refuseWhileBusy(target, kill, fail);
  removeCheckout(target, branch);
  console.log(`✔ removed ${target}`);
  runAfter(project.config.afterRemove, hook);
  if (base !== null) {
    deleteMerged(branch, base);
    return;
  }
  deleteBranch(branch);
  syncBase(project, mainRoot());
}

/**
 * Fetches the remote, then merges its base branch (or the --base branch) into the current worktree's branch, holding
 * that branch's merge lock, so a `done --base` into this branch waits instead of merging alongside.
 */
async function sync(project: Project, base: string | null): Promise<void> {
  const { baseBranch, remote } = project.config;
  const branch = capture('git', ['branch', '--show-current']);
  const dirty = capture('git', ['status', '--porcelain']) !== '';
  const plan = planSync({ branch, base, dirty, baseBranch, remote });
  if ('error' in plan) fail(plan.error);
  stream('git', ['fetch', remote]);
  // Fails only once the lock is released: process.exit inside it would skip the release.
  const merged = await withMergeLock(
    branch,
    { cwd: process.cwd(), log: console.log, withLock: project.withLock },
    () => spawnSync('git', ['merge', plan.target], { stdio: 'inherit' }).status === 0,
  );
  if (!merged) fail(`merge of ${plan.target} into ${branch} stopped; resolve it or run \`git merge --abort\``);
  console.log(`✔ ${branch} merged with ${plan.target}`);
}

/** Runs the project's preflight command in the current checkout and exits with its status. */
function preflight(project: Project): never {
  const { preflight: command } = project.config;
  if (command === null) fail('no worktree.preflight in docs/drive/project.yml');
  process.exit(spawnSync(command, { shell: true, stdio: 'inherit' }).status ?? 1);
}

/** Whether a local branch of that name exists. */
function localBranchExists(branch: string): boolean {
  return spawnSync('git', ['show-ref', '--verify', '--quiet', `refs/heads/${branch}`]).status === 0;
}

/** `drive worktree <argv>`. */
export async function runWorktree(argv: readonly string[]): Promise<void> {
  const project = await loadProject();
  const { invoke, baseBranch } = project.config;
  const args = parseArgs(argv, invoke);
  if ('error' in args) fail(args.error);
  else if (args.command === 'new') {
    const refusal = refuseNewBranch(args, localBranchExists, { invoke, baseBranch });
    if (refusal !== null) fail(refusal);
    create(project, args.branch, args.base);
  } else if (args.command === 'sync') await sync(project, args.base);
  else if (args.command === 'preflight') preflight(project);
  else await finish(project, args);
}
