/*
 * Where your request goes in the control room (decision 53): the captain's shared `says` bubble, never an HTML one.
 * The room is a 1200 by 800 Scene shown bottom-aligned at 25 by 16, so its visible part is the Spec's 1000 by 640
 * space, the overlay's, in which the match pill and the skill index lie over the picture on a wide Slide. `requestBubble`
 * measures the bubble there; `requestClashes` names what it would cover, so a longer request fails the test.
 */
import type { BubblePlace } from '@/episodes/components/slide-shared/character/actor';
import { drawFigure } from '@/episodes/components/slide-shared/character/poses.pure';
import { saysBox } from '@/episodes/components/slide-shared/character/says.pure';
import { captain } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';

/** How the Spec's 1000 by 640 room fills the Scene's 1200 by 800 space: widened to 1200, its floor at the bottom. */
export const ART_SCALE = 1.2;
export const ART_TOP = 800 - 640 * ART_SCALE;
/** The room's floor line in the Scene: the Spec's floor at 584. */
export const FLOOR = ART_TOP + 584 * ART_SCALE;
export const CREW_SCALE = 2.3;
/** The captain's place on the floor, in the crew's units. */
export const CAPTAIN_X = 40;

/** The captain's bubble rises above the match pill. */
export const REQUEST_BUBBLE: BubblePlace = { lift: 24 };
/**
 * The room draws the crew at 2.3 times the figure, so the Slide turns the bubble's words down by half (`--says-scale`
 * in `slide.module.css`) to read at about caption size; on a phone the bubble turns them back up to it.
 */
export const REQUEST_SAYS_SCALE = 0.5;

/** The narrowest picture that lays the pill and the index over the room: the `@5xl` container, 64rem. */
export const WIDE_PICTURE_PIXELS = 1024;

/** A box in the overlay's 1000 by 640 units, from its top-left corner. */
export interface OverlayBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const OVERLAY = { width: 1000, height: 640 } as const;
/** Scene units per overlay unit. */
const PER_OVERLAY = ART_SCALE;

/** The match pill (`mt-[33%] ml-[25%]`, its words up to about 450 units long) and the skill index (`ml-[54.8%]`). */
const PILL: OverlayBox = { x: 250, y: 330, width: 450, height: 34 };
const INDEX_LEFT = 548;
/** The air the bubble keeps from what it must not cover, in overlay units. */
const GAP = 6;

/** The captain's bubble in the overlay, at a picture `picturePixels` wide. */
export function requestBubble(words: string, picturePixels: number): OverlayBox {
  const head = drawFigure(captain, 'point').anchor;
  const box = saysBox({
    words,
    ...REQUEST_BUBBLE,
    head: { x: (CAPTAIN_X + head.x) * CREW_SCALE, y: FLOOR + head.y * CREW_SCALE },
    figureScale: CREW_SCALE,
    saysScale: REQUEST_SAYS_SCALE,
    scenePixels: (picturePixels / OVERLAY.width) * (1 / PER_OVERLAY),
  });
  return {
    x: box.x / PER_OVERLAY,
    y: (box.y - ART_TOP) / PER_OVERLAY,
    width: box.width / PER_OVERLAY,
    height: box.height / PER_OVERLAY,
  };
}

const meet = (a: OverlayBox, b: OverlayBox, gap: number) =>
  a.x < b.x + b.width + gap && b.x < a.x + a.width + gap && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;

/** `covers the match pill`, `covers the skill index`, `leaves the picture`; empty when the bubble sits clear. */
export function requestClashes(box: OverlayBox): readonly string[] {
  const leaves = box.x < 0 || box.y < 0 || box.x + box.width > OVERLAY.width;
  return [
    ...(meet(box, PILL, GAP) ? ['covers the match pill'] : []),
    ...(box.x + box.width + GAP > INDEX_LEFT ? ['covers the skill index'] : []),
    ...(leaves ? ['leaves the picture'] : []),
  ];
}

/** Where the two lines to the index leave the bubble: the dashed one to the content line, the primary one to the moment. */
export function requestLines(box: OverlayBox) {
  const right = box.x + box.width;
  return {
    content: { x: right, y: box.y + box.height * 0.35 },
    moment: { x: right, y: box.y + box.height * 0.7 },
  };
}
