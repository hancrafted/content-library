import type { Category, Chat } from '@/components/slide-shared/context/context.types';

/** One size bar: a key for its label, and the block of one chat step it measures. */
export interface SizeRow<K extends string = string> {
  readonly key: K;
  readonly step: string;
  readonly category: Category;
}

/** A drawn bar: its tokens, and its length as a percent of the largest row. */
export interface SizeBar<K extends string = string> {
  readonly key: K;
  readonly tokens: number;
  readonly percent: number;
}

/**
 * The four rows of "One innocent question", on the summer party: the question (m10), the two web searches' extracts
 * (m8), the catering PDF read (m11) and the one-line answer (m12). The tokens come from the chat the cornerstone
 * draws, so the bars and the live grid always agree.
 */
export const SIZE_ROWS = [
  { key: 'question', step: 'm10', category: 'user' },
  { key: 'searches', step: 'm8', category: 'tool_result' },
  { key: 'pdf', step: 'm11', category: 'tool_result' },
  { key: 'answer', step: 'm12', category: 'assistant' },
] as const satisfies readonly SizeRow[];

const roundTo = (value: number, places: number): number => Math.round(value * 10 ** places) / 10 ** places;

/** Each row's tokens, read from its step's block of its category, on one scale whose largest row is full width. */
export function sizeBars<K extends string>(chat: Chat, rows: readonly SizeRow<K>[]): SizeBar<K>[] {
  const measured = rows.map((row) => {
    const step = chat.steps.find(({ id }) => id === row.step);
    if (!step) throw new Error(`size bars: no step "${row.step}" in chat "${chat.id}"`);
    const block = step.blocks.find(({ cat }) => cat === row.category);
    if (!block) throw new Error(`size bars: step "${row.step}" holds no ${row.category} block`);
    return { key: row.key, tokens: block.tokens };
  });
  const largest = Math.max(1, ...measured.map(({ tokens }) => tokens));
  return measured.map(({ key, tokens }) => ({ key, tokens, percent: roundTo((tokens / largest) * 100, 2) }));
}
