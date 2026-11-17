/*
 * Where the captain and the pilot stand in the morning room, and where their speech goes (decision 53): the shared
 * `says` bubble, never an HTML one. They face each other, so their bubbles rise towards each other; the captain's is
 * lifted above the pilot's, and both wrap narrow enough to stay in the 360-unit room. `speechClashes` names what
 * breaks, so a longer line fails the Slide's test, not Han's eye.
 */
import type { BubblePlace, Mood } from '@/episodes/components/slide-shared/character/actor';
import { drawFigure } from '@/episodes/components/slide-shared/character/poses.pure';
import { saysBox, type SaysBoxResult } from '@/episodes/components/slide-shared/character/says.pure';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { ROOM_ART } from './room-facets';

export type Day = 1 | 2 | 3;

/**
 * The cast a little under the Spec's 1.3, so both bubbles fit above their heads; the captain a step left of the Spec's
 * 84, so her bubble's two lines fit the room. The pilot sits in front of the console, turned to her.
 */
export const FIGURE_SCALE = 1.1;
export const CAPTAIN_X = 60;
export const PILOT_X = 246;
/** Where the Spec stood the captain, which its written card in her hand is drawn against. */
export const SPEC_CAPTAIN = { x: 84, scale: 1.3 } as const;

/** The pilot's look each morning: puzzled, then working it through, then satisfied. */
export const PILOT_MOOD: Record<Day, Mood> = { 1: 'confused', 2: 'thinking', 3: 'happy' };

/**
 * The captain's bubble wraps wide and rises above the pilot's; the pilot's wraps narrower, at his head, and narrower
 * still on the morning he thinks, when it rises past his thought cloud.
 */
export const SPEECH: { readonly captain: BubblePlace; readonly pilot: Record<Day, BubblePlace> } = {
  captain: { width: 260, lift: 56 },
  pilot: { 1: { width: 200 }, 2: { width: 170 }, 3: { width: 200 } },
};

/**
 * The narrowest picture the comic draws, in CSS pixels: a third of the `@5xl` container (64rem) less its gaps, or half
 * of a `@2xl` one. Below about this width the shared bubble turns its words up and grows.
 */
export const NARROWEST_PICTURE_PIXELS = 320;
/** The air the two bubbles keep between them, in CSS pixels. */
const GAP_PIXELS = 4;

export interface SpeechWords {
  readonly day: Day;
  readonly captain: string;
  readonly pilot: string;
}

export interface SpeechLayout {
  readonly captain: SaysBoxResult;
  readonly pilot: SaysBoxResult;
  /** Screen pixels per room unit. */
  readonly scenePixels: number;
}

const headOf = (x: number, anchor: { x: number; y: number }, flip: boolean) => ({
  x: x + (flip ? -anchor.x : anchor.x) * FIGURE_SCALE,
  y: ROOM_ART.floor + anchor.y * FIGURE_SCALE,
});

/** Both bubbles' boxes in the room, at a picture `picturePixels` wide. */
export function speechLayout(words: SpeechWords, picturePixels: number): SpeechLayout {
  const scenePixels = picturePixels / ROOM_ART.width;
  const mood = PILOT_MOOD[words.day];
  const common = { figureScale: FIGURE_SCALE, scenePixels };
  return {
    captain: saysBox({
      ...common,
      ...SPEECH.captain,
      words: words.captain,
      head: headOf(CAPTAIN_X, drawFigure(captain, words.day === 3 ? 'hold' : 'point').anchor, false),
    }),
    pilot: saysBox({
      ...common,
      ...SPEECH.pilot[words.day],
      words: words.pilot,
      mood,
      facing: 'left',
      head: headOf(PILOT_X, drawFigure(pilot, 'sit', mood).anchor, true),
    }),
    scenePixels,
  };
}

const meet = (a: SaysBoxResult, b: SaysBoxResult, gap: number) =>
  a.x < b.x + b.width + gap && b.x < a.x + a.width + gap && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;

const leaves = (box: SaysBoxResult) => box.x < 0 || box.y < 0 || box.x + box.width > ROOM_ART.width;

/** `bubbles meet` when the two come within 4 px, `<who> leaves the picture` past its edges; empty when it holds. */
export function speechClashes({ captain: lifted, pilot: seated, scenePixels }: SpeechLayout): readonly string[] {
  return [
    ...(meet(lifted, seated, GAP_PIXELS / scenePixels) ? ['bubbles meet'] : []),
    ...(leaves(lifted) ? ['captain leaves the picture'] : []),
    ...(leaves(seated) ? ['pilot leaves the picture'] : []),
  ];
}
