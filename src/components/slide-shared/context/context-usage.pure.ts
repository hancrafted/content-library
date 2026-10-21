import { curveWeights, DEFAULT_CURVE, type Curve } from './attention-curve.pure';
import { CATEGORIES, SIMPLE_CATEGORIES, simpleOf, type Frame } from './context.pure';
import type { Category, Chat, Depth, Line, SimpleCategory, StepNotes, WindowSize } from './context.types';

/* What the window holds at a step, as the cornerstone reports it: usage rows, /context boxes, attention, readout. */

export type UsageRow =
  | {
      readonly kind: 'cat';
      readonly key: string;
      readonly cat: Category;
      readonly tokens: number;
      readonly sub: boolean;
    }
  | { readonly kind: 'simple'; readonly key: string; readonly simple: SimpleCategory; readonly tokens: number }
  | { readonly kind: 'group'; readonly key: 'group:messages'; readonly tokens: number }
  | { readonly kind: 'free' | 'buffer'; readonly key: null; readonly tokens: number };

const TOP: readonly Category[] = ['sysprompt', 'systools', 'mcp', 'skills', 'memory'];
const MESSAGES: readonly Category[] = ['user', 'assistant', 'tool_use', 'tool_result', 'reminder', 'summary'];
const ALWAYS = new Set<Category>(['user', 'assistant', 'tool_use', 'tool_result']);

/** Free space and the autocompact buffer; a fill inside the buffer eats it. */
function tailRows(frame: Frame, window: WindowSize): UsageRow[] {
  const free = Math.max(0, window.tokens - frame.used - window.bufferTokens);
  const buffer = Math.max(0, Math.min(window.bufferTokens, window.tokens - frame.used));
  return [
    { kind: 'free', key: null, tokens: free },
    { kind: 'buffer', key: null, tokens: buffer },
  ];
}

function technicalRows(frame: Frame, present: ReadonlySet<Category>): UsageRow[] {
  const of = (cat: Category) => frame.byCategory[cat] ?? 0;
  const messages = MESSAGES.filter((cat) => ALWAYS.has(cat) || present.has(cat));
  return [
    ...TOP.map((cat): UsageRow => ({ kind: 'cat', key: `cat:${cat}`, cat, tokens: of(cat), sub: false })),
    { kind: 'group', key: 'group:messages', tokens: messages.reduce((sum, cat) => sum + of(cat), 0) },
    ...messages.map((cat): UsageRow => ({ kind: 'cat', key: `cat:${cat}`, cat, tokens: of(cat), sub: true })),
  ];
}

function simpleRows(frame: Frame, present: ReadonlySet<Category>): UsageRow[] {
  const optional = new Set<SimpleCategory>(['reminder', 'summary']);
  const presentSimple = new Set([...present].map(simpleOf));
  return SIMPLE_CATEGORIES.filter((simple) => !optional.has(simple) || presentSimple.has(simple)).map(
    (simple): UsageRow => {
      const cats = CATEGORIES.filter((c) => c.simple === simple);
      const tokens = cats.reduce((sum, c) => sum + (frame.byCategory[c.cat] ?? 0), 0);
      return { kind: 'simple', key: `scat:${simple}`, simple, tokens };
    },
  );
}

/** Usage by category at a depth: always the same rows for one chat (`present`), so nothing reflows while it steps. */
export function usageRows(
  frame: Frame,
  depth: Depth,
  context: { readonly window: WindowSize; readonly present: ReadonlySet<Category> },
): readonly UsageRow[] {
  const rows = depth === 'technical' ? technicalRows(frame, context.present) : simpleRows(frame, context.present);
  return [...rows, ...tailRows(frame, context.window)];
}

export type GridBox =
  | { readonly kind: 'used'; readonly id: string; readonly cat: Category }
  | { readonly kind: 'free' | 'buffer'; readonly id: null; readonly cat: null };

function boxCounts(sums: readonly number[], box: number, total: number): number[] {
  const counts = sums.map((tokens) => Math.max(1, Math.round(tokens / box)));
  while (counts.reduce((a, b) => a + b, 0) > total) {
    const most = counts.indexOf(Math.max(...counts));
    counts[most] = (counts[most] ?? 1) - 1;
  }
  return counts;
}

/**
 * Claude Code's /context grid: 100 boxes grouped by category. Each category present gets at least one box, the rest by
 * its share; inside a category each box belongs to the block at its midpoint. The used boxes then follow the window's
 * order, the order the messages appear in the chat, so a category's boxes can sit apart. The buffer's boxes close the grid.
 */
export function gridBoxes(frame: Frame, window: WindowSize, total = 100): readonly GridBox[] {
  const box = window.tokens / total;
  const cats = CATEGORIES.map(({ cat }) => cat).filter((cat) => (frame.byCategory[cat] ?? 0) > 0);
  const sums = cats.map((cat) => frame.byCategory[cat] ?? 0);
  const counts = boxCounts(sums, box, total);
  const used: GridBox[] = cats.flatMap((cat, ci) => {
    const blocks = frame.blocks.filter((block) => block.cat === cat);
    const count = counts[ci] ?? 0;
    return Array.from({ length: count }, (_, j): GridBox => {
      const mid = ((j + 0.5) / count) * (sums[ci] ?? 0);
      let acc = 0;
      const block = blocks.find((b) => (acc += b.tokens) >= mid) ?? blocks.at(-1);
      return { kind: 'used', id: block?.id ?? '', cat };
    });
  });
  const place = (box: GridBox) => frame.blocks.findIndex((b) => b.id === box.id && b.cat === box.cat);
  const out = used
    .map((box) => [box, place(box)] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([box]) => box);
  const bufferBoxes = Math.round(window.bufferTokens / box);
  while (out.length < total - bufferBoxes) out.push({ kind: 'free', id: null, cat: null });
  while (out.length < total) out.push({ kind: 'buffer', id: null, cat: null });
  return out;
}

/** Shares `total` whole units by weight, the leftover to the largest remainders. */
export function largestRemainder(weights: readonly number[], total: number): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const exact = weights.map((w) => (sum > 0 ? (w / sum) * total : total / weights.length));
  const units = exact.map(Math.floor);
  let left = total - units.reduce((a, b) => a + b, 0);
  const order = exact.map((e, i) => [e - Math.floor(e), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, i] of order) {
    if (left <= 0) break;
    units[i] = (units[i] ?? 0) + 1;
    left -= 1;
  }
  return units;
}

export interface Attention {
  readonly id: string;
  readonly units: number;
}

export interface AttentionInput {
  readonly step: number;
  readonly windowTokens: number;
  readonly notes: Readonly<Record<string, StepNotes>>;
  /** Units per step id, the Brief's split; wins when it names this step. */
  readonly override?: Readonly<Record<string, number>>;
  /** The curve's shares per bucket; the default curve when absent. */
  readonly curve?: Curve;
}

/**
 * 100 illustrative units of attention over the steps in the window, split by the curve: the start and the newest stay
 * strong, the recent get a lesser share, and the middle is thin with a few seeded peaks (attention-curve.pure.ts).
 */
export function attentionAt(chat: Chat, frames: readonly Frame[], input: AttentionInput): readonly Attention[] {
  const frame = frames[input.step - 1];
  const steps = chat.steps.slice(0, input.step).filter((s) => frame?.inWindow.includes(s.id));
  const { override } = input;
  if (override) return steps.map((s) => ({ id: s.id, units: override[s.id] ?? 0 }));
  const units = largestRemainder(
    curveWeights(
      steps.map((s) => s.id),
      input.curve ?? DEFAULT_CURVE,
    ),
    100,
  );
  return steps.map((s, i) => ({ id: s.id, units: units[i] ?? 0 }));
}

export const crossedLines = (lines: readonly Line[], used: number): readonly Line[] =>
  lines.filter((line) => line.tokens <= used);

export interface Readout {
  readonly step: number;
  readonly steps: number;
  readonly delta: number;
  readonly used: number;
  /** Percent of the window used. */
  readonly percent: number;
  /** The highest smart-zone line the fill has crossed. */
  readonly crossed: Line | null;
}

export function readoutAt(frames: readonly Frame[], step: number, window: WindowSize): Readout {
  const used = frames[step - 1]?.used ?? 0;
  return {
    step,
    steps: frames.length,
    delta: used - (frames[step - 2]?.used ?? 0),
    used,
    percent: (used / window.tokens) * 100,
    crossed: crossedLines(window.lines, used).at(-1) ?? null,
  };
}
