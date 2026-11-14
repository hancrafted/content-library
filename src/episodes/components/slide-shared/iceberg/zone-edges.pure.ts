/*
 * The faceted water every Iceberg Scene stands in (design-ADR 0025): zone boundaries in uneven waves and the low-poly
 * facets between two of them. The one generator of every zone boundary and every band of water: the title hero,
 * `ZoneScene` and `WholeDepthScene` all cut their water here, so each band meets the next on the same points
 * (feedback 3, decision 45). Deterministic, as the scenery parts are.
 */
import { seededRandom, toPoints } from './scenery/scenery.pure';

/**
 * The side of a facet's cell in the faceted water below the Surface, the same in every Scene: about half the facets
 * the water had before feedback 2 (decision 8), so the deep water reads calmer. The sky and the Surface's water have
 * no facets at all.
 */
export const WATER_CELL = 240;

/** One facet of faceted water, lit when it faces the upper left; along a wavy boundary it takes the boundary's bends. */
export interface SeaFacet {
  readonly points: string;
  readonly tone: 'sea' | 'sea-lit';
}

/** A boundary between two zones, left to right: the points of a polyline, or two points for a straight one. */
export type ZoneEdge = readonly (readonly [number, number])[];

export interface ZoneEdgeOptions {
  readonly left: number;
  readonly right: number;
  /** The line the boundary waves around. */
  readonly y: number;
  /** How far the waves reach above and below `y`; 0 draws a straight boundary. */
  readonly amplitude: number;
  readonly seed: number;
}

/** The distance between two points of a wavy boundary, as the Spec's sea lines step. */
const EDGE_STEP = 60;

/**
 * A zone boundary in uneven waves (feedback 3, decision 45; the Spec's `sea_lines`): a long swell, a shorter one and a
 * seeded jitter, held within `amplitude` of `y`. The one generator of every zone boundary: the title hero, `ZoneScene`
 * and `WholeDepthScene` all cut their water along it, so each band meets the next on the same points.
 */
export function zoneEdge({ left, right, y, amplitude, seed }: ZoneEdgeOptions): ZoneEdge {
  if (!(right > left))
    throw new Error(`A zone boundary runs from its left end, left of its right end: ${left} to ${right}.`);
  if (amplitude === 0)
    return [
      [left, y],
      [right, y],
    ];
  const random = seededRandom(seed);
  const phase = random() * Math.PI * 2;
  const steps = Math.max(1, Math.round((right - left) / EDGE_STEP));
  return Array.from({ length: steps + 1 }, (_, step) => {
    const x = left + (step * (right - left)) / steps;
    const swell = Math.sin(x / 160 + phase) * 0.6 + Math.sin(x / 53 + phase * 2) * 0.3 + (random() - 0.5) * 0.5;
    return [x, y + Math.max(-1, Math.min(1, swell)) * amplitude] as const;
  });
}

/** The boundary's height at `x`, read along its polyline; level with its end points beyond them. */
export function edgeY(edge: ZoneEdge, x: number): number {
  const after = edge.findIndex(([px]) => px >= x);
  if (after === -1) return edge.at(-1)![1];
  if (after === 0) return edge[0]![1];
  const [x0, y0] = edge[after - 1]!;
  const [x1, y1] = edge[after]!;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

export interface BandOptions {
  /** Where the facets start across, and how far they run. */
  readonly left: number;
  readonly width: number;
  readonly top: ZoneEdge;
  readonly bottom: ZoneEdge;
  /** The rough side of a facet's cell; a pair sets its width and height apart, as the sky's long facets do. */
  readonly cell: number | { readonly width: number; readonly height: number };
  readonly seed: number;
}

/** The boundary's own points strictly between two heights across, in the order given. */
const pointsBetween = (edge: ZoneEdge, from: number, to: number) =>
  edge
    .filter(([x]) => x > Math.min(from, to) && x < Math.max(from, to))
    .sort(([a], [b]) => (from < to ? a - b : b - a));

/**
 * Faceted water between two zone boundaries: a grid of cells whose top row follows `top` and bottom row `bottom`, every
 * corner but the band's ends nudged by the seed (along its boundary on the top and bottom rows), each cell cut into two
 * facets. The upper-left facet of a cell faces the light, as
 * every Scene's light comes from there. A facet on a boundary takes the boundary's points as corners, so the band
 * above and the band below share them exactly.
 */
export function bandFacets({ left, width, top, bottom, cell, seed }: BandOptions): readonly SeaFacet[] {
  const { width: cellWidth, height: cellHeight } = typeof cell === 'number' ? { width: cell, height: cell } : cell;
  const height = edgeY(bottom, left + width / 2) - edgeY(top, left + width / 2);
  if (!(cellWidth > 0) || !(cellHeight > 0) || !(width > 0) || !(height > 0))
    throw new Error(`Water needs a positive size and cell, got ${width} by ${height} in cells of ${cellWidth}.`);
  const random = seededRandom(seed);
  const columns = Math.max(1, Math.round(width / cellWidth));
  const rows = Math.max(1, Math.round(height / cellHeight));
  // A corner slides along its boundary as freely as inside: either band traces the boundary's own points between
  // its corners, so the bands still meet without a seam.
  const corner = (column: number, row: number): readonly [number, number] => {
    const across = column > 0 && column < columns;
    const nudge = (moves: boolean, span: number) => (moves ? (random() - 0.5) * span * 0.6 : 0);
    const x = left + (column * width) / columns + nudge(across, width / columns);
    const [high, low] = [edgeY(top, x), edgeY(bottom, x)];
    return [x, high + (row * (low - high)) / rows + nudge(across && row > 0 && row < rows, (low - high) / rows)];
  };
  const grid = Array.from({ length: rows + 1 }, (_, row) =>
    Array.from({ length: columns + 1 }, (_, column) => corner(column, row)),
  );
  return grid.slice(0, -1).flatMap((line, row) =>
    line.slice(0, -1).flatMap((_, column) =>
      cellFacets(grid, [column, row], {
        top: row === 0 ? top : undefined,
        bottom: row === rows - 1 ? bottom : undefined,
      }),
    ),
  );
}

type Grid = readonly (readonly (readonly [number, number])[])[];

/** One cell's two facets; a cell on a boundary takes the boundary's own points between its corners. */
function cellFacets(
  grid: Grid,
  [column, row]: readonly [number, number],
  on: { readonly top?: ZoneEdge; readonly bottom?: ZoneEdge },
): readonly SeaFacet[] {
  const topLeft = grid[row]![column]!;
  const topRight = grid[row]![column + 1]!;
  const bottomLeft = grid[row + 1]![column]!;
  const bottomRight = grid[row + 1]![column + 1]!;
  const alongTop = on.top ? pointsBetween(on.top, topLeft[0], topRight[0]) : [];
  const alongBottom = on.bottom ? pointsBetween(on.bottom, bottomRight[0], bottomLeft[0]) : [];
  return [
    { points: toPoints([topLeft, ...alongTop, topRight, bottomLeft]), tone: 'sea-lit' },
    { points: toPoints([topRight, bottomRight, ...alongBottom, bottomLeft]), tone: 'sea' },
  ];
}

export interface SeaOptions {
  readonly width: number;
  readonly height: number;
  /** The rough side of a facet's cell. */
  readonly cell: number;
  readonly seed: number;
}

/** Faceted water over a plain `width` by `height` box: `bandFacets` between two straight boundaries. */
export function seaFacets({ width, height, cell, seed }: SeaOptions): readonly SeaFacet[] {
  if (!(height > 0) || !(width > 0))
    throw new Error(`Water needs a positive size and cell, got ${width} by ${height} in cells of ${cell}.`);
  const top = zoneEdge({ left: 0, right: width, y: 0, amplitude: 0, seed });
  const bottom = zoneEdge({ left: 0, right: width, y: height, amplitude: 0, seed });
  return bandFacets({ left: 0, width, top, bottom, cell, seed });
}
