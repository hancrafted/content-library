/*
 * What `ZoneScene` draws for the zone a Slide names (design-ADR 0025): one zone, one set of scenery and one slow
 * ambient loop, so retuning a zone is one edit every Slide in it follows. Deterministic, as the scenery parts are.
 */
import { type IcebergPart } from './scenery/scenery.pure';
import { HEADING_ROLE, titleBottom, type TitleLines, titleLineStyle, type TitleWindow } from './title-clearance.pure';
import { bandFacets, type SeaFacet, WATER_CELL, type ZoneEdge, zoneEdge } from './zone-edges.pure';
import { type Zone, ZONES } from './zones.pure';

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

/** Where a Section title draws a group in `ZoneScene`'s 1200 by 800 space, and half its drawn width at size 1. */
export interface TitlePlacement {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  /** Measures the group's span for the in-view checks; the creature itself does not take it. */
  readonly halfWidth: number;
}

/** Where `ZoneScene` draws each title creature. */
export const TITLE_LIFE_AT: Readonly<Record<TitleLife, TitlePlacement>> = {
  lanternfish: { x: 860, y: 610, scale: 1.5, halfWidth: 135 },
  // Right of the robot's cable at 600 and inside the middle a phone shows, so it stays in view at 375 px (decision 38).
  siphonophore: { x: 720, y: 180, scale: 1.3, halfWidth: 20 },
};

/**
 * Where a Section title draws its zone's loop instead of the page Slides' place, in the same terms as `TITLE_LIFE_AT`.
 * A section slide's Scene runs full-bleed under the table of contents, which hides the Abyss bubbles' page place at
 * the left: on the title they rise right of the robot's cable at 600, inside the middle a phone shows.
 */
export const TITLE_LOOP_AT: Readonly<Record<'bubbles', TitlePlacement>> = {
  bubbles: { x: 680, y: 560, scale: 1.5, halfWidth: 32 },
};

/**
 * The Scene's drawing space; `ZoneScene` fills its box from the bottom centre (`xMidYMax slice`), a Surface Section
 * title from the top centre (`xMidYMin slice`), so its whole sky shows at the top edge (feedback 3, decision 48).
 */
const SCENE = { width: 1200, height: 800 } as const;
/** Where the Surface's waterline runs in the Scene. */
export const SURFACE_WATERLINE = 400;

/** The air kept between a Section title's last line and the figures under it, in pixels (1rem). */
const TITLE_AIR = 16;

/** A Section title's lines on a wide screen, a tablet and a phone, counted generously for the German titles. */
const SECTION_LINES: TitleLines = [2, 3, 4];

/** Where a Section title's last line ends, in pixels from the Slide's top: its words start right under the header. */
export function sectionTitleBottom(box: TitleWindow): number {
  return titleBottom(box, { role: HEADING_ROLE, lines: SECTION_LINES, below: 0 });
}

/**
 * How far a Surface Section title's drawing starts below its box's top (feedback 3, decision 48): zero while what
 * reaches `reach` above the waterline, the ship's masthead, already ends below the title's last line; on a box too
 * short for that, just enough that it does, the sky running on above the drawing. The drawing fills the rest of the
 * box by `slice`, so a lift scales it only while the box's height decides its scale. `ZoneScene`'s CSS module computes
 * the same from `sectionTitleLiftStyle`.
 */
export function sectionTitleLift({ width, height }: TitleWindow, reach: number): number {
  if (reach > SURFACE_WATERLINE)
    throw new Error(`Figures reach ${reach} above the waterline, past the Scene's top at ${SURFACE_WATERLINE}.`);
  const below = SURFACE_WATERLINE - reach;
  const title = sectionTitleBottom({ width, height }) + TITLE_AIR;
  const byWidth = title - (below * width) / SCENE.width;
  const byHeight = (title - (below * height) / SCENE.height) / (1 - below / SCENE.height);
  return Math.max(0, Math.min(byWidth, byHeight));
}

/** The numbers `ZoneScene`'s CSS module lifts a Surface title's drawing by: where the figures stop, the line counts. */
export function sectionTitleLiftStyle(reach: number): Readonly<Record<`--${string}`, string>> {
  return { '--scene-figures-below': String(SURFACE_WATERLINE - reach), ...titleLineStyle(SECTION_LINES) };
}

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

/** How far a boundary between two zones waves in the whole depth, in its units. */
const WHOLE_AMPLITUDE = 8;

/** One zone's water in the whole depth, between its two boundaries. */
export interface WholeWaterBand {
  readonly zone: Zone;
  readonly top: ZoneEdge;
  readonly bottom: ZoneEdge;
  readonly facets: readonly SeaFacet[];
}

/**
 * The whole depth's water under the waterline: each zone of `depthBands` between boundaries from `zoneEdge`, the
 * waterline and the drawing's bottom straight, every boundary between two zones in uneven waves (feedback 3, decision 45).
 */
export function wholeWater(): readonly WholeWaterBand[] {
  const { width, height } = WHOLE_DEPTH;
  const underwater = depthBands().filter(({ zone }) => zone !== 'surface');
  const edges = [
    ...underwater.map(({ top }, index) =>
      zoneEdge({ left: 0, right: width, y: top, amplitude: index === 0 ? 0 : WHOLE_AMPLITUDE, seed: 41 + index * 7 }),
    ),
    zoneEdge({ left: 0, right: width, y: height, amplitude: 0, seed: 41 }),
  ];
  return underwater.map(({ zone }, index) => {
    const top = edges[index]!;
    const bottom = edges[index + 1]!;
    return {
      zone,
      top,
      bottom,
      facets: bandFacets({ left: 0, width, top, bottom, cell: WATER_CELL, seed: 5 + index * 6 }),
    };
  });
}
