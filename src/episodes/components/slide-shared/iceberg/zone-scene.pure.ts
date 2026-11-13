/*
 * What `ZoneScene` draws for the zone a Slide names (design-ADR 0025): one zone, one set of scenery and one slow
 * ambient loop, so retuning a zone is one edit every Slide in it follows. Deterministic, as the scenery parts are.
 */
import type { Zone } from './ruler.pure';
import { seededRandom, toPoints, type IcebergPart } from './scenery/scenery.pure';

/** The iceberg's part in a Scene, or none. */
export type SceneIceberg = IcebergPart | 'none';

/** The zone's one ambient loop: the Surface's wind, the Sunlit fish, the Twilight jellies, the whale, the bubbles. */
export type SceneLife = 'wind' | 'fish' | 'jellies' | 'whale' | 'bubbles';

export interface ZoneSceneParts {
  /** The Surface sky with its clouds, sun and moon, above the waterline. */
  readonly sky: boolean;
  /** Sun shafts slanting down from the waterline. */
  readonly rays: boolean;
  readonly seabed: boolean;
  readonly iceberg: SceneIceberg;
  readonly life: SceneLife;
  /** The zone whose colour the water takes: the Surface's water is the top of the Sunlit zone. */
  readonly water: Zone;
}

const DEFAULTS: Record<Zone, ZoneSceneParts> = {
  surface: { sky: true, rays: false, seabed: false, iceberg: 'whole', life: 'wind', water: 'sunlit' },
  sunlit: { sky: false, rays: true, seabed: false, iceberg: 'keel', life: 'fish', water: 'sunlit' },
  twilight: { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'jellies', water: 'twilight' },
  midnight: { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'whale', water: 'midnight' },
  abyss: { sky: false, rays: false, seabed: true, iceberg: 'none', life: 'bubbles', water: 'abyss' },
};

export interface ZoneSceneChoice {
  readonly zone: Zone;
  /** Another part of the iceberg than the zone's own, or `none`. */
  readonly iceberg?: SceneIceberg;
}

/** The scenery a zone draws, its one ambient loop always among it, with a Slide's choice of iceberg part. */
export function zoneSceneParts({ zone, iceberg }: ZoneSceneChoice): ZoneSceneParts {
  const own = DEFAULTS[zone];
  return { ...own, iceberg: iceberg ?? own.iceberg };
}

/** One triangle of faceted water, lit when it faces the upper left. */
export interface SeaFacet {
  readonly points: string;
  readonly tone: 'sea' | 'sea-lit';
}

export interface SeaOptions {
  readonly width: number;
  readonly height: number;
  /** The rough side of a facet's cell. */
  readonly cell: number;
  readonly seed: number;
}

/**
 * Faceted water over `width` by `height`: a grid of cells, its inner corners nudged by the seed, each cell cut into
 * two triangles. The upper-left triangle of a cell faces the light, as every Scene's light comes from there.
 */
export function seaFacets({ width, height, cell, seed }: SeaOptions): readonly SeaFacet[] {
  if (!(cell > 0) || !(width > 0) || !(height > 0))
    throw new Error(`Water needs a positive size and cell, got ${width} by ${height} in cells of ${cell}.`);
  const random = seededRandom(seed);
  const columns = Math.max(1, Math.round(width / cell));
  const rows = Math.max(1, Math.round(height / cell));
  const corner = (column: number, row: number): readonly [number, number] => {
    const inner = column > 0 && column < columns && row > 0 && row < rows;
    const nudge = (span: number) => (inner ? (random() - 0.5) * span * 0.6 : 0);
    return [(column * width) / columns + nudge(width / columns), (row * height) / rows + nudge(height / rows)];
  };
  const grid = Array.from({ length: rows + 1 }, (_, row) =>
    Array.from({ length: columns + 1 }, (_, column) => corner(column, row)),
  );
  return grid.slice(0, -1).flatMap((line, row) =>
    line.slice(0, -1).flatMap((topLeft, column) => {
      const topRight = line[column + 1]!;
      const bottomLeft = grid[row + 1]![column]!;
      const bottomRight = grid[row + 1]![column + 1]!;
      return [
        { points: toPoints([topLeft, topRight, bottomLeft]), tone: 'sea-lit' as const },
        { points: toPoints([topRight, bottomRight, bottomLeft]), tone: 'sea' as const },
      ];
    }),
  );
}
