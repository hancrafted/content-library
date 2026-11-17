// decision: docs/adr/0025-scene-figures-are-deep-modules.md
import { type IcebergPart } from './scenery/scenery.pure';
import { HEADING_ROLE, titleBottom, type TitleLines, titleLineStyle, type TitleWindow } from './title-clearance.pure';
import { bandFacets, type SeaFacet, WATER_CELL, type ZoneEdge, zoneEdge } from './zone-edges.pure';
import { type Zone, ZONES } from './zones.pure';

export type SceneIceberg = IcebergPart | 'none';

export type SceneLife = 'wind' | 'fish' | 'jellies' | 'whale' | 'bubbles';

export type TitleLife = 'lanternfish' | 'siphonophore';

export interface ZoneSceneParts {
  readonly sky: boolean;
  readonly rays: boolean;
  readonly seabed: boolean;
  readonly iceberg: SceneIceberg;
  readonly life: SceneLife;
  readonly water: Zone;
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
  readonly iceberg?: SceneIceberg;
  readonly sectionTitle?: boolean;
}

const TITLE_LIFE: Partial<Record<Zone, readonly TitleLife[]>> = { twilight: ['lanternfish', 'siphonophore'] };

export interface TitlePlacement {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly halfWidth: number;
}

export const TITLE_LIFE_AT: Readonly<Record<TitleLife, TitlePlacement>> = {
  lanternfish: { x: 860, y: 610, scale: 1.5, halfWidth: 135 },
  // Right of the robot's cable at 600 and inside the middle a phone shows, so it stays in view at 375 px (decision 38).
  siphonophore: { x: 720, y: 180, scale: 1.3, halfWidth: 20 },
};

export const TITLE_LOOP_AT: Readonly<Record<'bubbles', TitlePlacement>> = {
  bubbles: { x: 680, y: 560, scale: 1.5, halfWidth: 32 },
};

const SCENE = { width: 1200, height: 800 } as const;
export const SURFACE_WATERLINE = 400;

/** The air kept between a Section title's last line and the figures under it, in pixels (1rem). */
const TITLE_AIR = 16;

const SECTION_LINES: TitleLines = [2, 3, 4];

/** Where a Section title's last line ends, in pixels from the Slide's top: its words start right under the header. */
export function sectionTitleBottom(box: TitleWindow): number {
  return titleBottom(box, { role: HEADING_ROLE, lines: SECTION_LINES, below: 0 });
}

export function sectionTitleLift({ width, height }: TitleWindow, reach: number): number {
  if (reach > SURFACE_WATERLINE)
    throw new Error(`Figures reach ${reach} above the waterline, past the Scene's top at ${SURFACE_WATERLINE}.`);
  const below = SURFACE_WATERLINE - reach;
  const title = sectionTitleBottom({ width, height }) + TITLE_AIR;
  const byWidth = title - (below * width) / SCENE.width;
  const byHeight = (title - (below * height) / SCENE.height) / (1 - below / SCENE.height);
  return Math.max(0, Math.min(byWidth, byHeight));
}

export function sectionTitleLiftStyle(reach: number): Readonly<Record<`--${string}`, string>> {
  return { '--scene-figures-below': String(SURFACE_WATERLINE - reach), ...titleLineStyle(SECTION_LINES) };
}

export function visibleSpan({ width, height }: { readonly width: number; readonly height: number }) {
  const scale = Math.max(width / SCENE.width, height / SCENE.height);
  const shown = Math.min(SCENE.width, width / scale);
  return { left: (SCENE.width - shown) / 2, right: (SCENE.width + shown) / 2 };
}

export function zoneSceneParts({ zone, iceberg, sectionTitle = false }: ZoneSceneChoice): ZoneSceneParts {
  const own = DEFAULTS[zone];
  const titleLife = sectionTitle ? (TITLE_LIFE[zone] ?? []) : [];
  return { ...own, iceberg: iceberg ?? own.iceberg, titleLife };
}

export const WHOLE_DEPTH = { width: 1200, height: 880, waterline: 460, band: 100, surfaceTop: 190 } as const;

export interface DepthBand {
  readonly zone: Zone;
  readonly top: number;
  readonly bottom: number;
}

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

const WHOLE_AMPLITUDE = 8;

export interface WholeWaterBand {
  readonly zone: Zone;
  readonly top: ZoneEdge;
  readonly bottom: ZoneEdge;
  readonly facets: readonly SeaFacet[];
}

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
