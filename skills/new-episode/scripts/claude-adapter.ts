// SubagentStart / SubagentStop hook (`claude-adapter.ts start|stop`): a plugin over the core writer. It acts only
// when `.scratch/active-run` exists in the worktree and names the hook's session; otherwise it prints nothing and
// exits 0, so a retro or review session never touches a run's log. The mapping lives in claude-adapter.pure.ts;
// the line is written by run-log-writer.ts, which owns the shape, the clock, the lock and the sequence.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { adaptSubagent, subagentFiles, type HookPayload } from './claude-adapter.pure.ts';
import { readOrNull as read, readLog } from './episode-run-log.ts';
import { MARKER_PATH, parseMarker, type Marker } from './marker.pure.ts';
import { appendEvent } from './run-log-writer.ts';

/** The marker when this hook call belongs to the run it names, else null. */
function activeMarker(root: string, payload: HookPayload): Marker | null {
  const marker = parseMarker(read(path.join(root, MARKER_PATH)));
  return marker !== null && marker.session_id === payload.session_id ? marker : null;
}

function main(): void {
  const event = process.argv[2] === 'stop' ? 'stop' : 'start';
  const payload = JSON.parse(readFileSync(0, 'utf8')) as HookPayload;
  const root = process.env.CLAUDE_PROJECT_DIR ?? payload.cwd ?? process.cwd();
  const marker = activeMarker(root, payload);
  if (marker === null) return;
  const files = subagentFiles(payload);
  const log = readLog(marker.log, root).lines;
  const line = adaptSubagent({
    event,
    payload,
    marker: read(path.join(root, MARKER_PATH)),
    meta: read(files.meta),
    transcript: read(files.transcript),
    log,
  });
  if (line === null) return;
  appendEvent({ root, file: marker.log }, line);
}

try {
  main();
} catch {
  // A hook must never fail the session or the run: a line that could not be written (or refused) is simply missing.
}
