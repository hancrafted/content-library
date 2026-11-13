/**
 * The head of the one human body plan, as facet tables: skull and face, a face per mood, hair, headwear, and the
 * legs and chair below the hips. Drawn from the Spec's low-poly woman captain (`woman.py`) and its seated pilot
 * (`parts.py` `pilot_seated`); `poses.pure.ts` places them. Frame: facing right, `(0, 0)` the floor between the feet.
 * A facet's points are flat `x, y` pairs.
 */
import type { Mood } from './actor';
import type { Preset } from './preset';

export type Tone =
  | 'skin-lit'
  | 'skin'
  | 'skin-shade'
  | 'lips'
  | 'dark'
  | 'glint'
  | 'hair-lit'
  | 'hair'
  | 'hair-shade'
  | 'top-lit'
  | 'top'
  | 'top-shade'
  | 'collar'
  | 'trim'
  | 'legs'
  | 'legs-shade'
  | 'cap-crown'
  | 'cap-crown-shade'
  | 'ai-tag'
  | 'chair-lit'
  | 'chair'
  | 'chair-shade'
  | 'prop-lit'
  | 'prop'
  | 'prop-shade'
  | 'paper'
  | 'fill'
  | 'screen'
  | 'screen-glow';

/** Paint order, back to front. `head-back` and `head` turn together; `front-arm` carries the prop. */
export const GROUPS = ['chair', 'head-back', 'back-arm', 'legs', 'body', 'front-arm', 'head'] as const;
export type Group = (typeof GROUPS)[number];

/** One facet: its group, the body part it belongs to, its tone and its points as flat `x, y` pairs. */
export type FacetSpec = readonly [Group, string, Tone, readonly number[]];

export const SKULL_AND_FACE: readonly FacetSpec[] = [
  ['head', 'skull', 'skin-lit', [-9, -92, -7, -97, 0, -99.5, 2, -93]],
  ['head', 'skull', 'skin', [0, -99.5, 7, -98, 10, -93, 10, -91, 2, -93]],
  ['head', 'face', 'skin-lit', [-8, -92, 2, -93, 0, -84, -8, -85]],
  ['head', 'face', 'skin', [2, -93, 10, -91, 11, -84, 0, -84]],
  ['head', 'face', 'skin-lit', [-8, -85, 0, -84, -1, -77, -5, -79]],
  ['head', 'face', 'skin', [0, -84, 11, -84, 11, -81, 5, -78]],
  ['head', 'face', 'skin-lit', [10, -86, 13, -82.5, 11, -81.5]],
  ['head', 'face', 'skin-lit', [0, -84, 5, -78, 3, -75, -1, -77]],
  ['head', 'face', 'skin', [5, -78, 11, -81, 8, -76, 3, -75]],
  ['head', 'ear', 'skin-shade', [-6, -87, -2.5, -87, -2.5, -81.5, -5, -81, -6.5, -83.5]],
];

const CALM_GLINT: FacetSpec = ['head', 'eye-glint', 'glint', [7.4, -86.6, 8.4, -86.6, 8.1, -85.9]];
const CALM_EYE: FacetSpec = ['head', 'eye', 'dark', [5.5, -86.6, 8.5, -86.8, 8, -85.4, 6, -85.4]];

/** Brow, eye, its glint and the mouth, per mood; `calm` when the figure shows none. */
export const FACES: Readonly<Record<Mood | 'calm', readonly FacetSpec[]>> = {
  calm: [
    ['head', 'brow', 'hair-shade', [4, -88.5, 9, -89, 9, -88, 4, -87.6]],
    CALM_EYE,
    CALM_GLINT,
    ['head', 'mouth', 'lips', [7.4, -80.2, 10.4, -80.5, 9.6, -79.3, 7.8, -79.4]],
  ],
  happy: [
    ['head', 'brow', 'hair-shade', [4, -89.2, 9, -89.6, 9, -88.6, 4, -88.3]],
    ['head', 'eye', 'dark', [5.4, -85.6, 7, -87.2, 8.7, -85.7, 7, -86.4]],
    ['head', 'mouth', 'lips', [6.6, -80.8, 10.8, -81.4, 9.8, -78.6, 7.6, -79]],
  ],
  surprised: [
    ['head', 'brow', 'hair-shade', [4, -90.6, 9, -91.2, 9, -90.2, 4, -89.7]],
    ['head', 'eye', 'dark', [5.6, -87.6, 8.6, -87.6, 8.6, -84.8, 5.6, -84.8]],
    ['head', 'eye-glint', 'glint', [7.3, -87.2, 8.3, -87.2, 8, -86.4]],
    ['head', 'mouth', 'dark', [8, -80.6, 9.6, -80.8, 10.1, -79.2, 9.2, -77.9, 8, -78.4]],
  ],
  confused: [
    ['head', 'brow', 'hair-shade', [4, -88.2, 9, -90.6, 9, -89.6, 4, -87.4]],
    CALM_EYE,
    CALM_GLINT,
    ['head', 'mouth', 'lips', [7.6, -79.4, 10.3, -80.6, 10.2, -79.9, 7.8, -78.8]],
  ],
  thinking: [
    ['head', 'brow', 'hair-shade', [4, -88.9, 9, -88.3, 9, -87.4, 4, -88]],
    ['head', 'eye', 'dark', [5.8, -87.3, 8.6, -87.4, 8.3, -86.2, 6.1, -86.2]],
    ['head', 'eye-glint', 'glint', [7.6, -87.3, 8.5, -87.3, 8.2, -86.7]],
    ['head', 'mouth', 'lips', [8.1, -79.9, 10.2, -80, 9.9, -79.4, 8.3, -79.3]],
  ],
  blank: [
    ['head', 'brow', 'hair-shade', [4, -89.4, 9, -89.4, 9, -88.6, 4, -88.6]],
    ['head', 'eye', 'dark', [6.5, -86.6, 7.7, -86.6, 7.7, -85.4, 6.5, -85.4]],
    ['head', 'mouth', 'lips', [7.6, -79.6, 10.2, -79.6, 10.2, -79.1, 7.6, -79.1]],
  ],
};

const SHORT: readonly FacetSpec[] = [
  ['head', 'hair', 'hair-lit', [-10, -93, -7.5, -98.8, -1, -101, 1, -95, -4, -93.5, -6.5, -88]],
  ['head', 'hair', 'hair', [-1, -101, 6, -100, 10.5, -95.5, 9, -93.4, 4, -94.2, 1, -95]],
  ['head', 'hair', 'hair-shade', [-10, -93, -6.5, -88, -6.5, -82, -9, -80.5, -10.5, -86]],
  ['head', 'hair', 'hair', [-2.6, -93, -1.6, -88.4, -2.4, -87.4]],
];

export const HAIR: Readonly<Record<Preset['hair'], readonly FacetSpec[]>> = {
  long: [
    ['head-back', 'hair-back', 'hair-shade', [-13, -97, -4, -100, -3, -80, -8, -62, -13, -60, -17, -72, -16, -86]],
    ['head-back', 'hair-back', 'hair-shade', [-17, -72, -13, -60, -18, -62]],
    ['head-back', 'hair-back', 'hair', [-8, -62, -3, -80, -1, -66]],
    ['head', 'hair', 'hair-lit', [-10, -93, -7, -99.5, 1, -101, 3, -95, -2, -95]],
    ['head', 'hair', 'hair', [1, -101, 8, -99, 11, -94, 3, -95]],
    ['head', 'hair', 'hair', [-9, -95, -1, -95, 1, -88, -1, -79, -4, -72, -8, -76, -10, -86]],
    ['head', 'hair', 'hair-lit', [-9, -95, -4, -95, -6, -84, -9, -80, -10, -88]],
    ['head', 'hair', 'hair-lit', [-1, -95, 1, -88, -1, -82, -3, -90]],
    ['head', 'hair', 'hair', [-4, -72, -1, -79, 1, -73, -1, -67]],
    ['head', 'hair', 'hair', [-2, -95, 10, -94, 6, -91.5, 2, -90, 0, -88]],
    ['head', 'hair', 'hair-lit', [-2, -95, 5, -94.5, 0, -91]],
  ],
  short: SHORT,
  bun: [
    ['head-back', 'bun', 'hair-shade', [-14, -97, -12, -101.5, -8, -101.5, -6, -97.5, -8, -94, -12, -94]],
    ['head-back', 'bun', 'hair-lit', [-14, -97, -12, -101.5, -9, -101, -11, -97]],
    ...SHORT,
  ],
  none: [],
};

export const HEADWEAR: Readonly<Record<NonNullable<Preset['headwear']>, readonly FacetSpec[]>> = {
  'captain-cap': [
    ['head', 'headwear', 'cap-crown', [-11, -101, 0, -106, 12, -103, 12, -96, -10, -96]],
    ['head', 'headwear', 'cap-crown-shade', [3, -105.6, 12, -103, 12, -96, 3, -96]],
    ['head', 'headwear', 'dark', [-10, -97, 12, -97, 12, -93.5, -10, -93.5]],
    ['head', 'headwear', 'trim', [-10, -94.5, 12, -94.5, 12, -93.8, -10, -93.8]],
    ['head', 'headwear', 'dark', [10, -94.3, 20, -93, 16, -91.6, 10, -92.2]],
    ['head', 'headwear', 'trim', [1, -99.5, 3.5, -102, 6, -99.5, 3.5, -97]],
    ['head', 'headwear', 'glint', [2.6, -100.4, 3.5, -101.3, 4.2, -100.4]],
  ],
  cap: [
    ['head', 'headwear', 'top-lit', [-10, -98, 0, -102, 3, -101.6, 1, -93, -11, -93]],
    ['head', 'headwear', 'top-shade', [3, -101.6, 10, -99, 11.5, -93, 1, -93]],
    ['head', 'headwear', 'dark', [-11.5, -94, 11.5, -94, 11.5, -92.2, -11.5, -92.2]],
    ['head', 'headwear', 'dark', [10, -94, 19, -93, 17, -91, 10, -92.2]],
  ],
};

/** The top of the head, where the emote sits: the highest point of whatever the head wears. */
export function anchorY(preset: Preset): number {
  if (preset.headwear) return { 'captain-cap': -106, cap: -102 }[preset.headwear];
  return { long: -101, short: -101, bun: -101.5, none: -99.5 }[preset.hair];
}

export const LEGS: Readonly<Record<'standing' | 'seated', readonly FacetSpec[]>> = {
  standing: [
    ['legs', 'leg', 'legs', [-10, -44, -1, -44, -2, -4, -8, -4]],
    ['legs', 'leg', 'legs-shade', [-1, -44, 9, -44, 7, -4, 1, -4]],
    ['legs', 'shoe', 'dark', [-10, -4, -1, -4, 3, 0, -10, 0]],
    ['legs', 'shoe', 'dark', [1, -4, 8, -4, 13, 0, 1, 0]],
  ],
  seated: [
    ['chair', 'chair', 'chair-lit', [-22, -62, -15, -62, -12, -26, -20, -26]],
    ['chair', 'chair', 'chair', [-20, -30, 12, -30, 12, -24, -20, -24]],
    ['chair', 'chair', 'chair', [-4, -24, 0, -24, 0, -6, -4, -6]],
    ['chair', 'chair', 'chair-shade', [-16, -6, 14, -6, 12, 0, -14, 0]],
    ['legs', 'thigh', 'legs', [-12, -40, 16, -38, 16, -30, -12, -30]],
    ['legs', 'thigh', 'legs-shade', [-12, -34, 16, -32, 16, -30, -12, -30]],
    ['legs', 'shin', 'legs-shade', [10, -38, 17, -38, 19, -4, 12, -4]],
    ['legs', 'shoe', 'dark', [11, -4, 19, -4, 26, 0, 11, 0]],
  ],
};
