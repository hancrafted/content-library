// The drive scripts' one way to run a command: `run` never throws, so each caller reads `status` and decides;
// `capture` and `stream` are its two throwing shapes.
import { spawnSync } from 'node:child_process';

interface RunOptions {
  cwd?: string;
  /** Text for stdin. */
  input?: string;
}

/** Runs `cmd args`; a large buffer, since `ls-files` output can be long. */
export const run = (cmd: string, args: readonly string[], { cwd, input }: RunOptions = {}) =>
  spawnSync(cmd, args, { cwd, encoding: 'utf8', input, maxBuffer: 256 * 1024 * 1024 });

/** Runs `git <args>` in `cwd`, with `input` on stdin. */
export const git = (cwd: string, args: readonly string[], input?: string) => run('git', args, { cwd, input });

/** Runs a command and returns its trimmed output; throws, with its stderr, when it fails. */
export function capture(cmd: string, args: readonly string[], cwd?: string): string {
  const result = run(cmd, args, { cwd });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed:\n${result.stderr}`);
  return result.stdout.trim();
}

/** Runs a command with its output streamed to the terminal; throws when it fails. */
export function stream(cmd: string, args: readonly string[], cwd?: string): void {
  const { status } = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed (${status})`);
}
