// `npm run episode:log -- <slug> '<event json>'` (or the JSON on stdin): validates one event, stamps it (clock,
// sequence, ids, and for start-run the template sha, branch and run id) and appends one line to the Episode's
// events.jsonl under a lock, so concurrent writers never interleave. Prints the written line; a start's
// `span_id` in it is what the caller passes as `parent_span_id` or `span_id` later. The shape lives in
// run-log.pure.ts; this file only reads the clock, git and the disk.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { episodeLogPath, readLog } from './episode-run-log.ts';
import { withLock } from './run-log-lock.ts';
import { record, type LogEvent, type RunLogLine, type Stamp } from './run-log.pure.ts';

const git = (...args: string[]): string => execFileSync('git', args, { encoding: 'utf8' }).trim();

/** The event with what only git and the clock know filled in for a start-run. */
function withRunFacts(fields: LogEvent, now: string): LogEvent {
  return {
    ...fields,
    run_id: fields.run_id ?? now.replace(/:/g, '-'),
    branch: fields.branch ?? git('rev-parse', '--abbrev-ref', 'HEAD'),
    template_sha: fields.template_sha ?? git('merge-base', 'HEAD', 'main'),
  };
}


/** The trace id of the current Run, which every later line of that Run carries. */
function traceOf(current: RunLogLine | null, file: string): string {
  if (current === null) throw new Error(`${file} has no start-run line; log kind "start-run" first`);
  return current.trace_id;
}

/** The clock, the next sequence number and a fresh span id for the line about to be written. */
function stampFor(lines: readonly RunLogLine[], traceId: string, now: string): Stamp {
  return { t: now, seq: lines.reduce((max, l) => Math.max(max, l.seq), 0) + 1, traceId, spanId: randomBytes(8).toString('hex') };
}

/** Any JSON object; `record` validates its fields, so this only narrows enough to read `kind`. */
const isEvent = (event: unknown): event is LogEvent => typeof event === 'object' && event !== null && !Array.isArray(event);

function append(file: string, event: unknown): string {
  const { lines, errors, current } = readLog(file);
  if (errors.length > 0) throw new Error(errors.join('; '));
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const starting = isEvent(event) && event.kind === 'start-run';
  const traceId = starting ? randomBytes(16).toString('hex') : traceOf(current, file);
  const result = record(starting ? withRunFacts(event, now) : event, stampFor(lines, traceId, now));
  if (!result.ok) throw new Error(result.errors.map((e) => `  ${e}`).join('\n'));
  const text = JSON.stringify(result.line);
  appendFileSync(file, `${text}\n`);
  return text;
}

function main(): void {
  const slug = process.argv[2];
  if (!slug) throw new Error("usage: npm run episode:log -- <slug> '<event json>'   (or the JSON on stdin)");
  const file = episodeLogPath(slug);
  const folder = path.dirname(file);
  if (!existsSync(folder)) throw new Error(`${folder} does not exist; run this from the Episode's worktree root.`);
  const event: unknown = JSON.parse(process.argv[3] ?? readFileSync(0, 'utf8'));
  console.log(withLock(`${file}.lock`, () => append(file, event)));
}

try {
  main();
} catch (error) {
  console.error(`✖ ${error instanceof SyntaxError ? 'the event is not valid JSON' : (error as Error).message}`);
  process.exitCode = 1;
}
