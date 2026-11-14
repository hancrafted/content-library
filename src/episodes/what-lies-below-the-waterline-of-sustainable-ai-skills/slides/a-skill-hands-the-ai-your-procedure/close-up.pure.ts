/*
 * The layout of "A skill hands the AI your procedure" in `ZoneScene`'s 1200 by 800 space (feedback 3, item 7): the
 * whole research ship at the Surface with the robot in the water, and a close-up of its bridge, the cabin, beside it.
 * The callout labels sit in the sky above the close-up, the captain's speech bubble inside it; `clashes` names any
 * label the bubble would cover, so a longer line or a moved figure fails the Slide's test, not Han's eye.
 */
import { drawFigure } from '@/episodes/components/slide-shared/character/poses.pure';
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
 * in the sky over the close-up, clear of the ship's mast.
 */
export const CALLOUTS: readonly { readonly slug: CalloutSlug; readonly at: { x: number; y: number } }[] = [
  { slug: 'skill', at: { x: 470, y: 150 } },
  { slug: 'description', at: { x: 700, y: 150 } },
  { slug: 'project', at: { x: 1020, y: 150 } },
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
const LABEL_PAD = { x: 24 + 4, y: 8 + 4 } as const;

/** The shared bubble's box in figure units (`emote.tsx`): 220 wide, wrapping at about 28 characters. */
const BUBBLE = { width: 220, chars: 28, pad: { x: 16 + 2, y: 8 + 2 }, offset: { x: 10, bottom: -14 } } as const;

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
}

export interface CloseUpLayout {
  readonly labels: readonly { readonly slug: CalloutSlug; readonly box: Box }[];
  readonly says: Box;
}

/** A label's box at the narrowest Scene that shows its full words, centred on its foot. */
function labelBox(at: { x: number; y: number }, words: CalloutWords): Box {
  const unit = SCENE.width / NARROWEST_FULL_LABEL_PX;
  const px = Math.max(words.term.length * BODY.glyph, words.scene.length * CAPTION.glyph) + LABEL_PAD.x;
  const height = (BODY.size * BODY.leading + CAPTION.size * CAPTION.leading + LABEL_PAD.y) * unit;
  const width = px * unit;
  return { x: at.x - width / 2, y: at.y - height, width, height };
}

/** The lines the words wrap into at the bubble's width, by whole words. */
function wrap(words: string, chars: number): readonly string[] {
  return words.split(/\s+/).reduce<string[]>((lines, word) => {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= chars) return [...lines.slice(0, -1), `${last} ${word}`];
    return [...lines, word];
  }, []);
}

/** The captain's speech bubble in the Scene: rising left of her head, as the shared `Emote` draws a figure facing left. */
function saysBox(request: string): Box {
  const lines = wrap(request.trim(), BUBBLE.chars);
  const longest = Math.max(...lines.map((line) => line.length));
  const width = Math.min(BUBBLE.width, longest * CAPTION.glyph + BUBBLE.pad.x);
  const height = lines.length * CAPTION.size * CAPTION.leading + BUBBLE.pad.y;
  const head = drawFigure(captain, 'point').anchor;
  const anchor = { x: CAPTAIN_X - head.x * CREW_SCALE, y: FLOOR_Y + head.y * CREW_SCALE };
  const right = anchor.x - BUBBLE.offset.x * CREW_SCALE;
  const bottom = anchor.y + BUBBLE.offset.bottom * CREW_SCALE;
  const scale = CREW_SCALE * SAYS_SCALE;
  return { x: right - width * scale, y: bottom - height * scale, width: width * scale, height: height * scale };
}

/** Every box the Slide's words take in the Scene, for the captain's line and the three callouts. */
export function closeUpLayout({ request, callouts }: CloseUpWords): CloseUpLayout {
  return {
    labels: CALLOUTS.map(({ slug, at }) => ({ slug, box: labelBox(at, callouts[slug]) })),
    says: saysBox(request),
  };
}

const overlap = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

const inScene = (box: Box) => box.x >= 0 && box.y >= 0 && box.x + box.width <= SCENE.width;

/**
 * What breaks the layout, in words: `says covers <label>` when the bubble covers a label, `<label> covers <label>`
 * when two labels meet, `<label> leaves the scene` past its edges, and `says leaves the close-up`. Empty when the
 * layout holds.
 */
export function clashes({ labels, says }: CloseUpLayout): readonly string[] {
  const covered = labels.filter(({ box }) => overlap(box, says)).map(({ slug }) => `says covers ${slug}`);
  const crowded = labels.flatMap(({ slug, box }, index) =>
    labels
      .slice(index + 1)
      .filter((other) => overlap(box, other.box))
      .map((other) => `${slug} covers ${other.slug}`),
  );
  const outside = labels.filter(({ box }) => !inScene(box)).map(({ slug }) => `${slug} leaves the scene`);
  const escaped = says.y < CLOSE_UP.y || says.x < CLOSE_UP.x ? ['says leaves the close-up'] : [];
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
