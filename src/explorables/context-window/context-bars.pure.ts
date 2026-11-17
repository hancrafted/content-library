import { colourOf, framesOf, simpleOf } from './context.pure';
import type { Category, Chat, MiniBar, SimpleCategory, WindowSize } from './context.types';

export interface BarBlock {
  readonly key: string;
  readonly start: number;
  readonly size: number;
  readonly colour: string;
  readonly faded: boolean;
  readonly ring: boolean;
}

export interface BarModel {
  readonly blocks: readonly BarBlock[];
  readonly used: number;
  readonly total: number;
  readonly byKey: Readonly<Record<string, number>>;
  readonly bySimple: Readonly<Partial<Record<SimpleCategory, number>>>;
}

const picksLight = (bar: MiniBar): boolean => bar.lit !== null || bar.litFrom !== null || bar.ring.length > 0;

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

export function barModel(bar: MiniBar, chat: Chat | undefined, window: WindowSize): BarModel {
  if (!chat) throw new Error(`context bars: bar "${bar.label}" names no chat`);
  return chatModel(bar, chat, window);
}

export const SESSION_END = 'end';

export interface SessionPart {
  readonly id: string;
  readonly share: number;
  readonly tone: number;
  readonly state: 'done' | 'current' | 'upcoming';
  readonly side: 'start' | 'end';
}

export function sessionParts(
  sections: readonly { readonly id: string; readonly share: number }[],
  at: string | null,
): SessionPart[] {
  const ended = at === SESSION_END;
  const current = at === null ? -1 : ended ? sections.length : sections.findIndex((section) => section.id === at);
  if (at !== null && current < 0) throw new Error(`session bar: unknown Section "${at}"`);
  let start = 0;
  return sections.map((section, i): SessionPart => {
    const middle = start + section.share / 2;
    start += section.share;
    const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
    return { ...section, tone: i, state, side: middle > 50 ? 'end' : 'start' };
  });
}
