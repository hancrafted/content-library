/*
 * What `ZoneScene` draws for the zone a Slide names (design-ADR 0025): one zone, one set of scenery and one slow
 * ambient loop, so retuning a zone is one edit every Slide in it follows. Deterministic, as the scenery parts are.
 */
import { seededRandom, toPoints, type IcebergPart } from './scenery/scenery.pure';
import { ZONES, type Zone } from './zones.pure';

/** The iceberg's part in a Scene, or none. */
export type SceneIceberg = IcebergPart | 'none';

/** The zone's one ambient loop: the Surface's wind, the Sunlit fish, the Twilight jellies, the whale, the bubbles. */
export type SceneLife = 'wind' | 'fish' | 'jellies' | 'whale' | 'bubbles';

/** What a Section title adds to its zone's scenery: the Twilight titles' lanternfish school and siphonophore. */
export type TitleLife = 'lanternfish' | 'siphonophore';

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
  /** Creatures only a Section title draws, beside the zone's loop; none on a page Slide. */
  readonly titleLife: readonly TitleLife[];
}

const DEFAULTS: Record<Zone, Omit<ZoneSceneParts, 'titleLife'>> = {
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
  /** The Scene is a Section title's drawing, which may add its zone's title life. */
  readonly sectionTitle?: boolean;
}

/** The Twilight zone feels empty on its Section titles (feedback 2, decision 11): they add a school and a colony. */
const TITLE_LIFE: Partial<Record<Zone, readonly TitleLife[]>> = { twilight: ['lanternfish', 'siphonophore'] };

/** Where `ZoneScene` draws each title creature, in its 1200 by 800 space, with half its drawn width at size 1. */
export const TITLE_LIFE_AT: Readonly<
  Record<TitleLife, { readonly x: number; readonly y: number; readonly scale: number; readonly halfWidth: number }>
> = {
  lanternfish: { x: 860, y: 610, scale: 1.5, halfWidth: 135 },
  // Right of the robot's cable at 600 and inside the middle a phone shows, so it stays in view at 375 px (decision 38).
  siphonophore: { x: 720, y: 180, scale: 1.3, halfWidth: 20 },
};

/**
 * Where a Section title draws its zone's loop instead of the page Slides' place, in the same terms as `TITLE_LIFE_AT`.
 * A section slide's Scene runs full-bleed under the table of contents, which hides the Abyss bubbles' page place at
 * the left: on the title they rise right of the robot's cable at 600, inside the middle a phone shows.
 */
export const TITLE_LOOP_AT: Readonly<
  Record<'bubbles', { readonly x: number; readonly y: number; readonly scale: number; readonly halfWidth: number }>
> = {
  bubbles: { x: 680, y: 560, scale: 1.5, halfWidth: 32 },
};

/** The Scene's drawing space; `ZoneScene` fills its box from the bottom centre (`xMidYMax slice`). */
const SCENE = { width: 1200, height: 800 } as const;

/** Which part of the Scene's width a box of this size shows, in the Scene's units, as `slice` crops it. */
export function visibleSpan({ width, height }: { readonly width: number; readonly height: number }) {
  const scale = Math.max(width / SCENE.width, height / SCENE.height);
  const shown = Math.min(SCENE.width, width / scale);
  return { left: (SCENE.width - shown) / 2, right: (SCENE.width + shown) / 2 };
}

/** The scenery a zone draws, its one ambient loop always among it, with a Slide's choice of iceberg part. */
export function zoneSceneParts({ zone, iceberg, sectionTitle = false }: ZoneSceneChoice): ZoneSceneParts {
  const own = DEFAULTS[zone];
  const titleLife = sectionTitle ? (TITLE_LIFE[zone] ?? []) : [];
  return { ...own, iceberg: iceberg ?? own.iceberg, titleLife };
}

/**
 * The side of a facet's cell in the faceted water below the Surface, the same in every Scene: about half the facets
 * the water had before feedback 2 (decision 8), so the deep water reads calmer. The sky and the Surface's water have
 * no facets at all.
 */
export const WATER_CELL = 240;

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

/**
 * The whole depth in one picture (`WholeDepthScene`): the sky above the waterline and the four zones under it, each
 * band as deep as the next, the Abyss reaching down to the seabed at the bottom of the drawing. The Surface is the sky
 * (feedback 2, decision 27): its band floats at `surfaceTop`, above the ship's mast and under the words a Slide writes
 * at the top, so no Surface-coloured water sits under the waterline.
 */
export const WHOLE_DEPTH = { width: 1200, height: 880, waterline: 460, band: 100, surfaceTop: 190 } as const;

/** One zone's band in the whole depth, from its top to its bottom, in the drawing's units. */
export interface DepthBand {
  readonly zone: Zone;
  readonly top: number;
  readonly bottom: number;
}

/** The Surface's band in the sky, then the four zones from the waterline down; the Abyss runs on to the bottom. */
export function depthBands(): readonly DepthBand[] {
  const { waterline, band, height, surfaceTop } = WHOLE_DEPTH;
  const underwater = ZONES.filter((zone) => zone !== 'surface');
  return [
    { zone: 'surface', top: surfaceTop, bottom: surfaceTop + band },
    ...underwater.map((zone, depth) => ({
      zone,
      top: waterline + depth * band,
      bottom: depth === underwater.length - 1 ? height : waterline + (depth + 1) * band,
    })),
  ];
}
