import { globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runUsageEvent } from './claude-adapter.pure.ts';
import { episodeLogPath, readMarker } from './episode-run-log.ts';
import { MARKER_PATH, sessionsOf, type Marker } from './marker.pure.ts';
import { appendEvent, type WriterDeps } from './run-log-writer.ts';
import type { RunLogLine } from './run-log.pure.ts';
import { jobFactsEvent } from './usage-window.pure.ts';

export interface MarkerHome {
  root: string;
  slug: string;
  transcriptOf?: (sessionId: string) => string | null;
  writer?: WriterDeps;
}

export function transcriptOf(sessionId: string): string | null {
  const [file] = globSync(path.join(os.homedir(), '.claude/projects/*', `${sessionId}.jsonl`));
  return file === undefined ? null : readFileSync(file, 'utf8');
}

export function pointMarker(home: MarkerHome, to: { run: RunLogLine; jobSpanId: string; sessionId: string }): void {
  const before = readMarker(home.root);
  const earlier = before !== null && before.trace_id === to.run.trace_id ? sessionsOf(before) : [];
  const sessionIds = earlier.includes(to.sessionId) ? earlier : [...earlier, to.sessionId];
  const marker: Marker = {
    log: episodeLogPath(home.slug),
    session_id: to.sessionId,
    trace_id: to.run.trace_id,
    job_span_id: to.jobSpanId,
    session_ids: sessionIds,
  };
  const file = path.join(home.root, MARKER_PATH);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(marker)}\n`);
}

export function liveMarker(root: string, run: RunLogLine): Marker {
  const marker = readMarker(root);
  if (marker === null || marker.trace_id !== run.trace_id)
    throw new Error('no live marker for the current Run; run begin-run, or resume after a crash');
  return marker;
}

export function endMarker(home: MarkerHome, run: RunLogLine, lines: readonly RunLogLine[]): string {
  try {
    const marker = readMarker(home.root);
    if (marker === null || marker.trace_id !== run.trace_id) return '';
    const read = home.transcriptOf ?? transcriptOf;
    const event = runUsageEvent(lines, marker, sessionsOf(marker).map(read));
    if (event === null) return '';
    const result = appendEvent({ root: home.root, file: marker.log }, event, home.writer);
    return result.ok ? '' : `run usage not recorded: ${result.errors.join('; ')}`;
  } finally {
    rmSync(path.join(home.root, MARKER_PATH), { force: true });
  }
}

export function recordJobUsage(
  home: MarkerHome,
  span: { span_id: string; start_t: string },
  ended: RunLogLine,
): string {
  const marker = readMarker(home.root);
  if (marker === null) return '';
  const read = home.transcriptOf ?? transcriptOf;
  const event = jobFactsEvent(span, ended, sessionsOf(marker).map(read));
  if (event === null) return '';
  const result = appendEvent({ root: home.root, file: marker.log }, event, home.writer);
  return result.ok ? '' : `job facts not recorded: ${result.errors.join('; ')}`;
}
