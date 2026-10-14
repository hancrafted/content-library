// `npm run episode:run-state -- set <slug> [job-span-id]` writes `.scratch/active-run` for this session (id from
// CLAUDE_CODE_SESSION_ID, or SESSION_ID); `clear` removes it; `archive <slug>` copies the Episode's log to
// `.logs/new-episode/<slug>/<run id>.jsonl`. The shapes live in run-state.pure.ts; this file only touches the disk.
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseLog } from './run-log.pure.ts';
import { archiveTarget, markerText } from './run-state.pure.ts';

const MARKER = '.scratch/active-run';
const [command, slug, jobSpanId] = process.argv.slice(2);

function archive(log: string, lines: ReturnType<typeof parseLog>['lines']): void {
  const target = archiveTarget(slug as string, lines);
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(log, target);
  console.log(target);
}

function set(log: string, lines: ReturnType<typeof parseLog>['lines']): void {
  const sessionId = process.env.CLAUDE_CODE_SESSION_ID ?? process.env.SESSION_ID;
  if (!sessionId) throw new Error('no session id: set SESSION_ID, or run inside Claude Code (CLAUDE_CODE_SESSION_ID)');
  mkdirSync(path.dirname(MARKER), { recursive: true });
  writeFileSync(MARKER, markerText({ log, sessionId, lines, jobSpanId }));
  console.log(`wrote ${MARKER}`);
}

function main(): void {
  if (command === 'clear') return rmSync(MARKER, { force: true });
  if (!slug || (command !== 'set' && command !== 'archive')) throw new Error('usage: npm run episode:run-state -- set <slug> [job-span-id] | clear | archive <slug>');
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
