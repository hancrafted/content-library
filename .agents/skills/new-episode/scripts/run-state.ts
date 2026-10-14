// `npm run episode:run-state -- set <slug> [job-span-id]` writes `.scratch/active-run` for this session (id from
// CLAUDE_CODE_SESSION_ID, or SESSION_ID); `clear` ends the marker, first recording the orchestrator session's model and
// usage on the Run span when its transcript is found; `archive <slug>` copies the Episode's log to
// `.logs/new-episode/<slug>/<run id>.jsonl`. The shapes live in run-state.pure.ts; this file only touches the disk.
import { copyFileSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runUsageEvent } from './claude-adapter.pure.ts';
import { MARKER_PATH } from './marker.pure.ts';
import { readEpisodeLog, readLog, readMarker } from './episode-run-log.ts';
import { appendEvent } from './run-log-writer.ts';
import type { RunLogLine } from './run-log.pure.ts';
import { archiveTarget, markerText } from './run-state.pure.ts';

const [command, slug, jobSpanId] = process.argv.slice(2);

function archive(log: string, lines: RunLogLine[]): void {
  const target = archiveTarget(slug as string, lines);
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(log, target);
  console.log(target);
}

function set(log: string, lines: RunLogLine[]): void {
  const sessionId = process.env.CLAUDE_CODE_SESSION_ID ?? process.env.SESSION_ID;
  if (!sessionId) throw new Error('no session id: set SESSION_ID, or run inside Claude Code (CLAUDE_CODE_SESSION_ID)');
  const text = markerText({ log, sessionId, lines, jobSpanId });
  mkdirSync(path.dirname(MARKER_PATH), { recursive: true });
  writeFileSync(MARKER_PATH, text);
  console.log(`wrote ${MARKER_PATH}`);
}

/** The orchestrator's transcript: Claude Code keeps `<session id>.jsonl` in one folder per project. */
const transcriptOf = (sessionId: string): string | null => {
  const [file] = globSync(path.join(os.homedir(), '.claude/projects/*', `${sessionId}.jsonl`));
  return file === undefined ? null : readFileSync(file, 'utf8');
};

/** Adds the orchestrator's usage to the ended Run through the core writer; silent when there is nothing to add. */
function recordRunUsage(): void {
  const marker = readMarker();
  if (marker === null) return;
  const lines = readLog(marker.log).lines;
  const event = runUsageEvent(lines, marker, transcriptOf(marker.session_id));
  if (event === null) return;
  const result = appendEvent({ root: '.', file: marker.log }, event);
  if (!result.ok) console.error(`⚠ run usage not recorded: ${result.errors.join('; ')}`);
}

function clear(): void {
  try {
    recordRunUsage();
  } finally {
    rmSync(MARKER_PATH, { force: true });
  }
}

function main(): void {
  if (command === 'clear') return clear();
  if (!slug || (command !== 'set' && command !== 'archive')) throw new Error('usage: npm run episode:run-state -- set <slug> [job-span-id] | clear | archive <slug>');
  const { file, lines } = readEpisodeLog(slug);
  (command === 'archive' ? archive : set)(file, lines);
}

try {
  main();
} catch (error) {
  console.error(`✖ ${(error as Error).message}`);
  process.exitCode = 1;
}
