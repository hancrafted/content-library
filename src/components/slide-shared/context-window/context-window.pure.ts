import type { Block, Category, Chat, Depth, MiniBar, SimpleCategory, Step, WindowSize } from './context-window.types';

/*
 * The context window cornerstone's model core: categories and the window at every step. Pure, word-free and DOM-free;
 * lifted from the prototype's cornerstone-model block (.scratch/ai-attention-span/prototype/cornerstone.html), with the
 * System reminders category, the cleared step and per-step frames computed once. Usage, attention and the grid are in
 * context-usage.pure.ts, the view state in context-state.pure.ts.
 */

/** Every Technical category in /context order, and the Simple category it folds into. */
export const CATEGORIES: readonly {
  readonly cat: Category;
  readonly simple: SimpleCategory;
  readonly message: boolean;
}[] = [
  { cat: 'sysprompt', simple: 'start', message: false },
  { cat: 'systools', simple: 'start', message: false },
  { cat: 'mcp', simple: 'start', message: false },
  { cat: 'skills', simple: 'start', message: false },
  { cat: 'memory', simple: 'memory', message: false },
  { cat: 'reminder', simple: 'reminder', message: true },
  { cat: 'user', simple: 'you', message: true },
  { cat: 'assistant', simple: 'ai', message: true },
  { cat: 'tool_use', simple: 'ai', message: true },
  { cat: 'tool_result', simple: 'read', message: true },
  { cat: 'summary', simple: 'summary', message: true },
];

export const SIMPLE_CATEGORIES: readonly SimpleCategory[] = [
  'start',
  'memory',
  'you',
  'ai',
  'read',
  'reminder',
  'summary',
];

const SIMPLE_OF = new Map(CATEGORIES.map(({ cat, simple }) => [cat, simple]));
const MESSAGE = new Set(CATEGORIES.filter(({ message }) => message).map(({ cat }) => cat));

export const simpleOf = (cat: Category): SimpleCategory => SIMPLE_OF.get(cat) ?? 'start';
/** A category a compaction folds into the summary: everything after the starting instructions and memory. */
export const isMessage = (cat: Category): boolean => MESSAGE.has(cat);

/** The colour token of a category at a depth, a custom property of the component's stylesheet. */
export const colourOf = (cat: Category, depth: Depth): string =>
  depth === 'technical' ? `--cs-t-${cat}` : `--cs-s-${simpleOf(cat)}`;

/** One block in the window at a step, with its offset from the top of the window in tokens. */
export interface PlacedBlock {
  /** `<step id>@<category>`: a block's identity across steps. */
  readonly key: string;
  readonly id: string;
  readonly cat: Category;
  readonly tokens: number;
  readonly start: number;
}

/** The window after one step. */
export interface Frame {
  readonly blocks: readonly PlacedBlock[];
  readonly used: number;
  readonly byCategory: Readonly<Partial<Record<Category, number>>>;
  /** Step ids with at least one block in the window. */
  readonly inWindow: readonly string[];
}

interface Held {
  readonly id: string;
  readonly cat: Category;
  readonly tokens: number;
}

export const stepTokens = (step: Step): number => step.blocks.reduce((sum: number, b: Block) => sum + b.tokens, 0);

function frameOf(window: readonly Held[]): Frame {
  let start = 0;
  const byCategory: Partial<Record<Category, number>> = {};
  const blocks = window.map((block) => {
    const placed = { key: `${block.id}@${block.cat}`, ...block, start };
    start += block.tokens;
    byCategory[block.cat] = (byCategory[block.cat] ?? 0) + block.tokens;
    return placed;
  });
  return { blocks, used: start, byCategory, inWindow: [...new Set(window.map((b) => b.id))] };
}

/** Clears `tokens` of the oldest tool results: whole blocks first, the last one shrinks. */
function clearToolResults(window: readonly Held[], tokens: number): Held[] {
  let left = tokens;
  return window.flatMap((block) => {
    if (block.cat !== 'tool_result' || left <= 0) return [block];
    const taken = Math.min(left, block.tokens);
    left -= taken;
    return block.tokens > taken ? [{ ...block, tokens: block.tokens - taken }] : [];
  });
}

function windowAfter(window: readonly Held[], step: Step): Held[] {
  let kept: readonly Held[] = window;
  if (step.kind === 'compact') kept = window.filter((block) => !isMessage(block.cat));
  if (step.kind === 'cleared') kept = clearToolResults(window, step.cleared);
  return [...kept, ...step.blocks.map((block) => ({ id: step.id, cat: block.cat, tokens: block.tokens }))];
}

/**
 * The window after each step, index 0 for step 1, computed once per chat. A compaction drops every message block
 * before it (the starting instructions and memory are loaded again); a cleared step removes the oldest tool results.
 */
export function framesOf(chat: Chat): readonly Frame[] {
  let window: Held[] = [];
  return chat.steps.map((step) => {
    window = windowAfter(window, step);
    return frameOf(window);
  });
}

/** Whether the step at `index` (0-based) was in the window but a compaction or clearing removed it by `step`. */
export function goneAt(chat: Chat, frames: readonly Frame[], at: { index: number; step: number }): boolean {
  const id = chat.steps[at.index]?.id ?? '';
  return at.index < at.step && !(frames[at.step - 1]?.inWindow.includes(id) ?? false);
}

/** The 1-based step of the chat's first compaction, or null. */
export const compactStepOf = (chat: Chat): number | null => {
  const index = chat.steps.findIndex((step) => step.kind === 'compact');
  return index < 0 ? null : index + 1;
};

/** Which categories a chat ever holds, so its rows stay fixed while it steps. */
export const categoriesOf = (chat: Chat): ReadonlySet<Category> =>
  new Set(chat.steps.flatMap((step) => step.blocks.map((block) => block.cat)));

/** A static mini bar: the window of a chat at a step, its last step when the step is past its end. */
export function miniFigure(chat: Chat, bar: Pick<MiniBar, 'step'>, window: WindowSize) {
  const frames = framesOf(chat);
  const frame = frames[bar.step - 1] ?? frames.at(-1);
  const used = frame?.used ?? 0;
  return { blocks: frame?.blocks ?? [], used, percent: (used / window.tokens) * 100 };
}
