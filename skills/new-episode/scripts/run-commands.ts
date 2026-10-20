// The run-scoped commands: how the orchestrator drives an Episode's Run by names (a job id, an attempt number, a gate
// name) and never by span id. Each command writes its line through the run-log writer, resolves parents and targets from
// the log itself, and keeps the active-run marker (`.scratch/active-run`) in step, so the marker is an internal detail
// of this module. begin-run opens the Run and the marker; begin-job and begin-attempt nest under it; end-run records the
// orchestrator's usage and clears the marker in one step. A command refuses a step the log cannot support. Real disk;
// clock, ids, git and the transcript lookup are injectable.
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { archiveEpisodeLog, episodeLogPath, readEpisodeLog, readMarker } from './episode-run-log.ts';
import { declaredJobs } from './episode-status.ts';
import { beginAgent, endAgent } from './run-agent-commands.ts';
import { endEvent, need, parseRunArgs, refuse, viaOf, type Opts, type Params } from './run-args.pure.ts';
import { USAGE } from './run-help.pure.ts';
import { type LogEvent, type Status } from './run-log.pure.ts';
import { endMarker, liveMarker, recordJobUsage } from './run-marker.ts';
import { note } from './run-note-command.ts';
import { hasEnded, isOpen, latest, openAgentsOf, openSpan, openUnderRun, scoreTarget } from './run-spans.pure.ts';
import { openView, pointAt, sessionOf, viewOf, write, type RunContext } from './run-view.ts';
import { serversNote } from './servers.ts';

export type { RunContext } from './run-view.ts';
export type CommandResult = { ok: true; output: string } | { ok: false; error: string };

const failure = (error: string): CommandResult => ({ ok: false, error });
const success = (output: string): CommandResult => ({ ok: true, output });

function beginRun(ctx: RunContext, opts: Opts): string {
  const sessionId = sessionOf(ctx);
  const model = opts.model ?? refuse('begin-run needs --model <the model you run on>');
  const { current, lines } = readEpisodeLog(ctx.slug, ctx.root);
  if (current !== null && !hasEnded(lines, current))
    refuse(`Run ${current.run_id} has not ended: resume it, or run end-run crashed first`);
  mkdirSync(path.join(ctx.root, path.dirname(episodeLogPath(ctx.slug))), { recursive: true });
  const line = write(ctx, { kind: 'start-run', harness: opts.harness ?? 'claude-code', 'gen_ai.request.model': model });
  pointAt(ctx, line, { jobSpanId: line.span_id, sessionId });
  return `Run begun (${line.run_id})${serversNote(ctx.servers, { root: ctx.root, slug: ctx.slug, sha: line.template_sha ?? '' })}`;
}

/** Statuses a Run may end with while spans are open; they then read crashed. */
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
  ctx.servers?.stop(ctx.root);
  const warning = endMarker(ctx, run, readEpisodeLog(ctx.slug, ctx.root).lines);
  return warning === '' ? 'Run ended' : `Run ended (${warning})`;
}

function beginJob(ctx: RunContext, p: Params<'job'>): string {
  const job = need(p.job, 'job');
  const declared = declaredJobs(ctx.root, ctx.slug);
  if (!declared.ids.includes(job)) refuse(`${declared.file} declares no job "${job}"`);
  const { run, spans } = openView(ctx);
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
  const ended = write(ctx, endEvent('end', open.span_id, p));
  // A Job that ran in the orchestrator's own session has no agent spans: its cost is the session's usage in its window.
  const warning = declaredJobs(ctx.root, ctx.slug).orchestrator.includes(job) ? recordJobUsage(ctx, open, ended) : '';
  const marker = readMarker(ctx.root);
  if (marker !== null && marker.job_span_id === open.span_id)
    pointAt(ctx, run, { jobSpanId: run.span_id, sessionId: marker.session_id });
  return warning === '' ? `Job ${job} ended` : `Job ${job} ended (${warning})`;
}

/** Brings an earlier Run's ok Job over as a linked `reused` Job span; a second call changes nothing. */
function reuse(ctx: RunContext, p: Params<'job'>): string {
  const job = need(p.job, 'job');
  const declared = declaredJobs(ctx.root, ctx.slug);
  if (!declared.ids.includes(job)) refuse(`${declared.file} declares no job "${job}"`);
  const { run, spans } = openView(ctx);
  const here = latest(spans, (s) => s.type === 'job' && s.job === job);
  if (here?.status === 'reused') return `Job ${job} already reused in this Run; nothing changed`;
  if (here !== undefined)
    refuse(`Job ${job} already has a span in this Run (${here.status}); reuse only stands in for one that has none`);
  const earlier = readEpisodeLog(ctx.slug, ctx.root).folded.spans;
  const source =
    latest(earlier, (s) => s.type === 'job' && s.job === job && s.status === 'ok' && s.trace_id !== run.trace_id) ??
    refuse(`no earlier Run has an ok span of Job ${job}; run begin-job ${job} instead`);
  const started = write(ctx, {
    kind: 'start',
    type: 'job',
    name: job,
    job,
    parent_span_id: run.span_id,
    link_trace_id: source.trace_id,
    link_span_id: source.span_id,
  });
  write(ctx, endEvent('end', started.span_id, { status: 'reused' }));
  return `Job ${job} reused from Run ${source.trace_id.slice(0, 8)} (span ${source.span_id})`;
}

function beginAttempt(ctx: RunContext, p: Params<'job'>): string {
  const job = need(p.job, 'job');
  const { spans } = openView(ctx);
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
  if ((ABANDONING as readonly string[]).includes(p.status ?? 'ok'))
    for (const agent of openAgentsOf(spans, open)) write(ctx, endEvent('end', agent.span_id, { status: 'crashed' }));
  write(ctx, endEvent('end', open.span_id, p));
  return `Attempt ${open.name} ended`;
}

function openGate(ctx: RunContext, p: Params<'job' | 'name'>): string {
  const job = need(p.job, 'job');
  const name = need(p.name, 'name');
  const { run, spans } = openView(ctx);
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
  const ticket = opts.ticket === undefined ? undefined : Number(opts.ticket);
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
    ticket,
  } as LogEvent);
  return `Score ${name}=${raw} on ${target}`;
}

function resume(ctx: RunContext): string {
  const { run, spans } = openView(ctx);
  const job = openSpan(spans, 'job');
  pointAt(ctx, run, { jobSpanId: job?.span_id ?? run.span_id, sessionId: sessionOf(ctx) });
  return `Run ${run.run_id} resumed${job === undefined ? '' : ` in Job ${job.job}`}`;
}

/** Runs `step` for a session the live marker does not list yet: resumes first, and prints that it did. */
const resuming =
  <K extends string>(step: (ctx: RunContext, p: Params<K>, opts: Opts) => string) =>
  (ctx: RunContext, p: Params<K>, opts: Opts): string => {
    const marker = readMarker(ctx.root);
    const current = readEpisodeLog(ctx.slug, ctx.root).current;
    const unlisted =
      marker !== null &&
      current !== null &&
      marker.trace_id === current.trace_id &&
      !(marker.session_ids ?? [marker.session_id]).includes(sessionOf(ctx));
    return unlisted ? `${resume(ctx)} (this session was not on the Run)\n${step(ctx, p, opts)}` : step(ctx, p, opts);
  };

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
  'begin-job': command(['job'], resuming(beginJob)),
  'end-job': command(['job', 'status', 'summary'], endJob),
  'begin-attempt': command(['job'], resuming(beginAttempt)),
  'end-attempt': command(['job', 'status', 'summary'], endAttempt),
  'begin-agent': command(['agent'], resuming(beginAgent)),
  'end-agent': command(['agent', 'status', 'summary'], endAgent),
  'open-gate': command(['job', 'name'], openGate),
  'close-gate': command(['name', 'status', 'summary'], closeGate),
  reuse: command(['job'], reuse),
  note: command(['job', 'type', 'text'], note),
  score: command(['target', 'name', 'value'], score),
  resume: command([], (ctx) => resume(ctx)),
  archive: command([], (ctx) => archiveEpisodeLog(ctx.slug, ctx.root)),
};

/** Runs one command (`argv` after the slug) and returns what to print, or why it was refused. */
export function runCommand(ctx: RunContext, argv: readonly string[]): CommandResult {
  try {
    const [name = '', ...rest] = argv;
    const spec = COMMANDS[name];
    if (spec === undefined) return failure(USAGE);
    const { values, positionals } = parseRunArgs(rest);
    // begin-run creates the staging folder with the log; every other command needs a Run already begun.
    if (name !== 'begin-run' && !existsSync(path.join(ctx.root, path.dirname(episodeLogPath(ctx.slug)))))
      refuse(`docs/episodes/${ctx.slug} does not exist; run this from the Episode's worktree root.`);
    const named = Object.fromEntries(spec.params.map((param, i) => [param, positionals[i]]));
    return success(spec.run(ctx, named, values));
  } catch (error) {
    return failure((error as Error).message);
  }
}
