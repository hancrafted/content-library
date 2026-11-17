import { spawnSync } from 'node:child_process';

const LS_FILES_OUTPUT_CAN_BE_LONG_BYTES = 256 * 1024 * 1024;

export const git = (cwd: string, args: readonly string[], input?: string) =>
  spawnSync('git', args, { cwd, encoding: 'utf8', input, maxBuffer: LS_FILES_OUTPUT_CAN_BE_LONG_BYTES });
