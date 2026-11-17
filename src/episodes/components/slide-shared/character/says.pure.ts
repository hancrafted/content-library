import type { EmoteProps, Mood } from './actor';

export const SAYS_FRAME = { width: 220, height: 180 } as const;

const THOUGHT_MOODS: ReadonlySet<Mood> = new Set(['thinking', 'blank']);

export const SAYS_PLACE = {
  plain: { x: 10, bottom: -14, tip: [6, -7], base: [14, 21] },
  beside: { x: 34, bottom: -6, tip: [12, -3], base: [36, 43] },
} as const;

export const saysPlace = (mood: Mood | undefined) => SAYS_PLACE[mood && THOUGHT_MOODS.has(mood) ? 'beside' : 'plain'];

const CAPTION_PIXELS = { lineHeightPixels: 21, averageGlyphPixels: 7.5 } as const;
const PAD = { x: 18, y: 10 } as const;
const wrapChars = (width: number) => Math.floor((width - PAD.x) / CAPTION_PIXELS.averageGlyphPixels);

export interface SaysFitInput {
  readonly unitPixels: number;
  readonly scale: number;
}

export function saysFit({ unitPixels, scale }: SaysFitInput): number {
  const drawn = unitPixels * scale;
  if (!(drawn > 0)) return 1;
  return Math.max(1, 1 / drawn);
}

function wrap(words: string, chars: number): readonly string[] {
  return words.split(/\s+/).reduce<string[]>((lines, word) => {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= chars) return [...lines.slice(0, -1), `${last} ${word}`];
    return [...lines, word];
  }, []);
}

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
  readonly head: { readonly x: number; readonly y: number };
  readonly figureScale: number;
  readonly saysScale?: number;
  readonly scenePixels: number;
  readonly width?: number;
  readonly lift?: number;
}

export function saysBox({
  words,
  mood,
  facing,
  head,
  figureScale,
  saysScale = 1,
  scenePixels,
  width: wrapWidth = SAYS_FRAME.width,
  lift = 0,
}: SaysBoxInput): SaysBoxResult {
  const text = words.trim();
  if (!text) throw new Error('saysBox has no words to measure; the emote draws no bubble for blank words.');
  const lines = wrap(text, wrapChars(wrapWidth));
  const longest = Math.max(...lines.map((line) => line.length));
  const css = {
    width: Math.min(wrapWidth, longest * CAPTION_PIXELS.averageGlyphPixels + PAD.x),
    height: lines.length * CAPTION_PIXELS.lineHeightPixels + PAD.y,
  };
  const scale = saysScale * saysFit({ unitPixels: scenePixels * figureScale, scale: saysScale });
  const width = css.width * scale * figureScale;
  const height = css.height * scale * figureScale;
  const place = saysPlace(mood);
  const near = head.x + (facing === 'left' ? -place.x : place.x) * figureScale;
  const bottom = head.y + (place.bottom - lift) * figureScale;
  return { x: facing === 'left' ? near - width : near, y: bottom - height, width, height };
}

const ROOM_GAP_PIXELS = 4;

export interface SaysRoomInput {
  readonly side: 1 | -1;
  readonly bubble: { readonly left: number; readonly right: number; readonly drawnPerCss: number };
  readonly picture: { readonly left: number; readonly right: number };
}

export function saysRoom({ side, bubble, picture }: SaysRoomInput): number | undefined {
  if (!(bubble.drawnPerCss > 0)) return undefined;
  if (bubble.left >= picture.left + ROOM_GAP_PIXELS && bubble.right <= picture.right - ROOM_GAP_PIXELS)
    return undefined;
  const room =
    side === 1 ? picture.right - ROOM_GAP_PIXELS - bubble.left : bubble.right - picture.left - ROOM_GAP_PIXELS;
  return Math.max(0, room) / bubble.drawnPerCss;
}
