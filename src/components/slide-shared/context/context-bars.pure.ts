import { colourOf, framesOf, simpleOf } from './context.pure';
import type { Category, Chat, MiniBar, SimpleCategory, WindowSize } from './context.types';

/* The static bars' model: a bar as blocks on a scale, drawn from a chat. Pure. */

/** One block of a static bar, on a scale of `total` units (tokens). */
export interface BarBlock {
  readonly key: string;
  readonly start: number;
  readonly size: number;
  /** The colour custom property the block takes its tint from. */
  readonly colour: string;
  readonly faded: boolean;
  readonly ring: boolean;
}

export interface BarModel {
  readonly blocks: readonly BarBlock[];
  /** What the blocks add up to, in tokens. */
  readonly used: number;
  /** The whole scale: the window's tokens. */
  readonly total: number;
  /** Tokens by block key and by Simple category, for a Slide's legend. */
  readonly byKey: Readonly<Record<string, number>>;
  readonly bySimple: Readonly<Partial<Record<SimpleCategory, number>>>;
}

/** Whether the bar keeps only some of its blocks in colour. */
const picksLight = (bar: MiniBar): boolean => bar.lit !== null || bar.litFrom !== null || bar.ring.length > 0;

/** Whether a block stays in colour: its category, its step or its ring says so. */
function isLit(bar: MiniBar, chat: Chat, block: { readonly id: string; readonly cat: Category }): boolean {
  if (bar.ring.includes(block.id) || (bar.lit ?? []).includes(simpleOf(block.cat))) return true;
  if (bar.litFrom === null) return false;
  const index = (id: string) => chat.steps.findIndex((step) => step.id === id);
  return index(block.id) >= index(bar.litFrom);
}

function chatModel(bar: MiniBar, chat: Chat, window: WindowSize): BarModel {
  const frames = framesOf(chat);
  const frame = frames[bar.step - 1] ?? frames.at(-1);
  const colouring = picksLight(bar);
  const byKey: Record<string, number> = {};
  const bySimple: Partial<Record<SimpleCategory, number>> = {};
  const blocks = (frame?.blocks ?? []).map((block): BarBlock => {
    byKey[block.key] = block.tokens;
    bySimple[simpleOf(block.cat)] = (bySimple[simpleOf(block.cat)] ?? 0) + block.tokens;
    return {
      key: block.key,
      start: block.start,
      size: block.tokens,
      colour: colourOf(block.cat, 'simple'),
      faded: colouring && !isLit(bar, chat, block),
      ring: bar.ring.includes(block.id),
    };
  });
  return { blocks, used: frame?.used ?? 0, total: window.tokens, byKey, bySimple };
}

/** A bar as blocks on a scale. */
export function barModel(bar: MiniBar, chat: Chat | undefined, window: WindowSize): BarModel {
  if (!chat) throw new Error(`context bars: bar "${bar.label}" names no chat`);
  return chatModel(bar, chat, window);
}

/** `1 h 22 min`, `82 min` under an hour: a number of minutes as a caption says it. */
export function durationText(minutes: number, words: { readonly hours: string; readonly minutes: string }): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} ${words.minutes}`;
  return rest === 0 ? `${hours} ${words.hours}` : `${hours} ${words.hours} ${rest} ${words.minutes}`;
}

export interface SessionPart {
  readonly id: string;
  readonly share: number;
  readonly state: 'done' | 'current' | 'upcoming';
  /** Which edge the current part's name hangs from, so it stays inside the bar. */
  readonly side: 'start' | 'end';
}

/** The session's Sections as parts: filled up to and including `at`, none for a fresh session (`at` null). */
export function sessionParts(
  sections: readonly { readonly id: string; readonly share: number }[],
  at: string | null,
): SessionPart[] {
  const current = at === null ? -1 : sections.findIndex((section) => section.id === at);
  if (at !== null && current < 0) throw new Error(`session bar: unknown Section "${at}"`);
  let start = 0;
  return sections.map((section, i): SessionPart => {
    const middle = start + section.share / 2;
    start += section.share;
    const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
    return { ...section, state, side: middle > 50 ? 'end' : 'start' };
  });
}
