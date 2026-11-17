// A run's project: the config of the checkout it runs in, the lock module that config names, and the shell hooks it
// runs around a finish.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseConfig, type WorktreeConfig } from './config.pure.ts';
import { noLock, type WithLock } from './worktree-merge.ts';

/** Runs a command and returns its output. */
export const capture = (cmd: string, args: string[], cwd?: string): string =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();

export function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/** The main checkout, wherever this runs from: worktrees share its git dir. */
export function mainRoot(): string {
  return path.dirname(path.resolve(capture('git', ['rev-parse', '--git-common-dir'])));
}

/** Everything one run needs besides its arguments: the config and what it names. */
export interface Project {
  config: WorktreeConfig;
  /** The remote's base branch, `origin/main`. */
  remoteBase: string;
  withLock: WithLock;
}

/** The config of the checkout this runs in, and the lock module it names, if any. */
export async function loadProject(): Promise<Project> {
  const root = capture('git', ['rev-parse', '--show-toplevel']);
  let text = '';
  try {
    text = readFileSync(path.join(root, 'docs', 'drive', 'project.yml'), 'utf8');
  } catch {
    // No config: the defaults, which hold no lock, no install steps and no hooks.
  }
  const parsed = parseConfig(text);
  if ('error' in parsed) fail(parsed.error);
  const { worktree: config } = parsed;
  let withLock = noLock;
  if (config.lock !== null) {
    const loaded = (await import(pathToFileURL(path.resolve(root, config.lock)).href)) as { withLock?: WithLock };
    if (typeof loaded.withLock !== 'function') fail(`worktree.lock: ${config.lock} does not export withLock`);
    withLock = loaded.withLock;
  }
  return { config, remoteBase: `${config.remote}/${config.baseBranch}`, withLock };
}

export function worktreePath(project: Project, branch: string): string {
  return path.join(mainRoot(), project.config.dir, branch.replaceAll('/', '-'));
}

/** What a hook sees: its branch, that branch's base and worktree, and when it forked. */
export interface HookEnv {
  branch: string;
  base: string | null;
  worktree: string;
  forkedAt?: Date | null;
}

/** Runs the project's shell commands from the main checkout, each with DRIVE_* in its environment; false at the first failure. */
export function runHooks(commands: readonly string[], hook: HookEnv): boolean {
  const env = {
    ...process.env,
    DRIVE_ROOT: mainRoot(),
    DRIVE_BRANCH: hook.branch,
    DRIVE_BASE: hook.base ?? '',
    DRIVE_WORKTREE: hook.worktree,
    DRIVE_FORKED_AT: hook.forkedAt?.toISOString() ?? '',
  };
  for (const command of commands) {
    const { status } = spawnSync(command, { shell: true, cwd: mainRoot(), env, stdio: 'inherit' });
    if (status !== 0) {
      console.error(`✖ hook failed (${status}): ${command}`);
      return false;
    }
  }
  return true;
}

/** A hook whose failure cannot undo what already happened: reported, then the finish goes on. */
export function runAfter(commands: readonly string[], hook: HookEnv): void {
  if (!runHooks(commands, hook)) console.warn('! a hook after the finish failed; the finish itself went through');
}
