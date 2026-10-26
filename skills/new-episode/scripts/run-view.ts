// What every run command shares: the context it reads from outside, the current Run's view read fresh from the log,
// the one place a line is written and the marker pointed, and resuming a Run in a new session. Real disk;
// run-commands.ts is the caller.
import { episodeLogPath, readEpisodeLog, readMarker } from '../../../src/pipeline/lib/episode-run-log.ts';
import { appendEvent } from '../../../src/pipeline/lib/run-log-writer.ts';
import { type LogEvent, type RunLogLine, type Span } from '../../../src/pipeline/lib/run-log.pure.ts';
import { hasEnded, openSpan } from '../../../src/pipeline/lib/run-spans.pure.ts';
import { refuse, type Opts, type Params } from './run-args.pure.ts';
import { pointMarker, type MarkerHome } from './run-marker.ts';
import type { ServerHost } from './servers.ts';

/** What a command reads from outside; each defaults to the real thing. */
export interface RunContext extends MarkerHome {
  /** The orchestrator's session id (CLAUDE_CODE_SESSION_ID, else SESSION_ID); begin-run and resume need it. */
  sessionId?: string;
  /** The machine's ports and processes for the Run's two servers; absent, begin-run and end-run start and stop none. */
  servers?: ServerHost;
}

/** A line as written: its span id is known. */
export type Written = RunLogLine & { span_id: string };

/** The current Run, its lines and its spans, read fresh from the log. */
export interface View {
  run: Written;
  lines: RunLogLine[];
  spans: Span[];
}

export function viewOf(ctx: RunContext): View {
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

/** The current Run's view, refused once it has ended: a new span needs begin-run. */
export function openView(ctx: RunContext): View {
  const view = viewOf(ctx);
  if (!hasEnded(view.lines, view.run)) return view;
  return refuse(`Run ${view.run.run_id} has ended; run begin-run first`);
}

/** Writes one event and returns the line as written. */
export function write(ctx: RunContext, event: LogEvent): Written {
  const result = appendEvent({ root: ctx.root, file: episodeLogPath(ctx.slug) }, event, ctx.writer);
  if (!result.ok) return refuse(result.errors.join('\n'));
  const line = JSON.parse(result.line) as RunLogLine;
  return { ...line, span_id: line.span_id ?? refuse('the writer returned a line with no span id') };
}

/** The one place a marker is built: this Run, the span agents join, the session that orchestrates. */
export const pointAt = (ctx: RunContext, run: RunLogLine, to: { jobSpanId: string; sessionId: string }): void =>
  pointMarker(ctx, { run, ...to });

export function sessionOf(ctx: RunContext): string {
  return ctx.sessionId ?? refuse('no session id: set SESSION_ID, or run inside Claude Code (CLAUDE_CODE_SESSION_ID)');
}

export function resume(ctx: RunContext): string {
  const { run, spans } = openView(ctx);
  const job = openSpan(spans, 'job');
  pointAt(ctx, run, { jobSpanId: job?.span_id ?? run.span_id, sessionId: sessionOf(ctx) });
  return `Run ${run.run_id} resumed${job === undefined ? '' : ` in Job ${job.job}`}`;
}

/** Runs `step` for a session the live marker does not list yet: resumes first, and prints that it did. */
export const resuming =
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
