import { need, refuse, type Params } from './run-args.pure.ts';
import { NOTE_TYPES, type NoteType } from './run-log.pure.ts';
import { openSpan } from './run-spans.pure.ts';
import { viewOf, write, type RunContext } from './run-view.ts';

export function note(ctx: RunContext, p: Params<'job' | 'type' | 'text'>): string {
  const job = need(p.job, 'job');
  const type = need(p.type, 'type');
  const text = need(p.text, 'text');
  if (!(NOTE_TYPES as readonly string[]).includes(type))
    refuse(`note type must be ${NOTE_TYPES.join(', ')}, not "${type}"`);
  const { spans } = viewOf(ctx);
  const open = openSpan(spans, 'job', { job }) ?? refuse(`no open Job ${job}; run begin-job ${job} first`);
  write(ctx, {
    kind: 'event',
    span_id: open.span_id,
    name: 'note',
    source: 'typed',
    attributes: { 'note.type': type as NoteType, 'note.text': text },
  });
  return `Note ${type} on ${job}`;
}
