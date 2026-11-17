// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
import { seededRandom, toPoints } from './scenery/scenery.pure';

export const WATER_CELL = 240;

export interface SeaFacet {
  readonly points: string;
  readonly tone: 'sea' | 'sea-lit';
}

export type ZoneEdge = readonly (readonly [number, number])[];

export interface ZoneEdgeOptions {
  readonly left: number;
  readonly right: number;
  readonly y: number;
  readonly amplitude: number;
  readonly seed: number;
}

const EDGE_STEP = 60;

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

export function edgeY(edge: ZoneEdge, x: number): number {
  const after = edge.findIndex(([px]) => px >= x);
  if (after === -1) return edge.at(-1)![1];
  if (after === 0) return edge[0]![1];
  const [x0, y0] = edge[after - 1]!;
  const [x1, y1] = edge[after]!;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

export interface BandOptions {
  readonly left: number;
  readonly width: number;
  readonly top: ZoneEdge;
  readonly bottom: ZoneEdge;
  readonly cell: number | { readonly width: number; readonly height: number };
  readonly seed: number;
}

const pointsBetween = (edge: ZoneEdge, from: number, to: number) =>
  edge
    .filter(([x]) => x > Math.min(from, to) && x < Math.max(from, to))
    .sort(([a], [b]) => (from < to ? a - b : b - a));

export function bandFacets({ left, width, top, bottom, cell, seed }: BandOptions): readonly SeaFacet[] {
  const { width: cellWidth, height: cellHeight } = typeof cell === 'number' ? { width: cell, height: cell } : cell;
  const height = edgeY(bottom, left + width / 2) - edgeY(top, left + width / 2);
  if (!(cellWidth > 0) || !(cellHeight > 0) || !(width > 0) || !(height > 0))
    throw new Error(`Water needs a positive size and cell, got ${width} by ${height} in cells of ${cellWidth}.`);
  const random = seededRandom(seed);
  const columns = Math.max(1, Math.round(width / cellWidth));
  const rows = Math.max(1, Math.round(height / cellHeight));
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
  readonly cell: number;
  readonly seed: number;
}

export function seaFacets({ width, height, cell, seed }: SeaOptions): readonly SeaFacet[] {
  if (!(height > 0) || !(width > 0))
    throw new Error(`Water needs a positive size and cell, got ${width} by ${height} in cells of ${cell}.`);
  const top = zoneEdge({ left: 0, right: width, y: 0, amplitude: 0, seed });
  const bottom = zoneEdge({ left: 0, right: width, y: height, amplitude: 0, seed });
  return bandFacets({ left: 0, width, top, bottom, cell, seed });
}
