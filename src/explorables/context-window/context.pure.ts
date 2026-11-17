import type { Block, Category, Chat, Depth, SimpleCategory, Step } from './context.types';

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
export const isMessage = (cat: Category): boolean => MESSAGE.has(cat);

export const colourOf = (cat: Category, depth: Depth): string =>
  depth === 'technical' ? `--cs-t-${cat}` : `--cs-s-${simpleOf(cat)}`;

export interface PlacedBlock {
  readonly key: string;
  readonly id: string;
  readonly cat: Category;
  readonly tokens: number;
  readonly start: number;
}

export interface Frame {
  readonly blocks: readonly PlacedBlock[];
  readonly used: number;
  readonly byCategory: Readonly<Partial<Record<Category, number>>>;
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

export function framesOf(chat: Chat): readonly Frame[] {
  let window: Held[] = [];
  return chat.steps.map((step) => {
    window = windowAfter(window, step);
    return frameOf(window);
  });
}

export function goneAt(chat: Chat, frames: readonly Frame[], at: { index: number; step: number }): boolean {
  const id = chat.steps[at.index]?.id ?? '';
  return at.index < at.step && !(frames[at.step - 1]?.inWindow.includes(id) ?? false);
}

export const compactStepOf = (chat: Chat): number | null => {
  const index = chat.steps.findIndex((step) => step.kind === 'compact');
  return index < 0 ? null : index + 1;
};

export const categoriesOf = (chat: Chat): ReadonlySet<Category> =>
  new Set(chat.steps.flatMap((step) => step.blocks.map((block) => block.cat)));
