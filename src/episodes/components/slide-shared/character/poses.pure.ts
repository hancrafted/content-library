/**
 * The body plan every `Character` shares, as geometry: preset × pose × mood → the faceted parts to draw, the head anchor
 * the emote sits at, and the pivots the motions turn on (design-ADR 0025, "Scene figures are deep modules").
 *
 * Frame: the figure faces right (+x), `(0, 0)` is the floor between the feet, the crown of a bare head sits near
 * `y = -100`. Light comes from the upper left: each surface has a lit, a mid and a shaded tone. The fixed parts are
 * tables (`body-plan.ts`, `outfits.ts`, `props.ts`); this module poses the arms and places everything.
 */
import { MOODS, type HeadAnchor, type Mood } from './actor';
import {
  anchorY,
  FACES,
  GROUPS,
  HAIR,
  HEADWEAR,
  LEGS,
  SKULL_AND_FACE,
  type FacetSpec,
  type Group,
  type Tone,
} from './body-plan';
import { BUILD_WIDTH, torsoFacets } from './outfits';
import type { Preset } from './preset';
import { PROPS } from './props';

export { GROUPS, type Group, type Tone } from './body-plan';

export const POSES = ['stand', 'sit', 'point', 'steer', 'hold'] as const;
export type Pose = (typeof POSES)[number];

export const MOTIONS = ['wave', 'nod', 'turn-to'] as const;
export type Motion = (typeof MOTIONS)[number];

export type Point = readonly [number, number];

export interface Facet {
  /** The body part it belongs to (`torso`, `front-hand`, `prop` …); several facets share one id. */
  readonly id: string;
  readonly tone: Tone;
  readonly points: readonly Point[];
}

export interface FigureDrawing {
  readonly groups: Readonly<Record<Group, readonly Facet[]>>;
  /** The top of the head, where `Emote` attaches. */
  readonly anchor: HeadAnchor;
  /** Where the motions turn: the neck for `nod` and `turn-to`, the front shoulder for `wave`. */
  readonly pivots: { readonly neck: Point; readonly shoulder: Point };
  /** How far `wave` lifts the front arm from this pose, in degrees (negative lifts it forward and up). */
  readonly waveLift: number;
}

interface Arm {
  readonly elbow: Point;
  readonly wrist: Point;
}

interface Stance {
  /** Moves everything above the hips: the seated torso sits a little lower and forward. */
  readonly upper: Point;
  readonly seated: boolean;
  readonly front: Arm;
  readonly back: Arm;
  /** The prop shows only where a hand is free to carry it. */
  readonly prop: 'side' | 'forward' | 'away';
  readonly finger: boolean;
  readonly waveLift: number;
}

const HANGING_FRONT: Arm = { elbow: [13, -56], wrist: [13, -45] };
const HANGING_BACK: Arm = { elbow: [-14, -56], wrist: [-14, -45] };
const STANDING = { upper: [0, 0], seated: false, back: HANGING_BACK, finger: false } as const;

const STANCES: Readonly<Record<Pose, Stance>> = {
  stand: { ...STANDING, front: HANGING_FRONT, prop: 'side', waveLift: -150 },
  point: { ...STANDING, front: { elbow: [19, -54], wrist: [30, -57] }, prop: 'away', finger: true, waveLift: -70 },
  hold: { ...STANDING, front: { elbow: [13, -55], wrist: [25, -54] }, prop: 'forward', waveLift: -60 },
  steer: {
    ...STANDING,
    front: { elbow: [18, -56], wrist: [27, -63] },
    back: { elbow: [-5, -54], wrist: [22, -55] },
    prop: 'away',
    waveLift: -60,
  },
  sit: {
    upper: [2, 2],
    seated: true,
    front: { elbow: [18, -51], wrist: [33, -49] },
    back: { elbow: [-6, -51], wrist: [27, -49] },
    prop: 'away',
    finger: false,
    waveLift: -80,
  },
};

const round = (value: number) => Math.round(value * 10) / 10;
const pairs = (flat: readonly number[]): Point[] =>
  Array.from({ length: flat.length / 2 }, (_, i): Point => [flat[2 * i], flat[2 * i + 1]]);
const flatten = (points: readonly Point[]): number[] => points.flat();

// ---------------------------------------------------------------- arms

/** A tapered quad from `a` to `b`, `widths[0]` wide at `a` and `widths[1]` at `b`. */
function limb(a: Point, b: Point, [wa, wb]: readonly [number, number]): Point[] {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const [nx, ny] = [-(b[1] - a[1]) / length, (b[0] - a[0]) / length];
  return [
    [a[0] + (nx * wa) / 2, a[1] + (ny * wa) / 2],
    [b[0] + (nx * wb) / 2, b[1] + (ny * wb) / 2],
    [b[0] - (nx * wb) / 2, b[1] - (ny * wb) / 2],
    [a[0] - (nx * wa) / 2, a[1] - (ny * wa) / 2],
  ];
}

/** The hand continuing the forearm from the wrist: a faceted mitten, its fingertip and the forearm's direction. */
function hand({ elbow, wrist }: Arm) {
  const size = Math.hypot(wrist[0] - elbow[0], wrist[1] - elbow[1]) || 1;
  const [ux, uy] = [(wrist[0] - elbow[0]) / size, (wrist[1] - elbow[1]) / size];
  const at = (along: number, across: number): Point => [
    wrist[0] + ux * along - uy * across,
    wrist[1] + uy * along + ux * across,
  ];
  return {
    palm: [at(0, 2.3), at(4, 2), at(5.5, 0), at(4, -2), at(0, -2.3)],
    tip: at(5.5, 0),
    along: [ux, uy] as Point,
  };
}

interface ArmPlacement {
  readonly side: 'front' | 'back';
  readonly shoulder: Point;
  readonly joints: Arm;
  readonly finger: boolean;
}

function armFacets({ side, shoulder, joints, finger }: ArmPlacement, preset: Preset): FacetSpec[] {
  const group = side === 'front' ? 'front-arm' : 'back-arm';
  const lit = side === 'front';
  const { palm, tip, along } = hand(joints);
  const facets: FacetSpec[] = [
    [group, `${side}-arm`, lit ? 'top-lit' : 'top-shade', flatten(limb(shoulder, joints.elbow, [6.2, 5.2]))],
    [group, `${side}-arm`, lit ? 'top' : 'top-shade', flatten(limb(joints.elbow, joints.wrist, [5.2, 4.4]))],
  ];
  if (preset.outfit === 'officer') {
    const cuffStart: Point = [joints.wrist[0] - along[0] * 1.6, joints.wrist[1] - along[1] * 1.6];
    facets.push([group, `${side}-cuff`, 'trim', flatten(limb(cuffStart, joints.wrist, [4.6, 4.6]))]);
  }
  facets.push([group, `${side}-hand`, lit ? 'skin' : 'skin-shade', flatten(palm)]);
  if (finger) {
    const end: Point = [tip[0] + along[0] * 4, tip[1] + along[1] * 4 - 0.6];
    facets.push([group, 'finger', 'skin-lit', flatten(limb(tip, end, [1.6, 1.2]))]);
  }
  return facets;
}

/** The front arm with whatever it carries; the hand paints last, closed over the handle or edge. */
function frontArm(stance: Stance, preset: Preset, shoulder: Point): FacetSpec[] {
  const facets = armFacets({ side: 'front', shoulder, joints: stance.front, finger: stance.finger }, preset);
  if (!preset.prop || stance.prop === 'away') return facets;
  const { tip } = hand(stance.front);
  const [gx, gy] = stance.prop === 'side' ? [tip[0] - 1, tip[1] - 2] : [tip[0] - 2.5, tip[1] - 2];
  const prop = PROPS[preset.prop][stance.prop].map(([group, id, tone, points]): FacetSpec => [
    group,
    id,
    tone,
    points.map((v, i) => v + (i % 2 === 0 ? gx : gy)),
  ]);
  const isHand = ([, id]: FacetSpec) => id === 'front-hand';
  return [...facets.filter((f) => !isHand(f)), ...prop, ...facets.filter(isHand)];
}

// ---------------------------------------------------------------- the figure

function check(pose: Pose, mood: Mood | undefined): Stance {
  const stance = STANCES[pose] as Stance | undefined;
  if (!stance) throw new Error(`Character has no pose "${pose}"; poses are ${POSES.join(', ')}.`);
  if (mood !== undefined && !MOODS.includes(mood)) {
    throw new Error(`Character has no mood "${mood}"; moods are ${MOODS.join(', ')}.`);
  }
  return stance;
}

function sort(specs: readonly FacetSpec[], upper: Point): Record<Group, Facet[]> {
  const groups = Object.fromEntries(GROUPS.map((group) => [group, [] as Facet[]])) as Record<Group, Facet[]>;
  for (const [group, id, tone, flat] of specs) {
    const [dx, dy] = group === 'legs' || group === 'chair' ? [0, 0] : upper;
    groups[group].push({ id, tone, points: pairs(flat).map(([x, y]): Point => [round(x + dx), round(y + dy)]) });
  }
  return groups;
}

/** Draws a preset in a pose with a mood: every facet in paint order, the head anchor, the motion pivots. */
export function drawFigure(preset: Preset, pose: Pose, mood?: Mood): FigureDrawing {
  const stance = check(pose, mood);
  const b = BUILD_WIDTH[preset.build];
  const shoulder: Point = [11 + b, -69];
  const specs: FacetSpec[] = [
    ...LEGS[stance.seated ? 'seated' : 'standing'],
    ...torsoFacets(preset),
    ...armFacets({ side: 'back', shoulder: [-12 - b, -69], joints: stance.back, finger: false }, preset),
    ...frontArm(stance, preset, shoulder),
    ...SKULL_AND_FACE,
    ...FACES[mood ?? 'calm'],
    ...HAIR[preset.hair],
    ...(preset.headwear ? HEADWEAR[preset.headwear] : []),
  ];
  const [ux, uy] = stance.upper;
  return {
    groups: sort(specs, stance.upper),
    anchor: { x: 1 + ux, y: anchorY(preset) + uy },
    pivots: { neck: [0.5 + ux, -74 + uy], shoulder: [shoulder[0] + ux, shoulder[1] + uy] },
    waveLift: stance.waveLift,
  };
}

/** Every facet of a drawing in paint order. */
export function facetsOf(drawing: FigureDrawing): readonly Facet[] {
  return GROUPS.flatMap((group) => drawing.groups[group]);
}

/** The distinct part ids a drawing shows, for tests and the cast gallery. */
export function partIds(drawing: FigureDrawing): string[] {
  return [...new Set(facetsOf(drawing).map((facet) => facet.id))];
}

/** An SVG path `d` for a facet. */
export function facetPath(facet: Facet): string {
  return `M${facet.points.map(([x, y]) => `${x} ${y}`).join('L')}Z`;
}
