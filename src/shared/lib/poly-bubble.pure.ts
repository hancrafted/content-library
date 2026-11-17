/*
 * The geometry of one faceted air bubble (`PolyBubble`, src/shared/components/core-components/poly-bubble/poly-bubble.tsx), in the
 * Iceberg style's low-poly manner: light from the upper left, flat facets, one glint. Everything sits in the anchor
 * box, -10..10 on both axes, centred on the origin, in whole units: a unit is at most 2 px on the largest bubble,
 * and short numbers keep the page light, since every Section edge carries forty bubbles.
 */

export type BubblePoint = readonly [x: number, y: number];

export interface BubbleFacets {
  readonly outline: readonly BubblePoint[];
  readonly lit: readonly BubblePoint[];
  readonly shade: readonly BubblePoint[];
  readonly glint: readonly BubblePoint[];
}

/** A slight, fixed unevenness per corner, so the outline reads as cut, not as a regular polygon. */
const RADII = [10, 9.3, 9.8, 9.1, 9.9, 9.4, 9.7, 9.2] as const;
const LIT_CORE: BubblePoint = [-2, -1];
const SHADE_CORE: BubblePoint = [2, 2];
const LIGHT = (-3 * Math.PI) / 4;

const round = (value: number) => Math.round(value) + 0;

export function polyBubbleFacets(sides: number): BubbleFacets {
  if (!Number.isInteger(sides) || sides < 6 || sides > 8)
    throw new Error(`A poly bubble has 6 to 8 sides; got ${sides}.`);
  const angles = Array.from({ length: sides }, (_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / sides);
  const outline = angles.map(
    (angle, index) => [round(Math.cos(angle) * RADII[index]!), round(Math.sin(angle) * RADII[index]!)] as const,
  );
  const facing = (toward: number) => {
    const faces = angles.map((angle) => Math.cos(angle - toward) >= -1e-9);
    // Start right after a corner that turns away, so the facing run is contiguous even when it wraps past the top.
    const first = faces.findIndex((face, index) => face && !faces[(index - 1 + sides) % sides]);
    return outline
      .map((_, step) => (first + step) % sides)
      .filter((index) => faces[index])
      .map((index) => outline[index]!);
  };
  const litRim = facing(LIGHT);
  const shadeRim = facing(LIGHT + Math.PI);
  return {
    outline,
    lit: [...litRim, LIT_CORE],
    shade: [...shadeRim, SHADE_CORE],
    glint: [
      [-6, -3],
      [-4, -6],
      [-4, -4],
    ],
  };
}

export function toPoints(points: readonly BubblePoint[]): string {
  return points.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
}
