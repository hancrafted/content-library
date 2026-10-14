// A Claude Code transcript (one JSON entry per line) read for what the run log records: its entries, the prompt
// that opened it, and the tokens it spent. Pure; claude-adapter.pure.ts is the caller.
import { isRecord, parseJson } from './marker.pure.ts';
import type { LogEvent } from './run-log.pure.ts';

export interface Entry {
  timestamp?: string;
  type?: string;
  message?: { id?: string; role?: string; model?: string; content?: unknown; usage?: Record<string, unknown> };
}

export function entries(transcript: string | null): Entry[] {
  return (transcript ?? '').split('\n').flatMap((raw) => {
    const parsed = parseJson(raw.trim() === '' ? null : raw);
    return isRecord(parsed) ? [parsed as Entry] : [];
  });
}

export function promptOf(all: readonly Entry[]): string | undefined {
  const first = all.find((e) => e.type === 'user' && e.message?.role === 'user');
  const content = first?.message?.content;
  if (typeof content === 'string') return content.trim() === '' ? undefined : content;
  if (!Array.isArray(content)) return undefined;
  const text = content
    .flatMap((b) => (isRecord(b) && b.type === 'text' && typeof b.text === 'string' ? [b.text] : []))
    .join('\n');
  return text === '' ? undefined : text;
}

const num = (v: unknown): number => (typeof v === 'number' ? v : 0);

/** Summed usage: a streamed message repeats under one id, so only its last entry counts. */
export function usageOf(all: readonly Entry[]): Partial<LogEvent> {
  const byMessage = new Map<string, Record<string, unknown>>();
  all.forEach((e, at) => {
    if (e.type === 'assistant' && e.message?.usage) byMessage.set(e.message.id ?? `#${at}`, e.message.usage);
  });
  if (byMessage.size === 0) return {};
  const sum = (key: string): number => [...byMessage.values()].reduce((total, u) => total + num(u[key]), 0);
  return {
    'gen_ai.usage.input_tokens': sum('input_tokens'),
    'gen_ai.usage.output_tokens': sum('output_tokens'),
    'gen_ai.usage.cache_read.input_tokens': sum('cache_read_input_tokens'),
  };
}

/** The model of the last assistant message. */
export const modelOf = (all: readonly Entry[]): string | undefined =>
  [...all].reverse().find((e) => e.type === 'assistant' && e.message?.model)?.message?.model;
