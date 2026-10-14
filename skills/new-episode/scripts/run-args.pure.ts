// The run commands' argument vocabulary: the options they read, the refusal they raise, and the checks that turn a
// positional status or an option into a field of the log line. Pure; run-commands.ts is the only caller.
import { USAGE } from './run-help.pure.ts';
import { STATUSES, VIAS, type LogEvent, type Status, type Via } from './run-log.pure.ts';

export const OPTIONS = {
  model: { type: 'string' },
  harness: { type: 'string' },
  summary: { type: 'string' },
  source: { type: 'string' },
  rubric: { type: 'string' },
  body: { type: 'string' },
  via: { type: 'string' },
  comment: { type: 'string' },
} as const;

export type Opts = Partial<Record<keyof typeof OPTIONS, string>>;

export class Refusal extends Error {}
export const refuse = (message: string): never => {
  throw new Refusal(message);
};

/** The end line of a span (or of the Run, with kind `end-run`): `[status] [summary]`, status ok by default. */
export function endEvent(
  kind: 'end' | 'end-run',
  spanId: string,
  args: { status?: string; summary?: string },
): LogEvent {
  const status = args.status ?? 'ok';
  if (!(STATUSES as readonly string[]).includes(status))
    refuse(`status must be ${STATUSES.join(', ')}, not "${status}"`);
  return { kind, span_id: spanId, status: status as Status, summary: args.summary };
}

export function viaOf(value: string | undefined): Via | undefined {
  if (value === undefined) return undefined;
  return (VIAS as readonly string[]).includes(value)
    ? (value as Via)
    : refuse(`--via must be ${VIAS.join(' or ')}, not "${value}"`);
}

/** The Params of a command, named by position; a missing one is undefined. */
export type Params<K extends string> = Partial<Record<K, string>>;

export const need = (value: string | undefined, what: string): string => value ?? refuse(`missing <${what}>\n${USAGE}`);
