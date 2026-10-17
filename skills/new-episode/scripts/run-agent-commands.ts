// The agent-span commands: begin-agent and end-agent record an agent on any harness, by its spawn description. The
// Claude Code adapter enriches the same span by name (claude-adapter.pure.ts). Real disk; run-commands.ts registers them.
import { parseDescription } from '../../../src/lib/episode-spawn-description.pure.ts';
import { endEvent, need, refuse, type Opts, type Params } from './run-args.pure.ts';
import type { LogEvent } from './run-log.pure.ts';
import { isOpen, latest, openSpan } from './run-spans.pure.ts';
import { openView, viewOf, write, type RunContext } from './run-view.ts';

/** Opens a typed agent span named by its spawn description under the Job's open Attempt; a repeat changes nothing. */
export function beginAgent(ctx: RunContext, p: Params<'agent'>, opts: Opts): string {
  const name = need(p.agent, 'agent');
  const who = parseDescription(name) ?? refuse(`"${name}" is not <job>#<n>/<role>[/#<ticket>]`);
  const { spans } = openView(ctx);
  const attempt =
    latest(spans, (s) => s.type === 'attempt' && s.job === who.job && s.attempt === who.attempt && isOpen(s)) ??
    refuse(`no open Attempt ${who.job}#${who.attempt}; run begin-attempt ${who.job} first`);
  if (openSpan(spans, 'agent', { name }) !== undefined) return `Agent ${name} already open`;
  write(ctx, {
    kind: 'start',
    type: 'agent',
    name,
    ...who,
    parent_span_id: attempt.span_id,
    harness: opts.harness,
    source: 'typed',
  } as LogEvent);
  return `Agent ${name} begun`;
}

/** Ends the agent span of that name: the open one, else the latest, so a harness adapter that ended it first can be overridden. */
export function endAgent(ctx: RunContext, p: Params<'agent' | 'status' | 'summary'>): string {
  const name = need(p.agent, 'agent');
  const { spans } = viewOf(ctx);
  const span =
    openSpan(spans, 'agent', { name }) ??
    latest(spans, (s) => s.type === 'agent' && s.name === name) ??
    refuse(`no agent span "${name}"; run begin-agent ${name} first`);
  write(ctx, endEvent('end', span.span_id, p));
  return `Agent ${name} ended`;
}
