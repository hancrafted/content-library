// A run's project: the config of the checkout it runs in, the lock module that config names, and the shell hooks it
// runs around a finish.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONFIG_PATH, type DriveConfig, parseConfig, type WorktreeConfig } from './config.pure.ts';
import { capture } from './git.ts';
import { noLock, type WithLock } from './worktree-merge.ts';

export function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/**
 * The CLI's `drive.ts` as a command path: relative to `root` with `/`, or absolute when the skill sits outside the
 * repo, so a path written into the repo never leaves it. A relative result is therefore a path inside the repo.
 */
export function driveEntry(root: string, scriptsDir: string = import.meta.dirname): string {
  const relative = path.relative(root, path.join(scriptsDir, 'drive.ts'));
  const inside = relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
  return (inside ? relative : path.resolve(root, relative)).split(path.sep).join('/');
}

/** The main checkout, wherever this runs from: worktrees share its git dir. */
function mainRoot(): string {
  return path.dirname(path.resolve(capture('git', ['rev-parse', '--git-common-dir'])));
}

/** Everything one run needs besides its arguments: the config and what it names. */
export interface Project {
  config: WorktreeConfig;
  /** The main checkout, found once per run. */
  root: string;
  /** The remote's base branch, `origin/main`. */
  remoteBase: string;
  withLock: WithLock;
}

/** The config under `root`; no config file gives the defaults. Exits with the message when the file is invalid. */
export function loadConfig(root: string): DriveConfig {
  let text = '';
  try {
    text = readFileSync(path.join(root, CONFIG_PATH), 'utf8');
  } catch {
    // No config: the defaults, which hold no lock, no install steps, no hooks and no Decision docs.
  }
  const parsed = parseConfig(text, driveEntry(root));
  if ('error' in parsed) fail(parsed.error);
  return parsed;
}

/** The config of the checkout this runs in, and the lock module it names, if any. */
export async function loadProject(): Promise<Project> {
  const root = capture('git', ['rev-parse', '--show-toplevel']);
  const parsed = loadConfig(root);
  const { worktree: config } = parsed;
  let withLock = noLock;
  if (config.lock !== null) {
    const loaded = (await import(pathToFileURL(path.resolve(root, config.lock)).href)) as { withLock?: WithLock };
    if (typeof loaded.withLock !== 'function') fail(`worktree.lock: ${config.lock} does not export withLock`);
    withLock = loaded.withLock;
  } else console.warn('! no worktree.lock configured: merges into a base are not serialized');
  return {
    config,
    root: mainRoot(),
    remoteBase: `${config.remote}/${config.baseBranch}`,
    withLock,
  };
}

export function worktreePath(project: Project, branch: string): string {
  return path.join(project.root, project.config.dir, branch.replaceAll('/', '-'));
}

/** What a hook sees: its branch, that branch's base and worktree, and when it forked. */
export interface HookEnv {
  branch: string;
  base: string | null;
  worktree: string;
  forkedAt: Date | null;
}

/** Runs the project's shell commands from the main checkout, each with DRIVE_* in its environment; false at the first failure. */
export function runHooks(project: Project, commands: readonly string[], hook: HookEnv): boolean {
  const env = {
    ...process.env,
    DRIVE_ROOT: project.root,
    DRIVE_BRANCH: hook.branch,
    DRIVE_BASE: hook.base ?? '',
    DRIVE_WORKTREE: hook.worktree,
    DRIVE_FORKED_AT: hook.forkedAt?.toISOString() ?? '',
  };
  for (const command of commands) {
    const { status } = spawnSync(command, {
      shell: true,
      cwd: project.root,
      env,
      stdio: 'inherit',
    });
    if (status !== 0) {
      console.error(`✖ hook failed (${status}): ${command}`);
      return false;
    }
  }
  return true;
}

/** A hook whose failure cannot undo what already happened: reported, then the finish goes on. */
export function runAfter(project: Project, commands: readonly string[], hook: HookEnv): void {
  if (!runHooks(project, commands, hook))
    console.warn('! a hook after the finish failed; the finish itself went through');
}
