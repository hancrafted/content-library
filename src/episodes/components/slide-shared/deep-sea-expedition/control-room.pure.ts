/**
 * The control room's geometry: its faceted wall and floor, drawn for any room size from one set of proportions, and
 * where its window and wall clock hang (design-ADR 0025, "Scene figures are deep modules").
 */

/** A room's drawing space: `floor` is the line figures stand on, `height` the bottom of the floor below it. */
export interface RoomSize {
  readonly width: number;
  readonly height: number;
  readonly floor: number;
}

/** The room the comic panels draw: 300 by 180, figures standing at 158. */
export const ROOM: RoomSize = { width: 300, height: 180, floor: 158 };

/** The wall's lit and shaded planes and the floor's two tones, lit from the upper left. */
export type RoomTone = 'lit' | 'mid' | 'shade' | 'floor' | 'floor-lit';

export interface RoomFacet {
  readonly tone: RoomTone;
  readonly points: string;
}

type Point = readonly [x: number, y: number];

/**
 * The wall facets as shares of the width and the floor line, so a wider or taller room keeps the same planes. Taken
 * from the comic panels' 300-unit room.
 */
const WALL: readonly { readonly tone: RoomTone; readonly points: readonly Point[] }[] = [
  {
    tone: 'lit',
    points: [
      [0, 0],
      [130 / 300, 0],
      [70 / 300, 84 / 158],
      [0, 64 / 158],
    ],
  },
  {
    tone: 'mid',
    points: [
      [130 / 300, 0],
      [1, 0],
      [1, 56 / 158],
      [196 / 300, 96 / 158],
    ],
  },
  {
    tone: 'lit',
    points: [
      [130 / 300, 0],
      [196 / 300, 96 / 158],
      [70 / 300, 84 / 158],
    ],
  },
  {
    tone: 'mid',
    points: [
      [0, 64 / 158],
      [70 / 300, 84 / 158],
      [36 / 300, 1],
      [0, 1],
    ],
  },
  {
    tone: 'lit',
    points: [
      [70 / 300, 84 / 158],
      [196 / 300, 96 / 158],
      [160 / 300, 1],
      [36 / 300, 1],
    ],
  },
  {
    tone: 'shade',
    points: [
      [196 / 300, 96 / 158],
      [1, 56 / 158],
      [1, 1],
      [160 / 300, 1],
    ],
  },
];

const round = (value: number) => Math.round(value * 100) / 100;
const pointsAttr = (points: readonly Point[]) => points.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');

/** The room's wall planes, then its floor and the floor's lit patch, in drawing order. */
export function roomFacets({ width, height, floor }: RoomSize): readonly RoomFacet[] {
  const wall = WALL.map(({ tone, points }) => ({
    tone,
    points: pointsAttr(points.map(([x, y]) => [x * width, y * floor] as const)),
  }));
  const litFoot = (140 / 300) * width;
  const litHead = (96 / 300) * width;
  return [
    ...wall,
    {
      tone: 'floor',
      points: pointsAttr([
        [0, floor],
        [width, floor],
        [width, height],
        [0, height],
      ]),
    },
    {
      tone: 'floor-lit',
      points: pointsAttr([
        [0, floor],
        [litFoot, floor],
        [litHead, height],
        [0, height],
      ]),
    },
  ];
}

/** The window's frame is 92 units wide; it hangs 12 units in from the right edge, and needs as much wall on its left. */
const WINDOW_SPAN = 104;

/** The window onto the deck sits in the wall's top right corner; a room narrower than two spans has no wall for it. */
export function windowAt({ width }: RoomSize): { readonly x: number; readonly y: number } {
  if (width < WINDOW_SPAN * 2) throw new Error(`A ${width}-unit room is too narrow to hang its window in.`);
  return { x: width - WINDOW_SPAN, y: 10 };
}
