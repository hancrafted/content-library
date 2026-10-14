// The worktree script's arguments: `<new|done> <branch> [--base <branch>]`.
// Without --base a worktree branches from origin/main and finishing it syncs
// local main; with it, both work against that branch instead.

export interface WorktreeArgs {
  command: 'new' | 'done';
  branch: string;
  /** The branch to start from and merge into, or null for origin/main. */
  base: string | null;
}

const USAGE = 'usage: npm run wt:new -- <branch> [--base <branch>]  |  npm run wt:done -- <branch> [--base <branch>]';

/** A branch name, not a missing argument or a flag in its place. */
function isBranch(value: string | undefined): value is string {
  return value !== undefined && value !== '' && !value.startsWith('--');
}

const COMMANDS: readonly string[] = ['new', 'done'];

export function parseArgs(argv: readonly string[]): WorktreeArgs | { error: string } {
  const [command, branch, flag, base, ...rest] = argv;
  if (!isBranch(branch) || rest.length > 0) return { error: USAGE };
  if (!COMMANDS.includes(command)) return { error: `unknown command '${command}'; expected new or done` };
  const parsed = { command: command as WorktreeArgs['command'], branch };
  if (flag === undefined) return { ...parsed, base: null };
  return flag === '--base' && isBranch(base) ? { ...parsed, base } : { error: '--base needs a branch name' };
}
