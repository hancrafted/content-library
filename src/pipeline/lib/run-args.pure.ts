import { parseArgs } from 'node:util';
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
  ticket: { type: 'string' },
} as const;

export type Opts = Partial<Record<keyof typeof OPTIONS, string>>;

export class Refusal extends Error {}
export const refuse = (message: string): never => {
  throw new Refusal(message);
};

const NEGATIVE_NUMBER = /^-\d+(\.\d+)?$/;
const MASK = '\u0000';

export function parseRunArgs(args: readonly string[]): { values: Opts; positionals: string[] } {
  const end = args.indexOf('--');
  const masked = args.map((arg, i) => (NEGATIVE_NUMBER.test(arg) && (end === -1 || i < end) ? MASK + arg : arg));
  const { values, positionals } = parseArgs({ args: masked, options: OPTIONS, allowPositionals: true });
  const unmask = (value: string): string => (value.startsWith(MASK) ? value.slice(1) : value);
  return {
    values: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, unmask(v as string)])) as Opts,
    positionals: positionals.map(unmask),
  };
}

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

export type Params<K extends string> = Partial<Record<K, string>>;

export const need = (value: string | undefined, what: string): string => value ?? refuse(`missing <${what}>\n${USAGE}`);
