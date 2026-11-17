import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { appendFileSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readLog } from './episode-run-log.ts';
import { record, type LogEvent, type RunLogLine } from './run-log.pure.ts';

export interface WriterDeps {
  now?: () => string;
  id?: (bytes: number) => string;
  git?: (...args: string[]) => string;
  lockWaitMilliseconds?: number;
}

export type WriteResult = { ok: true; line: string } | { ok: false; errors: string[] };

const STALE_LOCK_MILLISECONDS = 10_000;
const LOCK_WAIT_MILLISECONDS = 15_000;

export class LockTimeoutError extends Error {
  readonly lockFile: string;
  constructor(lockFile: string) {
    super(
      `run-log lock ${lockFile} still held after waiting; a line was not written (end-attempt or end-run crashed recovers the span)`,
    );
    this.lockFile = lockFile;
  }
}

const lockWait = (wanted?: number): number =>
  Number(process.env.RUN_LOG_LOCK_WAIT_MS) || wanted || LOCK_WAIT_MILLISECONDS;

const sleep = (ms: number): unknown => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function tryLock(lockFile: string, token: string): boolean {
  try {
    writeFileSync(lockFile, token, { flag: 'wx' });
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false;
    throw error;
  }
}

function breakStaleLock(lockFile: string): void {
  try {
    if (Date.now() - statSync(lockFile).mtimeMs > STALE_LOCK_MILLISECONDS) unlinkSync(lockFile);
  } catch (holderReleasedItBetweenOurChecks) {
    if ((holderReleasedItBetweenOurChecks as NodeJS.ErrnoException).code !== 'ENOENT')
      throw holderReleasedItBetweenOurChecks;
  }
}

function release(lockFile: string, token: string): void {
  try {
    if (readFileSync(lockFile, 'utf8') === token) unlinkSync(lockFile);
  } catch (lockAlreadyGone) {
    if ((lockAlreadyGone as NodeJS.ErrnoException).code !== 'ENOENT') throw lockAlreadyGone;
  }
}

function withLock<T>(lock: { file: string; waitMilliseconds?: number }, work: () => T): T {
  const lockFile = lock.file;
  const deadline = Date.now() + lockWait(lock.waitMilliseconds);
  const token = randomBytes(16).toString('hex');
  while (!tryLock(lockFile, token)) {
    if (Date.now() > deadline) throw new LockTimeoutError(lockFile);
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

const isEvent = (event: unknown): event is LogEvent =>
  typeof event === 'object' && event !== null && !Array.isArray(event);

export interface LogLocation {
  root: string;
  file: string;
}

function withRunFacts(
  event: Extract<LogEvent, { kind: 'start-run' }>,
  t: string,
  git: (...args: string[]) => string,
): LogEvent {
  return {
    ...event,
    run_id: event.run_id ?? t.replace(/:/g, '-'),
    branch: event.branch ?? git('rev-parse', '--abbrev-ref', 'HEAD'),
    template_sha: event.template_sha ?? git('merge-base', 'HEAD', 'main'),
  };
}

type ResolvedDeps = Required<Omit<WriterDeps, 'lockWaitMilliseconds'>>;

function traceFor(event: unknown, current: RunLogLine | null, src: ResolvedDeps): string | { error: string } {
  if (isEvent(event) && event.kind === 'start-run') return src.id(16);
  return current === null ? { error: 'the log has no start-run line; log kind "start-run" first' } : current.trace_id;
}

function unknownTarget(line: RunLogLine, lines: readonly RunLogLine[]): string | null {
  if (!['end', 'end-run', 'attrs', 'score', 'event'].includes(line.kind)) return null;
  const known = lines.some((l) => (l.kind === 'start' || l.kind === 'start-run') && l.span_id === line.span_id);
  return known ? null : `${line.kind} targets span_id ${String(line.span_id)}, which no start line opened`;
}

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
  const unknown = unknownTarget(result.line, lines);
  if (unknown !== null) return { ok: false, errors: [`${full}: ${unknown}`] };
  const line = JSON.stringify(result.line);
  appendFileSync(full, `${line}\n`);
  return { ok: true, line };
}

export function appendEvent(at: LogLocation, event: unknown, deps: WriterDeps = {}): WriteResult {
  const src: ResolvedDeps = {
    now: deps.now ?? (() => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')),
    id: deps.id ?? ((bytes) => randomBytes(bytes).toString('hex')),
    git: deps.git ?? realGit,
  };
  const lock = { file: `${path.resolve(at.root, at.file)}.lock`, waitMilliseconds: deps.lockWaitMilliseconds };
  return withLock(lock, () => appendLocked(at, event, src));
}
