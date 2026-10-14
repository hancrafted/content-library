// The active-run marker's disk side, internal to the run commands (run-commands.ts): write it, check it names the
// Run, and at the Run's end record the orchestrator's usage and remove it. The shape and liveness rules live in
// marker.pure.ts and episode-run-log.ts.
import { globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runUsageEvent } from './claude-adapter.pure.ts';
import { episodeLogPath, readMarker } from './episode-run-log.ts';
import { MARKER_PATH, type Marker } from './marker.pure.ts';
import { appendEvent, type WriterDeps } from './run-log-writer.ts';
import type { RunLogLine } from './run-log.pure.ts';

/** Where the marker lives and what its end-of-Run step reads from outside. */
export interface MarkerHome {
  root: string;
  slug: string;
  transcriptOf?: (sessionId: string) => string | null;
  writer?: WriterDeps;
}

/** The orchestrator's transcript: Claude Code keeps `<session id>.jsonl` in one folder per project. */
export function transcriptOf(sessionId: string): string | null {
  const [file] = globSync(path.join(os.homedir(), '.claude/projects/*', `${sessionId}.jsonl`));
  return file === undefined ? null : readFileSync(file, 'utf8');
}

/** Points the marker at a Run: this session, the Run's trace, and the span agents with an unparsed description join. */
export function pointMarker(home: MarkerHome, to: { run: RunLogLine; jobSpanId: string; sessionId: string }): void {
  const before = readMarker(home.root);
  const earlier = before !== null && before.trace_id === to.run.trace_id ? (before.session_ids ?? [before.session_id]) : [];
  const sessionIds = earlier.includes(to.sessionId) ? earlier : [...earlier, to.sessionId];
  const marker: Marker = { log: episodeLogPath(home.slug), session_id: to.sessionId, trace_id: to.run.trace_id, job_span_id: to.jobSpanId, session_ids: sessionIds };
  const file = path.join(home.root, MARKER_PATH);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(marker)}\n`);
}

/** The marker of `run`; refuses when none is live for it. */
export function liveMarker(root: string, run: RunLogLine): Marker {
  const marker = readMarker(root);
  if (marker === null || marker.trace_id !== run.trace_id) throw new Error('no live marker for the current Run; run begin-run, or resume after a crash');
  return marker;
}

/** Records the orchestrator's usage on the ended Run, then removes the marker however that went; returns a warning or ''. */
export function endMarker(home: MarkerHome, run: RunLogLine, lines: readonly RunLogLine[]): string {
  try {
    const marker = readMarker(home.root);
    if (marker === null || marker.trace_id !== run.trace_id) return '';
    const read = home.transcriptOf ?? transcriptOf;
    const event = runUsageEvent(lines, marker, (marker.session_ids ?? [marker.session_id]).map(read));
    if (event === null) return '';
    const result = appendEvent({ root: home.root, file: marker.log }, event, home.writer);
    return result.ok ? '' : `run usage not recorded: ${result.errors.join('; ')}`;
  } finally {
    rmSync(path.join(home.root, MARKER_PATH), { force: true });
  }
}
