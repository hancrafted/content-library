import { spawnSync } from 'node:child_process';

/** Runs `git <args>` in `cwd`, with `input` on stdin; a large buffer, since `ls-files` output can be long. */
export const git = (cwd: string, args: readonly string[], input?: string) =>
  spawnSync('git', args, { cwd, encoding: 'utf8', input, maxBuffer: 256 * 1024 * 1024 });
