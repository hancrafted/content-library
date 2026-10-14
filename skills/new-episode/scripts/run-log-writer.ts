// The Episode run-log writer: the one place that stamps and appends a line. Given a log location and an event it
// takes a lock, reads the log, stamps the line (clock, seq = max + 1, the trace of the current Run, a fresh span id;
// for start-run also a new trace, run id, branch and template sha) and appends it, so concurrent writers never
// interleave. Returns the written line or the errors; it never throws for a bad event. Clock, ids and git are injectable.
// A lock its holder never released (a crashed writer) is broken after ten seconds. Shapes live in run-log.pure.ts.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { appendFileSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readLog } from './episode-run-log.ts';
import { record, type LogEvent, type RunLogLine } from './run-log.pure.ts';

/** What the writer reads from outside; each defaults to the real thing. */
export interface WriterDeps {
  /** The current time as an ISO string without milliseconds. */
  now?: () => string;
  /** `n` random bytes as hex. */
  id?: (bytes: number) => string;
  /** The trimmed stdout of `git <args>`. */
  git?: (...args: string[]) => string;
}

export type WriteResult = { ok: true; line: string } | { ok: false; errors: string[] };

const STALE_LOCK_MS = 10_000;
const LOCK_WAIT_MS = 15_000;

const sleep = (ms: number): unknown => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** Creates the lock file exclusively, holding our owner token; false when another writer holds it. */
function tryLock(lockFile: string, token: string): boolean {
  try {
    writeFileSync(lockFile, token, { flag: 'wx' });
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false;
    throw error;
  }
}

/** Removes a lock its holder never released. */
function breakStaleLock(lockFile: string): void {
  try {
    if (Date.now() - statSync(lockFile).mtimeMs > STALE_LOCK_MS) unlinkSync(lockFile);
  } catch {
    // the holder released it between our checks
  }
}

/** Deletes the lock only while it still holds our token: a stale-broken lock now belongs to another writer. */
function release(lockFile: string, token: string): void {
  try {
    if (readFileSync(lockFile, 'utf8') === token) unlinkSync(lockFile);
  } catch {
    // already gone
  }
}

/** Runs `work` while holding the lock, and releases it however `work` ends. */
function withLock<T>(lockFile: string, work: () => T): T {
  const deadline = Date.now() + LOCK_WAIT_MS;
  const token = randomBytes(16).toString('hex');
  while (!tryLock(lockFile, token)) {
    if (Date.now() > deadline) throw new Error(`could not take ${lockFile}`);
    breakStaleLock(lockFile);
    sleep(20);
  }
  try {
    return work();
  } finally {
    release(lockFile, token);
  }
}

const realGit = (...args: string[]): string => execFileSync('git', args, { encoding: 'utf8' }).trim();

/** Any JSON object; `record` validates its fields, so this only narrows enough to read `kind`. */
const isEvent = (event: unknown): event is LogEvent =>
  typeof event === 'object' && event !== null && !Array.isArray(event);

/** Where the log lives: `file` is relative to the worktree `root`. */
export interface LogLocation {
  root: string;
  file: string;
}

/** The event with what only git and the clock know filled in for a start-run. */
function withRunFacts(event: LogEvent, t: string, git: (...args: string[]) => string): LogEvent {
  return {
    ...event,
    run_id: event.run_id ?? t.replace(/:/g, '-'),
    branch: event.branch ?? git('rev-parse', '--abbrev-ref', 'HEAD'),
    template_sha: event.template_sha ?? git('merge-base', 'HEAD', 'main'),
  };
}

/** What the line about to be written is stamped with: the injected clock, ids and git, resolved. */
type ResolvedDeps = Required<WriterDeps>;

/** The trace a new line joins: a fresh one for a start-run, else the newest Run's; a message when there is no Run. */
function traceFor(event: unknown, current: RunLogLine | null, src: ResolvedDeps): string | { error: string } {
  if (isEvent(event) && event.kind === 'start-run') return src.id(16);
  return current === null ? { error: 'the log has no start-run line; log kind "start-run" first' } : current.trace_id;
}

/** Stamps and appends under the lock already held. */
function appendLocked(at: LogLocation, event: unknown, src: ResolvedDeps): WriteResult {
  const full = path.resolve(at.root, at.file);
  const { lines, errors, current } = readLog(at.file, at.root);
  const t = src.now();
  const traceId = traceFor(event, current, src);
  if (errors.length > 0) return { ok: false, errors };
  if (typeof traceId !== 'string') return { ok: false, errors: [`${full}: ${traceId.error}`] };
  const seq = lines.reduce((max, l) => Math.max(max, l.seq), 0) + 1;
  const starting = isEvent(event) && event.kind === 'start-run';
  const result = record(starting ? withRunFacts(event, t, src.git) : event, { t, seq, traceId, spanId: src.id(8) });
  if (!result.ok) return { ok: false, errors: result.errors };
  const line = JSON.stringify(result.line);
  appendFileSync(full, `${line}\n`);
  return { ok: true, line };
}

/**
 * Appends `event` to the log at `at` and returns the written line. The log's folder must exist. A non-start event
 * joins the newest Run; with no Run it is refused. Throws only on I/O or git failure.
 */
export function appendEvent(at: LogLocation, event: unknown, deps: WriterDeps = {}): WriteResult {
  const src: ResolvedDeps = {
    now: deps.now ?? (() => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')),
    id: deps.id ?? ((bytes) => randomBytes(bytes).toString('hex')),
    git: deps.git ?? realGit,
  };
  return withLock(`${path.resolve(at.root, at.file)}.lock`, () => appendLocked(at, event, src));
}
