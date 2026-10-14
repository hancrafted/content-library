// Disk reads shared by the scripts: a file's text or null, and which Runs are live. Each script reads the
// worktree it runs in, so `root` defaults to the working directory.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { liveTraces, MARKER_PATH } from './marker.pure.ts';

/** The file's text, null when it does not exist. */
export const readOrNull = (file: string): string | null => (existsSync(file) ? readFileSync(file, 'utf8') : null);

/** The traces of the Runs live in the worktree at `root`, from its marker. */
export const liveTracesIn = (root = '.'): ReadonlySet<string> => liveTraces(readOrNull(path.join(root, MARKER_PATH)));
