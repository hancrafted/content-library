// `npm run episode:run-state -- set <slug> [job-span-id]` writes `.scratch/active-run` for this session (id from
// CLAUDE_CODE_SESSION_ID, or SESSION_ID); `clear` ends the marker, first recording the orchestrator session's model and
// usage on the Run span when its transcript is found; `archive <slug>` copies the Episode's log to
// `.logs/new-episode/<slug>/<run id>.jsonl`. The shapes live in run-state.pure.ts; this file only touches the disk.
import { execFileSync } from 'node:child_process';
import { copyFileSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runUsageEvent } from './claude-adapter.pure.ts';
import { MARKER_PATH, parseMarker } from './marker.pure.ts';
import { readOrNull } from './run-files.ts';
import { parseLog, type RunLogLine } from './run-log.pure.ts';
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
  const marker = parseMarker(readOrNull(MARKER_PATH));
  if (marker === null) return;
  const lines = parseLog(readOrNull(marker.log) ?? '').lines;
  const event = runUsageEvent(lines, marker, transcriptOf(marker.session_id));
  if (event === null) return;
  const writer = path.join(import.meta.dirname, 'log.ts');
  execFileSync('node', [writer, path.basename(path.dirname(marker.log)), JSON.stringify(event)], { stdio: 'ignore' });
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
  if (!slug || (command !== 'set' && command !== 'archive'))
    throw new Error('usage: npm run episode:run-state -- set <slug> [job-span-id] | clear | archive <slug>');
  const log = path.join('docs/episodes', slug, 'events.jsonl');
  const lines = parseLog(readFileSync(log, 'utf8')).lines;
  (command === 'archive' ? archive : set)(log, lines);
}

try {
  main();
} catch (error) {
  console.error(`✖ ${(error as Error).message}`);
  process.exitCode = 1;
}
