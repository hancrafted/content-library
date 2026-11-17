import type { BubblePlace } from '@/episodes/components/slide-shared/character/actor';
import { drawFigure } from '@/episodes/components/slide-shared/character/poses.pure';
import { saysBox } from '@/episodes/components/slide-shared/character/says.pure';
import { captain } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';

export const ART_SCALE = 1.2;
export const ART_TOP = 800 - 640 * ART_SCALE;
export const FLOOR = ART_TOP + 584 * ART_SCALE;
export const CREW_SCALE = 2.3;
export const CAPTAIN_X = 40;

export const REQUEST_BUBBLE: BubblePlace = { lift: 24 };
export const REQUEST_SAYS_SCALE = 0.5;

export const WIDE_PICTURE_PIXELS = 1024;

export interface OverlayBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const OVERLAY = { width: 1000, height: 640 } as const;
const PER_OVERLAY = ART_SCALE;

const PILL: OverlayBox = { x: 250, y: 330, width: 450, height: 34 };
const INDEX_LEFT = 548;
const GAP = 6;

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

export function requestClashes(box: OverlayBox): readonly string[] {
  const leaves = box.x < 0 || box.y < 0 || box.x + box.width > OVERLAY.width;
  return [
    ...(meet(box, PILL, GAP) ? ['covers the match pill'] : []),
    ...(box.x + box.width + GAP > INDEX_LEFT ? ['covers the skill index'] : []),
    ...(leaves ? ['leaves the picture'] : []),
  ];
}

export function requestLines(box: OverlayBox) {
  const right = box.x + box.width;
  return {
    content: { x: right, y: box.y + box.height * 0.35 },
    moment: { x: right, y: box.y + box.height * 0.7 },
  };
}
