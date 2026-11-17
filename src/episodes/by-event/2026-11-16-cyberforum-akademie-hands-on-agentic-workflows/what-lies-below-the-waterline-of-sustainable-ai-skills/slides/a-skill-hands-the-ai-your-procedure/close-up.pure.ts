/*
 * The layout of "A skill hands the AI your procedure" in `ZoneScene`'s 1200 by 800 space (feedback 3, item 7): the
 * whole research ship at the Surface with the robot in the water, and a close-up of its bridge, the cabin, beside it.
 * The callout labels sit in the sky above the close-up, the captain's speech bubble inside it; `clashes` names any
 * label the bubble would cover, so a longer line or a moved figure fails the Slide's test, not Han's eye.
 */
import { drawFigure } from '@/episodes/components/slide-shared/character/poses.pure';
import { saysBox } from '@/episodes/components/slide-shared/character/says.pure';
import { captain } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { CONSOLE_DESK_HEIGHT } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const SCENE = { width: 1200, height: 800 } as const;
const WATERLINE = 400;

export const SHIP = { x: 300, scale: 1.3 } as const;

export const CLOSE_UP: Box = { x: 600, y: 175, width: 580, height: 420 };
export const FLOOR_Y = 560;

export const CREW_SCALE = 1.9;
export const CONSOLE = { x: 625, width: 110, scale: 0.9 } as const;
export const DESK_TOP = FLOOR_Y - CONSOLE_DESK_HEIGHT * CONSOLE.scale;
export const CAPTAIN_X = 1010;
export const SAYS_SCALE = 0.6;

export const BRIEF: Box = { x: 1075, y: 250, width: 94, height: 87 };
export const MANUAL: Box = { x: 680, y: DESK_TOP - 8, width: 44, height: 8 };
export const CARD = { x: 612, y: 300, width: 70, height: 80, tilt: -6 } as const;

export type CalloutSlug = 'skill' | 'description' | 'project';

export const CALLOUTS: readonly { readonly slug: CalloutSlug; readonly at: { x: number; y: number } }[] = [
  { slug: 'skill', at: { x: 470, y: 130 } },
  { slug: 'description', at: { x: 700, y: 130 } },
  { slug: 'project', at: { x: 1020, y: 130 } },
];

export const LEADER_END: Readonly<Record<CalloutSlug, readonly [number, number]>> = {
  skill: [CARD.x + CARD.width / 2, CARD.y],
  description: [MANUAL.x + MANUAL.width / 2, MANUAL.y],
  project: [BRIEF.x + BRIEF.width / 2, BRIEF.y],
};

/*
 * How big the HTML words draw, in CSS pixels (globals.css: body 16 px at 1.6 line height, caption 14 px at 1.5). The
 * glyph widths are generous averages for the sans face, so a box measured here is never smaller than the one drawn.
 */
const BODY = { size: 16, leading: 1.6, glyph: 9 } as const;
const CAPTION = { size: 14, leading: 1.5, glyph: 7.5 } as const;
const NARROWEST_FULL_LABEL_PIXELS = 896;
/** The Scene on a 375 px phone: the viewport less the Content area's 1rem insets. */
const PHONE_SCENE_WIDTH_PIXELS = 343;
export const FULL_LABEL_SCENE_PIXELS = NARROWEST_FULL_LABEL_PIXELS / SCENE.width;
export const PHONE_SCENE_PIXELS = PHONE_SCENE_WIDTH_PIXELS / SCENE.width;
/** A label's padding and border (`px-3 py-1 border-2`); a narrow Scene's badge shows its number, one glyph wide. */
const LABEL_PAD = { x: 24 + 4, y: 8 + 4 } as const;
const NUMBER_GLYPH = 9;

export interface CalloutWords {
  readonly slug: CalloutSlug;
  readonly term: string;
  readonly scene: string;
}

export interface CloseUpWords {
  readonly request: string;
  readonly callouts: Readonly<Record<CalloutSlug, CalloutWords>>;
  readonly scenePixels?: number;
}

export interface CloseUpLayout {
  readonly labels: readonly { readonly slug: CalloutSlug; readonly box: Box }[];
  readonly says: Box;
  /** Where the bubble must stay: the close-up where labels show their words, the whole Scene on a phone. */
  readonly bounds: Box;
  readonly scenePixels: number;
}

function labelBox(at: { x: number; y: number }, words: CalloutWords, scenePixels: number): Box {
  const full = scenePixels >= FULL_LABEL_SCENE_PIXELS;
  const px = full
    ? Math.max(words.term.length * BODY.glyph, words.scene.length * CAPTION.glyph) + LABEL_PAD.x
    : NUMBER_GLYPH + LABEL_PAD.x;
  const textHeight = full ? BODY.size * BODY.leading + CAPTION.size * CAPTION.leading : CAPTION.size * CAPTION.leading;
  const width = px / scenePixels;
  const height = (textHeight + LABEL_PAD.y) / scenePixels;
  return { x: at.x - width / 2, y: at.y - height, width, height };
}

function saysIn(request: string, scenePixels: number): Box {
  const head = drawFigure(captain, 'point').anchor;
  return saysBox({
    words: request,
    facing: 'left',
    head: { x: CAPTAIN_X - head.x * CREW_SCALE, y: FLOOR_Y + head.y * CREW_SCALE },
    figureScale: CREW_SCALE,
    saysScale: SAYS_SCALE,
    scenePixels,
  });
}

const SCENE_BOX: Box = { x: 0, y: 0, width: SCENE.width, height: SCENE.height };

export function closeUpLayout({
  request,
  callouts,
  scenePixels = FULL_LABEL_SCENE_PIXELS,
}: CloseUpWords): CloseUpLayout {
  return {
    labels: CALLOUTS.map(({ slug, at }) => ({ slug, box: labelBox(at, callouts[slug], scenePixels) })),
    says: saysIn(request, scenePixels),
    bounds: scenePixels >= FULL_LABEL_SCENE_PIXELS ? CLOSE_UP : SCENE_BOX,
    scenePixels,
  };
}

const overlap = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/** The air the bubble keeps from a label, in CSS pixels, so the two never read as touching. */
const LABEL_GAP_PIXELS = 4;
const grow = (box: Box, by: number): Box => ({
  x: box.x - by,
  y: box.y - by,
  width: box.width + 2 * by,
  height: box.height + 2 * by,
});

const inside = (box: Box, bounds: Box) =>
  box.x >= bounds.x &&
  box.y >= bounds.y &&
  box.x + box.width <= bounds.x + bounds.width &&
  box.y + box.height <= bounds.y + bounds.height;

/**
 * What breaks the layout, in words: `says covers <label>` when the bubble covers a label or comes within 4 px of it, `<label> covers <label>`
 * when two labels meet, `<label> leaves the scene` past its edges, and `says leaves its bounds` past the close-up (or,
 * on a phone, the Scene). Empty when the layout holds.
 */
export function clashes({ labels, says, bounds, scenePixels }: CloseUpLayout): readonly string[] {
  const gap = LABEL_GAP_PIXELS / scenePixels;
  const covered = labels.filter(({ box }) => overlap(grow(box, gap), says)).map(({ slug }) => `says covers ${slug}`);
  const crowded = labels.flatMap(({ slug, box }, index) =>
    labels
      .slice(index + 1)
      .filter((other) => overlap(box, other.box))
      .map((other) => `${slug} covers ${other.slug}`),
  );
  const outside = labels
    .filter(({ box }) => box.x < 0 || box.y < 0 || box.x + box.width > SCENE.width)
    .map(({ slug }) => `${slug} leaves the scene`);
  const escaped = inside(says, bounds) ? [] : ['says leaves its bounds'];
  return [...covered, ...crowded, ...outside, ...escaped];
}

export function bridgeWindow(window: Box): Box {
  return {
    x: SHIP.x + window.x * SHIP.scale,
    y: WATERLINE + window.y * SHIP.scale,
    width: window.width * SHIP.scale,
    height: window.height * SHIP.scale,
  };
}
