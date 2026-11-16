// The worktree script's arguments: `new|done <branch> [--base <branch>] [--kill]`
// and `sync [--base <branch>]`. Without --base a worktree branches from origin/main
// and finishing it syncs local main; with it, both work against that branch instead.
// --kill (done only) stops the processes that hold the worktree.

export interface WorktreeArgs {
  command: 'new' | 'done' | 'sync';
  /** Empty for `sync`, which works on the current worktree's branch. */
  branch: string;
  /** The branch to start from and merge into, or null for origin/main. */
  base: string | null;
  /** `done` only: stop the processes that block removal. */
  kill: boolean;
  /** A subagent branch's parent, everything before its first `--`; null for an orchestrator branch. */
  parent: string | null;
  /** The ticket in `<parent>--<issue>-<task>`; null without one. The cleanup skill matches branches to issues by it. */
  issue: number | null;
}

interface Owner {
  parent: string | null;
  issue: number | null;
}

/** Reads who owns a branch: `<type>/<slug>` is an orchestrator's, `<parent>--[<issue>-]<task>` a subagent's. */
function readOwner(branch: string): Owner | { error: string } {
  const split = branch.indexOf('--');
  if (split === -1) return { parent: null, issue: null };
  const task = branch.slice(split + 2);
  if (task === '')
    return { error: `'${branch}' needs <parent>--<task>: the parent before the first --, the task after it` };
  const ticket = /^(\d+)-./.exec(task);
  return { parent: branch.slice(0, split), issue: ticket === null ? null : Number(ticket[1]) };
}

const USAGE =
  'usage: npm run wt:new -- <branch> [--base <branch>]  |  npm run wt:done -- <branch> [--base <branch>] [--kill]  |  npm run wt:sync [-- --base <branch>]';

/** A branch name, not a missing argument or a flag in its place. */
function isBranch(value: string | undefined): value is string {
  return value !== undefined && value !== '' && !value.startsWith('--');
}

const COMMANDS: readonly string[] = ['new', 'done', 'sync'];

interface Flags {
  positional: string[];
  base: string | null;
  kill: boolean;
}

/** Splits the tokens after the command into flags and positional words. */
function readFlags(tokens: readonly string[]): Flags | { error: string } {
  const flags: Flags = { positional: [], base: null, kill: false };
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '--kill') flags.kill = true;
    else if (tokens[i] !== '--base') flags.positional.push(tokens[i]);
    else if (isBranch(tokens[i + 1])) flags.base = tokens[++i];
    else return { error: '--base needs a branch name' };
  }
  return flags;
}

function checkShape(command: string, flags: Flags): string | null {
  if (!COMMANDS.includes(command)) return `unknown command '${command}'; expected new, done or sync`;
  const branches = flags.positional.filter((word) => isBranch(word));
  if (flags.positional.length !== branches.length || branches.length !== (command === 'sync' ? 0 : 1)) return USAGE;
  return flags.kill && command !== 'done' ? '--kill belongs to done' : null;
}

export function parseArgs(argv: readonly string[]): WorktreeArgs | { error: string } {
  const [command, ...tokens] = argv;
  const flags = readFlags(tokens);
  if ('error' in flags) return flags;
  const error = checkShape(command, flags);
  if (error !== null) return { error };
  const branch = flags.positional[0] ?? '';
  const owner = readOwner(branch);
  if ('error' in owner) return owner;
  return {
    command: command as WorktreeArgs['command'],
    branch,
    base: flags.base,
    kill: flags.kill,
    ...owner,
  };
}

/**
 * Why `wt:new` refuses this branch, or null. A subagent branch starts from its parent:
 * the parent must exist, must not be main, and must be the --base. Each refusal names the fix.
 */
export function refuseNewBranch(args: WorktreeArgs, branchExists: (branch: string) => boolean): string | null {
  const { branch, parent, base } = args;
  if (parent === null) return null;
  const task = branch.slice(parent.length + 2);
  if (parent === 'main')
    return `a subagent branch cannot hang off main; create its parent first: npm run wt:new -- <type>/<slug>, then npm run wt:new -- <type>/<slug>--${task} --base <type>/<slug>`;
  if (base !== parent) return `'${branch}' starts from its parent; run: npm run wt:new -- ${branch} --base ${parent}`;
  if (!branchExists(parent))
    return `parent branch '${parent}' does not exist; create it first: npm run wt:new -- ${parent}, then rerun this command`;
  return null;
}
