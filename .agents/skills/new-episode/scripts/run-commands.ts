// The run-scoped commands: how the orchestrator drives an Episode's Run by names (a job id, an attempt number, a gate
// name) and never by span id. Each command writes its line through the run-log writer, resolves parents and targets
// from the log itself, and keeps the active-run marker (`.scratch/active-run`) in step, so the marker is an internal
// detail of this module. begin-run opens the Run and the marker; begin-job and begin-attempt nest under it (an
// Attempt's number and `retry_of` are derived, and the spawn description is printed); end-run records the
// orchestrator's usage and clears the marker in one step. Real disk; the clock, ids, git and the transcript lookup
// are injectable. Shapes live in run-log.pure.ts; `run.ts` is the argv wrapper.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { episodeLogPath, readEpisodeLog, readMarker } from './episode-run-log.ts';
import { endMarker, liveMarker, pointMarker } from './run-marker.ts';
import { appendEvent, type WriterDeps } from './run-log-writer.ts';
import type { LogEvent, RunLogLine, Span } from './run-log.pure.ts';

/** What a command reads from outside; each defaults to the real thing. */
export interface RunContext {
  /** The Episode's worktree root. */
  root: string;
  slug: string;
  /** The orchestrator's session id (CLAUDE_CODE_SESSION_ID, else SESSION_ID); begin-run and resume need it. */
  sessionId?: string;
  /** The orchestrator's transcript text, null when it is not found. */
  transcriptOf?: (sessionId: string) => string | null;
  writer?: WriterDeps;
}

export type CommandResult = { ok: true; output: string } | { ok: false; error: string };

export const USAGE = `usage: npm run episode:run -- <slug> <command> ...
  begin-run --model <model> [--harness <h>]        open the Run and the marker
  end-run [status] [summary]                       close the Run, record orchestrator usage, clear the marker
  begin-job <job>                                  open the Job (reused when already open) and point agents at it
  end-job <job> [status] [summary]                 close the Job
  begin-attempt <job>                              open the next Attempt; prints its spawn description
  end-attempt <job> [status] [summary]             close the open Attempt
  open-gate <job> <name>                           open a Gate under the Run
  close-gate <name> [status] [summary]             close the open Gate
  score <target> <name> <value> [--source s] [--rubric r] [--body b] [--via chat|commit] [--comment c]
                                                   target: <job> (Job), <job>#<n> (Attempt) or gate:<name>
  resume                                           re-open the marker for the current Run in a new session
  archive                                          copy the log to .logs/new-episode/<slug>/<run id>.jsonl
status is ok (default), error, refused or reused.`;

const fail = (error: string): CommandResult => ({ ok: false, error });
const done = (output: string): CommandResult => ({ ok: true, output });

/** The Run a command acts on and the spans of it, read fresh from the log. */
interface View {
  run: RunLogLine;
  spans: Span[];
}

const OPTIONS = {
  model: { type: 'string' },
  harness: { type: 'string' },
  summary: { type: 'string' },
  source: { type: 'string' },
  rubric: { type: 'string' },
  body: { type: 'string' },
  via: { type: 'string' },
  comment: { type: 'string' },
} as const;

type Opts = Partial<Record<keyof typeof OPTIONS, string>>;

class Refusal extends Error {}
const refuse = (message: string): never => {
  throw new Refusal(message);
};

function viewOf(ctx: RunContext): View {
  const log = readEpisodeLog(ctx.slug, ctx.root);
  if (log.errors.length > 0) refuse(log.errors.join('\n'));
  if (log.current === null) return refuse('the log has no Run; run begin-run first');
  const trace = log.current.trace_id;
  return { run: log.current, spans: log.folded.spans.filter((s) => s.trace_id === trace) };
}

const latest = (spans: readonly Span[], match: (s: Span) => boolean): Span | undefined => spans.filter(match).sort((a, b) => b.seq - a.seq)[0];
const isOpen = (s: Span): boolean => s.end_t === null;

/** Writes one event and returns the span id of the written line. */
function write(ctx: RunContext, event: LogEvent): RunLogLine {
  const result = appendEvent({ root: ctx.root, file: episodeLogPath(ctx.slug) }, event, ctx.writer);
  if (!result.ok) return refuse(result.errors.join('\n'));
  return JSON.parse(result.line) as RunLogLine;
}

function sessionOf(ctx: RunContext): string {
  return ctx.sessionId ?? refuse('no session id: set SESSION_ID, or run inside Claude Code (CLAUDE_CODE_SESSION_ID)');
}

function statusOf(positional: readonly string[], at: number): { status: 'ok' | 'error' | 'refused' | 'reused' } {
  const status = positional[at] ?? 'ok';
  if (status !== 'ok' && status !== 'error' && status !== 'refused' && status !== 'reused') return refuse(`status must be ok, error, refused or reused, not "${status}"`);
  return { status };
}

const need = (positional: readonly string[], at: number, what: string): string => positional[at] ?? refuse(`missing <${what}>\n${USAGE}`);

function beginRun(ctx: RunContext, opts: Opts): string {
  const sessionId = sessionOf(ctx);
  const model = opts.model ?? refuse('begin-run needs --model <the model you run on>');
  const line = write(ctx, { kind: 'start-run', harness: opts.harness ?? 'claude-code', 'gen_ai.request.model': model });
  pointMarker(ctx, { run: line, jobSpanId: line.span_id as string, sessionId });
  return `Run begun (${line.run_id})`;
}

function endRun(ctx: RunContext, positional: readonly string[], opts: Opts): string {
  const { run } = viewOf(ctx);
  write(ctx, { kind: 'end-run', span_id: run.span_id, ...statusOf(positional, 0), summary: opts.summary ?? positional[1] });
  const warning = endMarker(ctx, run, readEpisodeLog(ctx.slug, ctx.root).lines);
  return warning === '' ? 'Run ended' : `Run ended (${warning})`;
}

function beginJob(ctx: RunContext, positional: readonly string[]): string {
  const job = need(positional, 0, 'job');
  const { run, spans } = viewOf(ctx);
  const marker = liveMarker(ctx.root, run);
  const open = latest(spans, (s) => s.type === 'job' && s.job === job && isOpen(s));
  const spanId = open?.span_id ?? (write(ctx, { kind: 'start', type: 'job', name: job, job, parent_span_id: run.span_id }).span_id as string);
  pointMarker(ctx, { run, jobSpanId: spanId, sessionId: marker.session_id });
  return open === undefined ? `Job ${job} begun` : `Job ${job} already open; agents now join it`;
}

function endJob(ctx: RunContext, positional: readonly string[], opts: Opts): string {
  const job = need(positional, 0, 'job');
  const { run, spans } = viewOf(ctx);
  const open = latest(spans, (s) => s.type === 'job' && s.job === job && isOpen(s)) ?? refuse(`no open Job ${job}`);
  write(ctx, { kind: 'end', span_id: open.span_id, ...statusOf(positional, 1), summary: opts.summary ?? positional[2] });
  const marker = readMarker(ctx.root);
  if (marker !== null && marker.job_span_id === open.span_id) pointMarker(ctx, { run, jobSpanId: run.span_id as string, sessionId: marker.session_id });
  return `Job ${job} ended`;
}

function beginAttempt(ctx: RunContext, positional: readonly string[]): string {
  const job = need(positional, 0, 'job');
  const { spans } = viewOf(ctx);
  const jobSpan = latest(spans, (s) => s.type === 'job' && s.job === job && isOpen(s)) ?? refuse(`no open Job ${job}; run begin-job ${job} first`);
  const attempts = spans.filter((s) => s.type === 'attempt' && s.job === job);
  if (attempts.some(isOpen)) refuse(`${job} has an open Attempt; run end-attempt ${job} first`);
  const previous = latest(attempts, () => true);
  const n = attempts.reduce((max, s) => Math.max(max, s.attempt ?? 0), 0) + 1;
  write(ctx, { kind: 'start', type: 'attempt', name: `${job}#${n}`, job, attempt: n, parent_span_id: jobSpan.span_id, retry_of: previous?.span_id });
  return `Attempt ${job}#${n} begun; spawn each agent with description ${job}#${n}/<role>[/#<ticket>]`;
}

function endAttempt(ctx: RunContext, positional: readonly string[], opts: Opts): string {
  const job = need(positional, 0, 'job');
  const { spans } = viewOf(ctx);
  const open = latest(spans, (s) => s.type === 'attempt' && s.job === job && isOpen(s)) ?? refuse(`no open Attempt of ${job}`);
  write(ctx, { kind: 'end', span_id: open.span_id, ...statusOf(positional, 1), summary: opts.summary ?? positional[2] });
  return `Attempt ${open.name} ended`;
}

function openGate(ctx: RunContext, positional: readonly string[]): string {
  const job = need(positional, 0, 'job');
  const name = need(positional, 1, 'name');
  const { run, spans } = viewOf(ctx);
  if (latest(spans, (s) => s.type === 'gate' && s.name === name && isOpen(s)) !== undefined) refuse(`Gate "${name}" is already open`);
  write(ctx, { kind: 'start', type: 'gate', name, job, parent_span_id: run.span_id });
  return `Gate "${name}" opened`;
}

function closeGate(ctx: RunContext, positional: readonly string[], opts: Opts): string {
  const name = need(positional, 0, 'name');
  const { spans } = viewOf(ctx);
  const open = latest(spans, (s) => s.type === 'gate' && s.name === name && isOpen(s)) ?? refuse(`no open Gate "${name}"`);
  write(ctx, { kind: 'end', span_id: open.span_id, ...statusOf(positional, 1), summary: opts.summary ?? positional[2] });
  return `Gate "${name}" closed`;
}

/** The span a Score names: a Job by its id, an Attempt as `<job>#<n>`, a Gate as `gate:<name>`; the latest, ended or not. */
function scoreTarget(spans: readonly Span[], target: string): Span {
  const gate = /^gate:(.+)$/.exec(target);
  const attempt = /^(.+)#([1-9]\d*)$/.exec(target);
  const found = gate
    ? latest(spans, (s) => s.type === 'gate' && s.name === gate[1])
    : attempt
      ? latest(spans, (s) => s.type === 'attempt' && s.job === attempt[1] && s.attempt === Number(attempt[2]))
      : latest(spans, (s) => s.type === 'job' && s.job === target);
  return found ?? refuse(`no span named "${target}" in the current Run`);
}

function score(ctx: RunContext, positional: readonly string[], opts: Opts): string {
  const target = need(positional, 0, 'target');
  const name = need(positional, 1, 'name');
  const raw = need(positional, 2, 'value');
  const { spans } = viewOf(ctx);
  const span = scoreTarget(spans, target);
  write(ctx, { kind: 'score', span_id: span.span_id, name, value: /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw, source: opts.source, rubric: opts.rubric, body: opts.body, via: opts.via as LogEvent['via'], comment: opts.comment });
  return `Score ${name}=${raw} on ${target}`;
}

function resume(ctx: RunContext): string {
  const { run, spans } = viewOf(ctx);
  const job = latest(spans, (s) => s.type === 'job' && isOpen(s));
  pointMarker(ctx, { run, jobSpanId: job?.span_id ?? (run.span_id as string), sessionId: sessionOf(ctx) });
  return `Run ${run.run_id} resumed${job === undefined ? '' : ` in Job ${job.job}`}`;
}

function archive(ctx: RunContext): string {
  const { run } = viewOf(ctx);
  const target = `.logs/new-episode/${ctx.slug}/${run.run_id}.jsonl`;
  mkdirSync(path.dirname(path.join(ctx.root, target)), { recursive: true });
  copyFileSync(path.join(ctx.root, episodeLogPath(ctx.slug)), path.join(ctx.root, target));
  return target;
}

type Handler = (ctx: RunContext, positional: readonly string[], opts: Opts) => string;

const HANDLERS: Record<string, Handler> = {
  'begin-run': (ctx, _p, o) => beginRun(ctx, o),
  'end-run': endRun,
  'begin-job': beginJob,
  'end-job': endJob,
  'begin-attempt': beginAttempt,
  'end-attempt': endAttempt,
  'open-gate': openGate,
  'close-gate': closeGate,
  score,
  resume: (ctx) => resume(ctx),
  archive: (ctx) => archive(ctx),
};

/** Runs one command (`argv` after the slug) and returns what to print, or why it was refused. */
export function runCommand(ctx: RunContext, argv: readonly string[]): CommandResult {
  try {
    const [command = '', ...rest] = argv;
    const handler = HANDLERS[command];
    if (handler === undefined) return fail(USAGE);
    const { values, positionals } = parseArgs({ args: rest, options: OPTIONS, allowPositionals: true });
    if (!existsSync(path.join(ctx.root, path.dirname(episodeLogPath(ctx.slug))))) refuse(`docs/episodes/${ctx.slug} does not exist; run this from the Episode's worktree root.`);
    return done(handler(ctx, positionals, values));
  } catch (error) {
    return fail((error as Error).message);
  }
}
