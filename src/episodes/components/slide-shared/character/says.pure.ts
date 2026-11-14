/*
 * The shared speech bubble's size rule (decision 53) and its measure. The words are set at the caption role, one figure
 * unit per CSS pixel; a Scene draws its figures at any scale, and a Slide may turn them down with `--says-scale`. On a
 * phone that once drew them at 5 px. `saysFit` is the factor the bubble turns itself up by, so its words never draw
 * smaller than their caption size; `saysBox` is the bubble's box in a Scene's units, for a Slide's overlap test.
 */
import type { EmoteProps, Mood } from './actor';

/** The bubble's box in figure units: by default its words wrap inside 220, bottom-aligned in a 180-tall frame. */
export const SAYS_FRAME = { width: 220, height: 180 } as const;

const THOUGHT_MOODS: ReadonlySet<Mood> = new Set(['thinking', 'blank']);

/**
 * Where the bubble sits, facing right: beside the head, or past a thought cloud with its tail from the head's front, so
 * the two never overlap. `x` is the bubble's near edge, `tip` the tail's point, `base` the tail's foot on the bubble.
 */
export const SAYS_PLACE = {
  plain: { x: 10, bottom: -14, tip: [6, -7], base: [14, 21] },
  beside: { x: 34, bottom: -6, tip: [12, -3], base: [36, 43] },
} as const;

export const saysPlace = (mood: Mood | undefined) => SAYS_PLACE[mood && THOUGHT_MOODS.has(mood) ? 'beside' : 'plain'];

/*
 * The caption's metrics in CSS pixels (globals.css: 14 px at 1.5 line height), with a generous average glyph for the
 * sans face, so a measured box is never smaller than the drawn one; the padding is the bubble's `px-2 py-1` and border.
 */
const CAPTION = { lineHeight: 21, glyph: 7.5 } as const;
const PAD = { x: 18, y: 10 } as const;
const wrapChars = (width: number) => Math.floor((width - PAD.x) / CAPTION.glyph);

export interface SaysFitInput {
  /** Screen pixels per figure unit where the bubble hangs, before its own scale; 0 in a hidden picture. */
  readonly unitPx: number;
  /** The Scene's `--says-scale`, 1 when unset. */
  readonly scale: number;
}

/** How much the bubble turns itself up so its words draw at least at their caption size; 1 when they already do. */
export function saysFit({ unitPx, scale }: SaysFitInput): number {
  const drawn = unitPx * scale;
  if (!(drawn > 0)) return 1;
  return Math.max(1, 1 / drawn);
}

/** The lines the words wrap into at the bubble's width, by whole words. */
function wrap(words: string, chars: number): readonly string[] {
  return words.split(/\s+/).reduce<string[]>((lines, word) => {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= chars) return [...lines.slice(0, -1), `${last} ${word}`];
    return [...lines, word];
  }, []);
}

/** A box in a Scene's units, from its top-left corner. */
export interface SaysBoxResult {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface SaysBoxInput {
  readonly words: string;
  readonly mood?: Mood;
  readonly facing?: EmoteProps['facing'];
  /** The figure's head anchor, in the Scene's units. */
  readonly head: { readonly x: number; readonly y: number };
  /** Scene units per figure unit: the scale the Scene places the figure at. */
  readonly figureScale: number;
  /** The Scene's `--says-scale`, 1 when left out. */
  readonly saysScale?: number;
  /** Screen pixels per Scene unit at the width under test. */
  readonly scenePx: number;
  /** The bubble's wrap width and lift, as the Character's `bubble` prop gives them. */
  readonly width?: number;
  readonly lift?: number;
}

/** The bubble's box in the Scene's units, at the width `scenePx` stands for, fit included. */
export function saysBox({
  words,
  mood,
  facing,
  head,
  figureScale,
  saysScale = 1,
  scenePx,
  width: wrapWidth = SAYS_FRAME.width,
  lift = 0,
}: SaysBoxInput): SaysBoxResult {
  const text = words.trim();
  if (!text) throw new Error('saysBox has no words to measure; the emote draws no bubble for blank words.');
  const lines = wrap(text, wrapChars(wrapWidth));
  const longest = Math.max(...lines.map((line) => line.length));
  const css = {
    width: Math.min(wrapWidth, longest * CAPTION.glyph + PAD.x),
    height: lines.length * CAPTION.lineHeight + PAD.y,
  };
  const scale = saysScale * saysFit({ unitPx: scenePx * figureScale, scale: saysScale });
  const width = css.width * scale * figureScale;
  const height = css.height * scale * figureScale;
  const place = saysPlace(mood);
  const near = head.x + (facing === 'left' ? -place.x : place.x) * figureScale;
  const bottom = head.y + (place.bottom - lift) * figureScale;
  return { x: facing === 'left' ? near - width : near, y: bottom - height, width, height };
}
