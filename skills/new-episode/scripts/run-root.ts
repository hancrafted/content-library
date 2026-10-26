// Which worktree a hook call belongs to: the one whose `.scratch/active-run` lists the call's session. The harness's
// project dir is not that worktree when the run lives in a worktree and the session started elsewhere.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { readOrNull } from '../../../src/pipeline/lib/episode-run-log.ts';
import {
  MARKER_PATH,
  parseMarker,
  sessionsOf,
  worktreePaths,
  type Marker,
} from '../../../src/pipeline/lib/marker.pure.ts';

export interface FoundRun {
  root: string;
  marker: Marker;
  /** The marker file's text. */
  text: string;
}

function worktreesFrom(dir: string): string[] {
  try {
    const out = execFileSync('git', ['worktree', 'list', '--porcelain'], {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return worktreePaths(out);
  } catch {
    return [dir];
  }
}

/** The worktree (scanned from `from`) whose marker lists `sessionId`, null when none does. */
export function findRun(from: string, sessionId: string): FoundRun | null {
  for (const root of worktreesFrom(from)) {
    const text = readOrNull(path.join(root, MARKER_PATH));
    const marker = parseMarker(text);
    if (text !== null && marker !== null && sessionsOf(marker).includes(sessionId)) return { root, marker, text };
  }
  return null;
}
