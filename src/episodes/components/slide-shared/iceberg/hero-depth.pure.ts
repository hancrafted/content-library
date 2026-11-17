import { type IcebergPlacement, placeIcebergInBands } from './scenery/iceberg-placement.pure';
import { HERO_ROLE, titleBottom, type TitleLines, titleLineStyle, type TitleWindow } from './title-clearance.pure';
import { bandFacets, type SeaFacet, WATER_CELL, type ZoneEdge, zoneEdge } from './zone-edges.pure';
import { type Zone, ZONES } from './zones.pure';

export type UnderwaterZone = Exclude<Zone, 'surface'>;

export interface HeroDepth {
  readonly width: number;
  readonly height: number;
  readonly waterline: number;
  readonly depths: Readonly<Record<UnderwaterZone, number>>;
}

export const HERO_DEPTH: HeroDepth = {
  width: 1200,
  height: 1180,
  waterline: 425,
  depths: { sunlit: 260, twilight: 150, midnight: 150, abyss: 195 },
};

export function heroIceberg(depth: HeroDepth): IcebergPlacement {
  return placeIcebergInBands(heroDepthBands(depth), { x: 1010, waterline: depth.waterline, scale: 0.75 });
}

const SEABED_HEIGHT = 80;

export function heroSeabed({ height }: HeroDepth): { readonly y: number; readonly height: number } {
  return { y: height - SEABED_HEIGHT, height: SEABED_HEIGHT };
}

export function heroBleed({ width }: HeroDepth): { readonly left: number; readonly width: number } {
  return { left: -width, width: width * 3 };
}

export interface HeroBand {
  readonly zone: Zone;
  readonly top: number;
  readonly bottom: number;
}

export function heroDepthBands({ height, waterline, depths }: HeroDepth): readonly HeroBand[] {
  const underwater = ZONES.filter((zone): zone is UnderwaterZone => zone !== 'surface');
  const end = underwater.reduce((top, zone) => top + depths[zone], waterline);
  if (end > height) throw new Error(`The zones run to ${end}, past the drawing's ${height}.`);
  let top = waterline;
  const bands = underwater.map((zone) => {
    const bottom = zone === 'abyss' ? height : top + depths[zone];
    const band = { zone, top, bottom };
    top = bottom;
    return band;
  });
  return [{ zone: 'surface', top: 0, bottom: waterline }, ...bands];
}

const BOUNDARY_AMPLITUDE = 14;

export interface HeroWaterBand {
  readonly zone: UnderwaterZone;
  readonly top: ZoneEdge;
  readonly bottom: ZoneEdge;
  readonly facets: readonly SeaFacet[];
}

export function heroWater(depth: HeroDepth): readonly HeroWaterBand[] {
  const bleed = heroBleed(depth);
  const underwater = heroDepthBands(depth).filter(
    (band): band is HeroBand & { zone: UnderwaterZone } => band.zone !== 'surface',
  );
  const edge = (y: number, index: number, straight: boolean) =>
    zoneEdge({
      left: bleed.left,
      right: bleed.left + bleed.width,
      y,
      amplitude: straight ? 0 : BOUNDARY_AMPLITUDE,
      seed: 31 + index * 7,
    });
  const edges = [
    ...underwater.map(({ top }, index) => edge(top, index, index === 0)),
    edge(depth.height, underwater.length, true),
  ];
  return underwater.map(({ zone }, index) => {
    const top = edges[index]!;
    const bottom = edges[index + 1]!;
    return {
      zone,
      top,
      bottom,
      facets: bandFacets({ left: bleed.left, width: bleed.width, top, bottom, cell: WATER_CELL, seed: 5 + index * 6 }),
    };
  });
}

export const HERO_SHIP_TOP = 190;
const AIR = 24;

export type HeroWindow = TitleWindow;

const HERO_LINES: TitleLines = [2, 3, 5];

export function heroTitleBottom(window: HeroWindow): number {
  return titleBottom(window, { role: HERO_ROLE, lines: HERO_LINES, below: 16 });
}

export function heroKeep(depth: HeroDepth = HERO_DEPTH): number {
  return (depth.waterline - HERO_SHIP_TOP - AIR) / depth.height;
}

export function heroLift(window: HeroWindow, depth: HeroDepth = HERO_DEPTH): number {
  const keep = heroKeep(depth);
  return Math.max(0, (heroTitleBottom(window) - keep * window.height) / (1 - keep));
}

export function heroLiftStyle(depth: HeroDepth = HERO_DEPTH): Readonly<Record<`--${string}`, string>> {
  return { '--hero-keep': heroKeep(depth).toFixed(4), ...titleLineStyle(HERO_LINES) };
}
