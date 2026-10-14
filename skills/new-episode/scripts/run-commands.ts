// The run-scoped commands: how the orchestrator drives an Episode's Run by names (a job id, an attempt number, a gate
// name) and never by span id. Each command writes its line through the run-log writer, resolves parents and targets
// from the log itself, and keeps the active-run marker (`.scratch/active-run`) in step, so the marker is an internal
// detail of this module. begin-run opens the Run and the marker; begin-job and begin-attempt nest under it (an
// Attempt's number and `retry_of` are derived, and the spawn description is printed); end-run records the
// orchestrator's usage and clears the marker in one step. A command refuses a step the log cannot support: a Job
// pipeline.yml does not declare, a second Run while one is open, a Job or Run ended over open spans. Real disk; the
// clock, ids, git and the transcript lookup are injectable. Shapes live in run-log.pure.ts; `run.ts` is the argv wrapper.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { episodeLogPath, readEpisodeLog, readMarker } from './episode-run-log.ts';
import { declaredJobs } from './episode-status.ts';
import { endEvent, need, OPTIONS, refuse, viaOf, type Opts, type Params } from './run-args.pure.ts';
import { USAGE } from './run-help.pure.ts';
import { appendEvent } from './run-log-writer.ts';
import { type LogEvent, type RunLogLine, type Span, type Status } from './run-log.pure.ts';
import { endMarker, liveMarker, pointMarker, type MarkerHome } from './run-marker.ts';
import { hasEnded, isOpen, latest, openSpan, openUnderRun, scoreTarget } from './run-spans.pure.ts';

/** What a command reads from outside; each defaults to the real thing. */
export interface RunContext extends MarkerHome {
  /** The orchestrator's session id (CLAUDE_CODE_SESSION_ID, else SESSION_ID); begin-run and resume need it. */
  sessionId?: string;
}

export type CommandResult = { ok: true; output: string } | { ok: false; error: string };

const failure = (error: string): CommandResult => ({ ok: false, error });
const success = (output: string): CommandResult => ({ ok: true, output });

/** A line as written: its span id is known. */
type Written = RunLogLine & { span_id: string };

/** The current Run, its lines and its spans, read fresh from the log. */
interface View {
  run: Written;
  lines: RunLogLine[];
  spans: Span[];
}

function viewOf(ctx: RunContext): View {
  const log = readEpisodeLog(ctx.slug, ctx.root);
  if (log.errors.length > 0) refuse(log.errors.join('\n'));
  const run = log.current ?? refuse('the log has no Run; run begin-run first');
  const spanId = run.span_id ?? refuse('the start-run line has no span id');
  const trace = run.trace_id;
  return {
    run: { ...run, span_id: spanId },
    lines: log.lines,
    spans: log.folded.spans.filter((s) => s.trace_id === trace),
  };
}

/** Writes one event and returns the line as written. */
function write(ctx: RunContext, event: LogEvent): Written {
  const result = appendEvent({ root: ctx.root, file: episodeLogPath(ctx.slug) }, event, ctx.writer);
  if (!result.ok) return refuse(result.errors.join('\n'));
  const line = JSON.parse(result.line) as RunLogLine;
  return { ...line, span_id: line.span_id ?? refuse('the writer returned a line with no span id') };
}

/** The one place a marker is built: this Run, the span agents join, the session that orchestrates. */
const pointAt = (ctx: RunContext, run: RunLogLine, to: { jobSpanId: string; sessionId: string }): void =>
  pointMarker(ctx, { run, ...to });

function sessionOf(ctx: RunContext): string {
  return ctx.sessionId ?? refuse('no session id: set SESSION_ID, or run inside Claude Code (CLAUDE_CODE_SESSION_ID)');
}

function beginRun(ctx: RunContext, opts: Opts): string {
  const sessionId = sessionOf(ctx);
  const model = opts.model ?? refuse('begin-run needs --model <the model you run on>');
  const { current, lines } = readEpisodeLog(ctx.slug, ctx.root);
  if (current !== null && !hasEnded(lines, current))
    refuse(`Run ${current.run_id} has not ended: resume it, or run end-run crashed first`);
  const line = write(ctx, { kind: 'start-run', harness: opts.harness ?? 'claude-code', 'gen_ai.request.model': model });
  pointAt(ctx, line, { jobSpanId: line.span_id, sessionId });
  return `Run begun (${line.run_id})`;
}

/** Statuses a Run may end with while spans under it are still open: those spans then read crashed. */
const ABANDONING: readonly Status[] = ['error', 'crashed'];

function endRun(ctx: RunContext, p: Params<'status' | 'summary'>): string {
  const { run, lines, spans } = viewOf(ctx);
  if (hasEnded(lines, run)) refuse(`Run ${run.run_id} already ended`);
  const open = openUnderRun(spans).map((s) => `${s.type} ${s.name}`);
  if (open.length > 0 && !(ABANDONING as readonly string[]).includes(p.status ?? 'ok'))
    refuse(
      `Run ${run.run_id} still has open spans: ${open.join(', ')}. End them, or run end-run error|crashed to leave them crashed`,
    );
  write(ctx, endEvent('end-run', run.span_id, p));
  const warning = endMarker(ctx, run, readEpisodeLog(ctx.slug, ctx.root).lines);
  return warning === '' ? 'Run ended' : `Run ended (${warning})`;
}

function beginJob(ctx: RunContext, p: Params<'job'>): string {
  const job = need(p.job, 'job');
  const declared = declaredJobs(ctx.root, ctx.slug);
  if (!declared.ids.includes(job)) refuse(`${declared.file} declares no job "${job}"`);
  const { run, spans } = viewOf(ctx);
  const marker = liveMarker(ctx.root, run);
  const open = openSpan(spans, 'job', { job });
  const spanId =
    open?.span_id ?? write(ctx, { kind: 'start', type: 'job', name: job, job, parent_span_id: run.span_id }).span_id;
  pointAt(ctx, run, { jobSpanId: spanId, sessionId: marker.session_id });
  return open === undefined ? `Job ${job} begun` : `Job ${job} already open; agents now join it`;
}

function endJob(ctx: RunContext, p: Params<'job' | 'status' | 'summary'>): string {
  const job = need(p.job, 'job');
  const { run, spans } = viewOf(ctx);
  const open = openSpan(spans, 'job', { job }) ?? refuse(`no open Job ${job}`);
  if (openSpan(spans, 'attempt', { job }) !== undefined)
    refuse(`${job} has an open Attempt; run end-attempt ${job} first`);
  write(ctx, endEvent('end', open.span_id, p));
  const marker = readMarker(ctx.root);
  if (marker !== null && marker.job_span_id === open.span_id)
    pointAt(ctx, run, { jobSpanId: run.span_id, sessionId: marker.session_id });
  return `Job ${job} ended`;
}

function beginAttempt(ctx: RunContext, p: Params<'job'>): string {
  const job = need(p.job, 'job');
  const { spans } = viewOf(ctx);
  const jobSpan = openSpan(spans, 'job', { job }) ?? refuse(`no open Job ${job}; run begin-job ${job} first`);
  const attempts = spans.filter((s) => s.type === 'attempt' && s.job === job);
  if (attempts.some(isOpen)) refuse(`${job} has an open Attempt; run end-attempt ${job} first`);
  const previous = latest(attempts, () => true);
  const n = attempts.reduce((max, s) => Math.max(max, s.attempt ?? 0), 0) + 1;
  write(ctx, {
    kind: 'start',
    type: 'attempt',
    name: `${job}#${n}`,
    job,
    attempt: n,
    parent_span_id: jobSpan.span_id,
    retry_of: previous?.span_id,
  });
  return `Attempt ${job}#${n} begun; spawn each agent with description ${job}#${n}/<role>[/#<ticket>]`;
}

function endAttempt(ctx: RunContext, p: Params<'job' | 'status' | 'summary'>): string {
  const job = need(p.job, 'job');
  const { spans } = viewOf(ctx);
  const open = openSpan(spans, 'attempt', { job }) ?? refuse(`no open Attempt of ${job}`);
  write(ctx, endEvent('end', open.span_id, p));
  return `Attempt ${open.name} ended`;
}

function openGate(ctx: RunContext, p: Params<'job' | 'name'>): string {
  const job = need(p.job, 'job');
  const name = need(p.name, 'name');
  const { run, spans } = viewOf(ctx);
  if (openSpan(spans, 'gate', { name }) !== undefined) refuse(`Gate "${name}" is already open`);
  write(ctx, { kind: 'start', type: 'gate', name, job, parent_span_id: run.span_id });
  return `Gate "${name}" opened`;
}

function closeGate(ctx: RunContext, p: Params<'name' | 'status' | 'summary'>): string {
  const name = need(p.name, 'name');
  const { spans } = viewOf(ctx);
  const open = openSpan(spans, 'gate', { name }) ?? refuse(`no open Gate "${name}"`);
  write(ctx, endEvent('end', open.span_id, p));
  return `Gate "${name}" closed`;
}

function score(ctx: RunContext, p: Params<'target' | 'name' | 'value'>, opts: Opts): string {
  const target = need(p.target, 'target');
  const name = need(p.name, 'name');
  const raw = need(p.value, 'value');
  const via = viaOf(opts.via);
  const { spans } = viewOf(ctx);
  const span = scoreTarget(spans, target) ?? refuse(`no span named "${target}" in the current Run`);
  write(ctx, {
    kind: 'score',
    span_id: span.span_id,
    name,
    value: /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw,
    source: opts.source,
    rubric: opts.rubric,
    body: opts.body,
    via,
    comment: opts.comment,
  });
  return `Score ${name}=${raw} on ${target}`;
}

function resume(ctx: RunContext): string {
  const { run, spans } = viewOf(ctx);
  const job = openSpan(spans, 'job');
  pointAt(ctx, run, { jobSpanId: job?.span_id ?? run.span_id, sessionId: sessionOf(ctx) });
  return `Run ${run.run_id} resumed${job === undefined ? '' : ` in Job ${job.job}`}`;
}

function archive(ctx: RunContext): string {
  const { run } = viewOf(ctx);
  const target = `.logs/new-episode/${ctx.slug}/${run.run_id}.jsonl`;
  mkdirSync(path.dirname(path.join(ctx.root, target)), { recursive: true });
  copyFileSync(path.join(ctx.root, episodeLogPath(ctx.slug)), path.join(ctx.root, target));
  return target;
}

/** A command: the names of its positional parameters, and what it does with them. */
interface Command {
  params: readonly string[];
  run: (ctx: RunContext, positional: Record<string, string | undefined>, opts: Opts) => string;
}

const command = <K extends string>(
  params: readonly K[],
  run: (ctx: RunContext, p: Params<K>, opts: Opts) => string,
): Command => ({
  params,
  run: (ctx, positional, opts) =>
    run(ctx, { ...positional, ...(opts.summary === undefined ? {} : { summary: opts.summary }) } as Params<K>, opts),
});

const COMMANDS: Record<string, Command> = {
  'begin-run': command([], (ctx, _p, o) => beginRun(ctx, o)),
  'end-run': command(['status', 'summary'], endRun),
  'begin-job': command(['job'], beginJob),
  'end-job': command(['job', 'status', 'summary'], endJob),
  'begin-attempt': command(['job'], beginAttempt),
  'end-attempt': command(['job', 'status', 'summary'], endAttempt),
  'open-gate': command(['job', 'name'], openGate),
  'close-gate': command(['name', 'status', 'summary'], closeGate),
  score: command(['target', 'name', 'value'], score),
  resume: command([], (ctx) => resume(ctx)),
  archive: command([], (ctx) => archive(ctx)),
};

/** Runs one command (`argv` after the slug) and returns what to print, or why it was refused. */
export function runCommand(ctx: RunContext, argv: readonly string[]): CommandResult {
  try {
    const [name = '', ...rest] = argv;
    const spec = COMMANDS[name];
    if (spec === undefined) return failure(USAGE);
    const { values, positionals } = parseArgs({ args: rest, options: OPTIONS, allowPositionals: true });
    if (!existsSync(path.join(ctx.root, path.dirname(episodeLogPath(ctx.slug)))))
      refuse(`docs/episodes/${ctx.slug} does not exist; run this from the Episode's worktree root.`);
    const named = Object.fromEntries(spec.params.map((param, i) => [param, positionals[i]]));
    return success(spec.run(ctx, named, values));
  } catch (error) {
    return failure((error as Error).message);
  }
}
