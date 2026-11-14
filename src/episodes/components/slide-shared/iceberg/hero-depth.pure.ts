/*
 * The Title slide's hero drawing (design guide, Iceberg; the Spec's picked Title-slide Option 0a): a Surface sky the
 * title and the sun sit in, the waterline, then the four zones under it, the Abyss reaching the bottom. The drawing is
 * fitted to the hero's height, so all five zones and the sun show at any width (Han, 2026-11-14); the sky and water run
 * on past both sides for screens wider than the drawing. The Sunlit band is deep enough for an iceberg keel twice its
 * tip that ends a fifth into the Twilight zone.
 */
import { type IcebergPlacement, placeIcebergInBands } from './scenery/iceberg-placement.pure';
import { type SeaFacet, seaFacets, WATER_CELL } from './zone-scene.pure';
import { type Zone, ZONES } from './zones.pure';

/** The zones under the waterline. */
export type UnderwaterZone = Exclude<Zone, 'surface'>;

export interface HeroDepth {
  readonly width: number;
  readonly height: number;
  /** Where the sky ends and the Sunlit zone starts. */
  readonly waterline: number;
  /** Each underwater zone's depth in the drawing's units; the Abyss also takes whatever room is left. */
  readonly depths: Readonly<Record<UnderwaterZone, number>>;
}

/** The hero's drawing space; the sky, nearly two thirds of it, holds the title over the ship, the sun and the berg's tip. */
export const HERO_DEPTH: HeroDepth = {
  width: 1200,
  height: 1180,
  waterline: 760,
  depths: { sunlit: 230, twilight: 80, midnight: 60, abyss: 50 },
};

/** The hero's iceberg, through the one placement every Scene shares: keel a fifth into Twilight, twice the tip deep. */
export function heroIceberg(depth: HeroDepth): IcebergPlacement {
  return placeIcebergInBands(heroDepthBands(depth), { x: 1010, waterline: depth.waterline, scale: 0.7 });
}

/** The sky and water's span across: one drawing's width past each side, so a screen wider than the drawing sees no edge. */
export function heroBleed({ width }: HeroDepth): { readonly left: number; readonly width: number } {
  return { left: -width, width: width * 3 };
}

/** One zone's band in the hero, its top and bottom. */
export interface HeroBand {
  readonly zone: Zone;
  readonly top: number;
  readonly bottom: number;
}

/** The Surface sky, then each zone from the waterline down; refused when the zones run past the drawing's bottom. */
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

/** One underwater band of the hero: faceted across the drawing, flat across the bleed beside it. */
export interface HeroWaterBand extends HeroBand {
  readonly facets: readonly SeaFacet[];
  readonly bleed: { readonly left: number; readonly width: number };
}

/**
 * The hero's water under the waterline (feedback 2, decision 8): low poly across the drawing only, in the shared
 * water cell, so its facets are about half of what they were; past both sides the bleed lies flat in the zone's
 * colour, so a wider screen adds no facets.
 */
export function heroWater(depth: HeroDepth): readonly HeroWaterBand[] {
  const bleed = heroBleed(depth);
  return heroDepthBands(depth)
    .filter(({ zone }) => zone !== 'surface')
    .map((band, index) => ({
      ...band,
      facets: seaFacets({ width: depth.width, height: band.bottom - band.top, cell: WATER_CELL, seed: 5 + index * 6 }),
      bleed,
    }));
}
