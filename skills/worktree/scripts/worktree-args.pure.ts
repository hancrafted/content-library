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
  return {
    command: command as WorktreeArgs['command'],
    branch: flags.positional[0] ?? '',
    base: flags.base,
    kill: flags.kill,
  };
}
