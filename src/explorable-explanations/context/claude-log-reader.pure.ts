import { largestRemainder } from './context-usage.pure';
import { isMessage } from './context.pure';
import type { Block, Category, Reminder, Step, ToolCall } from './context.types';

/* The state a Claude Code log is read into, line by line; claude-log.pure.ts drives it. */

export interface LogOptions {
  readonly id: string;
  /** The starting instructions: the log never holds them, so their split comes from the config. */
  readonly start: { readonly id: string; readonly blocks: readonly Block[] };
  /** The size of each memory file; without it, a memory file is sized by its text. */
  readonly memory?: number;
}

/** A token estimate from text length, about four characters a token, and the unrounded share weight. */
export const weight = (text: string): number => text.length / 4;
export const estimate = (text: string): number => Math.max(1, Math.round(weight(text)));

const HIDDEN_USER = /^\s*<(?:command-|local-command|system-reminder|task-notification|bash-)/;
export const isHidden = (text: string) => HIDDEN_USER.test(text) || text.startsWith('Caveat:');

export type Json = Record<string, unknown>;
export const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null;
export const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const num = (value: unknown, fallback = 0): number => (typeof value === 'number' ? value : fallback);
export const obj = (value: unknown): Json => (isObject(value) ? value : {});
export const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

export function parseLines(log: string): Json[] {
  return log.split('\n').flatMap((raw) => {
    try {
      const value: unknown = raw.trim() ? JSON.parse(raw) : null;
      return isObject(value) ? [value] : [];
    } catch {
      return [];
    }
  });
}

export function resultText(content: unknown): string {
  if (!Array.isArray(content)) return str(content);
  return content.map((part) => (isObject(part) && part.type === 'text' ? str(part.text) : '[image]')).join('\n');
}

function inputOf(value: unknown): ToolCall['input'] {
  const primitive = (v: unknown) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
  return Object.fromEntries(
    Object.entries(obj(value)).map(([key, v]) => [key, primitive(v) ? (v as string) : JSON.stringify(v)]),
  );
}

interface Sized {
  cat: Category;
  tokens: number;
}
/** A step under construction: blocks and calls stay mutable until the log is read. */
interface Draft {
  id: string;
  kind: Step['kind'];
  blocks: Sized[];
  reminders?: Reminder[];
  fields: Json;
  calls?: ToolCall[];
  useIds?: string[];
  request?: string;
}
interface Open {
  block: Sized;
  est: number;
}
interface Request {
  output: number;
  thinking: boolean;
  parts: Map<Sized, number>;
}

export const blockOf = (step: Draft, cat: Category): Sized => {
  const found = step.blocks.find((b) => b.cat === cat);
  if (found) return found;
  const block = { cat, tokens: 0 };
  step.blocks.push(block);
  return block;
};

const share = (open: readonly Open[], tokens: number) => {
  const units = largestRemainder(
    open.map(({ est }) => est),
    tokens,
  );
  open.forEach(({ block }, i) => (block.tokens += units[i] ?? 0));
};

export class LogReader {
  readonly steps: Draft[] = [];
  private readonly memorySize: number | undefined;
  private last: number;
  private known = 0;
  private carry = 0;
  private open: Open[] = [];
  private request: Request | null = null;
  private readonly requests = new Set<string>();
  private readonly tools = new Map<string, Draft>();

  constructor(options: LogOptions) {
    this.memorySize = options.memory;
    const blocks = options.start.blocks.map((b) => ({ ...b }));
    this.steps.push({ id: options.start.id, kind: 'start', blocks, fields: {} });
    this.last = blocks.reduce((sum, b) => sum + b.tokens, 0);
  }

  add(kind: Step['kind'], id: string, fields: Json = {}): Draft {
    const taken = new Set(this.steps.map((s) => s.id));
    let unique = id;
    for (let n = 2; taken.has(unique); n += 1) unique = `${id}-${n}`;
    const step: Draft = { id: unique, kind, blocks: [], fields };
    this.steps.push(step);
    return step;
  }

  /** Closes the open request: its reply is sized by `output_tokens`, by length when thinking hides the split. */
  private closeRequest() {
    const request = this.request;
    this.request = null;
    if (!request) return;
    const parts = [...request.parts].map(([block, est]) => ({ block, est }));
    if (request.thinking) this.open.push(...parts);
    else {
      share(parts, request.output);
      this.known += request.output;
    }
  }

  /** A measured context size: what is not yet explained is shared over the messages since the last measurement. */
  measure(context: number) {
    this.closeRequest();
    const left = context - this.last - this.known + this.carry;
    this.carry = this.open.length === 0 ? left : 0;
    if (this.open.length && left > 0) share(this.open, left);
    else for (const { block, est } of this.open) block.tokens += Math.round(est);
    this.open = [];
    this.known = 0;
    this.last = context;
  }

  /** A message block whose size the next measurement settles, shared by its estimate `est`. */
  unknown(block: Sized, est: number) {
    this.open.push({ block, est });
  }

  /** A block of the open request's reply, sized by its `output_tokens`. */
  reply(block: Sized, est: number) {
    const request = this.request;
    if (request) request.parts.set(block, (request.parts.get(block) ?? 0) + est);
    else this.unknown(block, est);
  }

  remind(reminder: Reminder) {
    const step = this.steps.at(-1);
    if (!step) return;
    step.reminders = [...(step.reminders ?? []), reminder];
    blockOf(step, 'reminder').tokens += estimate(reminder.text);
    this.known += estimate(reminder.text);
  }

  memory(id: string, path: string, content: string) {
    const tokens = this.memorySize ?? estimate(content);
    this.add('memory', id, { path }).blocks.push({ cat: 'memory', tokens });
    this.known += tokens;
  }

  openRequest(requestId: string, usage: Json) {
    if (!requestId || this.requests.has(requestId)) return;
    this.requests.add(requestId);
    this.measure(num(usage.input_tokens) + num(usage.cache_read_input_tokens) + num(usage.cache_creation_input_tokens));
    this.request = { output: num(usage.output_tokens), thinking: false, parts: new Map() };
  }

  thinking() {
    if (this.request) this.request.thinking = true;
  }

  toolUse(id: string, requestId: string, part: Json) {
    const last = this.steps.at(-1);
    const step = last?.kind === 'tool' && last.request === requestId ? last : this.add('tool', id);
    step.request = requestId;
    step.calls = [...(step.calls ?? []), { name: str(part.name), input: inputOf(part.input), result: '' }];
    step.useIds = [...(step.useIds ?? []), str(part.id)];
    this.tools.set(str(part.id), step);
    this.reply(blockOf(step, 'tool_use'), weight(JSON.stringify(part.input ?? {})) + 20);
  }

  toolResult(useId: string, content: unknown) {
    const step = this.tools.get(useId);
    if (!step) return;
    const result = resultText(content);
    step.calls = (step.calls ?? []).map((call, i) => (step.useIds?.[i] === useId ? { ...call, result } : call));
    this.unknown(blockOf(step, 'tool_result'), weight(result));
  }

  compact(id: string, meta: Json) {
    this.measure(num(meta.preTokens, this.last));
    const post = num(meta.postTokens);
    const kept = this.steps.flatMap((s) => s.blocks).filter((b) => !isMessage(b.cat));
    const summary = post - kept.reduce((sum, b) => sum + b.tokens, 0);
    const trigger = meta.trigger === 'manual' ? 'manual' : 'auto';
    this.add('compact', id, { trigger, summary: '' }).blocks.push({ cat: 'summary', tokens: summary });
    this.last = post;
  }

  cleared(id: string, meta: Json) {
    this.measure(num(meta.preTokens, this.last));
    const saved = num(meta.tokensSaved);
    this.add('cleared', id, { cleared: saved });
    this.last -= saved;
  }

  finish(): Step[] {
    this.closeRequest();
    for (const { block, est } of this.open) block.tokens += Math.round(est);
    return this.steps.map((draft) => {
      const step: Json = { id: draft.id, kind: draft.kind, ...draft.fields };
      if (draft.calls) step.calls = draft.calls;
      if (draft.reminders) step.reminders = draft.reminders;
      step.blocks = draft.blocks.map((b) => ({ cat: b.cat, tokens: Math.max(1, b.tokens) }));
      return step as unknown as Step;
    });
  }
}
