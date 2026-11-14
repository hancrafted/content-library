/*
 * The next morning's greeting (decision 53): the pilot greets the captain as a stranger in the shared `says` bubble,
 * never an HTML one. His mind is blank, so the bubble rises past his empty thought cloud, towards the captain; it wraps
 * narrow so it stays in the 300-unit panel, and the panel turns the words down to their caption size
 * (`GREETING_SAYS_SCALE`), so a wide one-column picture does not draw them at heading size.
 */
import type { BubblePlace, Mood } from '@/episodes/components/slide-shared/character/actor';
import { drawFigure } from '@/episodes/components/slide-shared/character/poses.pure';
import { saysBox, type SaysBoxResult } from '@/episodes/components/slide-shared/character/says.pure';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { PANEL_ART } from './room-facets';

/** The figures at the Spec's size in its 300 by 236 panel. */
export const FIGURE_SCALE = 1.2;
/** Where the pilot sits the next morning, turned to the captain, and how he looks: blank. */
export const MORNING_PILOT = { x: 212, mood: 'blank' satisfies Mood } as const;
/** The greeting wraps at 140 caption pixels, about 16 characters. */
export const GREETING_BUBBLE: BubblePlace = { width: 140 };
/** Low enough that the bubble's own fit sets the words at caption size on every picture up to about 500 px. */
export const GREETING_SAYS_SCALE = 0.5;
/** The narrowest picture the Slide draws: a quarter of its `@5xl` container (64rem) less the gaps. */
export const NARROWEST_PICTURE_PX = 240;

/** The greeting's box in the panel's units, at a picture `picturePx` wide. */
export function greetingBox(words: string, picturePx: number): SaysBoxResult {
  const anchor = drawFigure(pilot, 'sit', MORNING_PILOT.mood).anchor;
  return saysBox({
    ...GREETING_BUBBLE,
    words,
    mood: MORNING_PILOT.mood,
    facing: 'left',
    head: { x: MORNING_PILOT.x - anchor.x * FIGURE_SCALE, y: PANEL_ART.floor + anchor.y * FIGURE_SCALE },
    figureScale: FIGURE_SCALE,
    saysScale: GREETING_SAYS_SCALE,
    scenePx: picturePx / PANEL_ART.width,
  });
}
