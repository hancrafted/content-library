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

/** A box in the Scene's units, from its top-left corner. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const SCENE = { width: 1200, height: 800 } as const;
const WATERLINE = 400;

/** The ship, zoomed out: its waterline amidships, and its scale against its own units. */
export const SHIP = { x: 300, scale: 1.3 } as const;

/** The close-up of the cabin, a framed window onto the ship's bridge, right of the ship. */
export const CLOSE_UP: Box = { x: 600, y: 175, width: 580, height: 420 };
/** The cabin's floor line inside the close-up; the floor runs from here to the close-up's bottom. */
export const FLOOR_Y = 560;

/** One scale for the crew inside the close-up; the console is drawn smaller, as in the room it stands in. */
export const CREW_SCALE = 1.9;
export const CONSOLE = { x: 625, width: 110, scale: 0.9 } as const;
export const DESK_TOP = FLOOR_Y - CONSOLE_DESK_HEIGHT * CONSOLE.scale;
/** Where the captain stands, facing the pilot. */
export const CAPTAIN_X = 1010;
/**
 * The shared speech bubble's words drawn at caption size, turned down to read at Slide size in the close-up: the
 * drawing hands this number to the shared bubble as `--says-scale`, and the layout measures with it.
 */
export const SAYS_SCALE = 0.6;

/** The project brief framed on the cabin wall, the dive manual open on the desk, the procedure card out of it. */
export const BRIEF: Box = { x: 1075, y: 250, width: 94, height: 87 };
export const MANUAL: Box = { x: 680, y: DESK_TOP - 8, width: 44, height: 8 };
export const CARD = { x: 612, y: 300, width: 70, height: 80, tilt: -6 } as const;

/** The three things to remember, numbered in the Voice script's order. */
export type CalloutSlug = 'skill' | 'description' | 'project';

/**
 * Each callout's place, in the Scene's units: the middle of its label's foot, where its leader starts. The labels sit
 * in the sky over the close-up, clear of the ship's mast and high enough that a phone's bubble keeps off them.
 */
export const CALLOUTS: readonly { readonly slug: CalloutSlug; readonly at: { x: number; y: number } }[] = [
  { slug: 'skill', at: { x: 470, y: 130 } },
  { slug: 'description', at: { x: 700, y: 130 } },
  { slug: 'project', at: { x: 1020, y: 130 } },
];

/** Where each leader ends: on the card's top, on the manual's index, on the brief's top. */
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
/** The narrowest Scene that shows a label's full words: the Slide's `@4xl` container, 56rem. */
const NARROWEST_FULL_LABEL_PX = 896;
/** The Scene on a 375 px phone: the viewport less the Content area's 1rem insets. */
const PHONE_SCENE_WIDTH_PX = 343;
/** Screen pixels per Scene unit at the two widths the layout is held at. */
export const FULL_LABEL_SCENE_PX = NARROWEST_FULL_LABEL_PX / SCENE.width;
export const PHONE_SCENE_PX = PHONE_SCENE_WIDTH_PX / SCENE.width;
/** A label's padding and border (`px-3 py-1 border-2`); a narrow Scene's badge shows its number, one glyph wide. */
const LABEL_PAD = { x: 24 + 4, y: 8 + 4 } as const;
const NUMBER_GLYPH = 9;

/** The words a callout shows: the AI term at body size, the scene's word beneath at caption size. */
export interface CalloutWords {
  readonly slug: CalloutSlug;
  readonly term: string;
  readonly scene: string;
}

export interface CloseUpWords {
  /** What the captain asks for. */
  readonly request: string;
  readonly callouts: Readonly<Record<CalloutSlug, CalloutWords>>;
  /** Screen pixels per Scene unit; the narrowest Scene with full labels when left out. */
  readonly scenePx?: number;
}

export interface CloseUpLayout {
  readonly labels: readonly { readonly slug: CalloutSlug; readonly box: Box }[];
  readonly says: Box;
  /** Where the bubble must stay: the close-up where labels show their words, the whole Scene on a phone. */
  readonly bounds: Box;
  /** Screen pixels per Scene unit the layout was measured at. */
  readonly scenePx: number;
}

/** A label's box at `scenePx`, centred on its foot: its full words, or its number badge below `@4xl`. */
function labelBox(at: { x: number; y: number }, words: CalloutWords, scenePx: number): Box {
  const full = scenePx >= FULL_LABEL_SCENE_PX;
  const px = full
    ? Math.max(words.term.length * BODY.glyph, words.scene.length * CAPTION.glyph) + LABEL_PAD.x
    : NUMBER_GLYPH + LABEL_PAD.x;
  const textHeight = full ? BODY.size * BODY.leading + CAPTION.size * CAPTION.leading : CAPTION.size * CAPTION.leading;
  const width = px / scenePx;
  const height = (textHeight + LABEL_PAD.y) / scenePx;
  return { x: at.x - width / 2, y: at.y - height, width, height };
}

/** The captain's speech bubble in the Scene: rising left of her head, as the shared `Emote` draws a figure facing left. */
function saysIn(request: string, scenePx: number): Box {
  const head = drawFigure(captain, 'point').anchor;
  return saysBox({
    words: request,
    facing: 'left',
    head: { x: CAPTAIN_X - head.x * CREW_SCALE, y: FLOOR_Y + head.y * CREW_SCALE },
    figureScale: CREW_SCALE,
    saysScale: SAYS_SCALE,
    scenePx,
  });
}

const SCENE_BOX: Box = { x: 0, y: 0, width: SCENE.width, height: SCENE.height };

/** Every box the Slide's words take in the Scene at `scenePx`, for the captain's line and the three callouts. */
export function closeUpLayout({ request, callouts, scenePx = FULL_LABEL_SCENE_PX }: CloseUpWords): CloseUpLayout {
  return {
    labels: CALLOUTS.map(({ slug, at }) => ({ slug, box: labelBox(at, callouts[slug], scenePx) })),
    says: saysIn(request, scenePx),
    bounds: scenePx >= FULL_LABEL_SCENE_PX ? CLOSE_UP : SCENE_BOX,
    scenePx,
  };
}

const overlap = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/** The air the bubble keeps from a label, in CSS pixels, so the two never read as touching. */
const LABEL_GAP_PX = 4;
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
export function clashes({ labels, says, bounds, scenePx }: CloseUpLayout): readonly string[] {
  const gap = LABEL_GAP_PX / scenePx;
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

/** The ship's bridge window in the Scene, where the close-up's lens lines start: a box around the ship's own window. */
export function bridgeWindow(window: Box): Box {
  return {
    x: SHIP.x + window.x * SHIP.scale,
    y: WATERLINE + window.y * SHIP.scale,
    width: window.width * SHIP.scale,
    height: window.height * SHIP.scale,
  };
}
