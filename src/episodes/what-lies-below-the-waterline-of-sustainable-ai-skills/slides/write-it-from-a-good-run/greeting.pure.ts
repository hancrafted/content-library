import type { BubblePlace, Mood } from '@/episodes/components/slide-shared/character/actor';
import { drawFigure } from '@/episodes/components/slide-shared/character/poses.pure';
import { saysBox, type SaysBoxResult } from '@/episodes/components/slide-shared/character/says.pure';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { PANEL_ART } from './room-facets';

export const FIGURE_SCALE = 1.2;
export const MORNING_PILOT = { x: 212, mood: 'blank' satisfies Mood } as const;
export const GREETING_BUBBLE: BubblePlace = { width: 140 };
export const GREETING_SAYS_SCALE = 0.5;
export const NARROWEST_PICTURE_PIXELS = 240;

export function greetingBox(words: string, picturePixels: number): SaysBoxResult {
  const anchor = drawFigure(pilot, 'sit', MORNING_PILOT.mood).anchor;
  return saysBox({
    ...GREETING_BUBBLE,
    words,
    mood: MORNING_PILOT.mood,
    facing: 'left',
    head: { x: MORNING_PILOT.x - anchor.x * FIGURE_SCALE, y: PANEL_ART.floor + anchor.y * FIGURE_SCALE },
    figureScale: FIGURE_SCALE,
    saysScale: GREETING_SAYS_SCALE,
    scenePixels: picturePixels / PANEL_ART.width,
  });
}
