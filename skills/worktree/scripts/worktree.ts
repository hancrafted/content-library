// The worktree lifecycle: `new <branch>` makes a checkout that passes preflight,
// `done <branch>` removes it and fast-forwards local main. With `--base <branch>`
// both work against that branch instead of main. See ../SKILL.md.
import { execFileSync, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from './worktree-args.pure.ts';

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

/** Processes whose cwd sits inside the worktree, from `lsof -Fpcn` output. */
function processesIn(target: string): string[] {
  const found: string[] = [];
  let current = '';
  // lsof exits 1 on harmless warnings, so read its output whatever the exit code.
  const { stdout } = spawnSync('lsof', ['-d', 'cwd', '-Fpcn'], { encoding: 'utf8' });
  for (const line of stdout.split('\n')) {
    if (line.startsWith('p')) current = `pid ${line.slice(1)}`;
    else if (line.startsWith('c')) current += ` (${line.slice(1)})`;
    else if (line.startsWith('n') && (line.slice(1) + '/').startsWith(target + '/')) found.push(current);
  }
  return found;
}

function refuseWhileBusy(target: string): void {
  if (process.cwd().startsWith(target)) fail(`run this from the main checkout, not from inside ${target}`);
  const busy = processesIn(target);
  if (busy.length > 0) fail(`still in use, stop these first (a dev server?):\n  ${busy.join('\n  ')}`);
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

/** A branch merged into its base goes; an unmerged one (a blocked job) stays for a human to inspect. */
function deleteIfMerged(branch: string, base: string): void {
  const merged = spawnSync('git', ['merge-base', '--is-ancestor', branch, base]).status === 0;
  if (!merged) {
    console.warn(`! kept branch ${branch}: it is not merged into ${base}.`);
    return;
  }
  capture('git', ['branch', '-D', branch]);
  console.log(`✔ deleted branch ${branch}, merged into ${base}`);
}

function finish(branch: string, base: string | null): void {
  const target = worktreePath(branch);
  refuseWhileBusy(target);
  if (base === null) refuseUnpushedMain();
  stream('git', ['worktree', 'remove', target]);
  removeContextFolder(branch);
  console.log(`✔ removed ${target} and its Claude Desktop folder`);
  if (base !== null) {
    deleteIfMerged(branch, base);
    return;
  }
  deleteBranch(branch);
  syncMain(mainRoot());
}

const args = parseArgs(process.argv.slice(2));
if ('error' in args) fail(args.error);
else if (args.command === 'new') create(args.branch, args.base);
else finish(args.branch, args.base);
