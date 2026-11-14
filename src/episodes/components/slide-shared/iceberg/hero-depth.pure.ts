/*
 * The Title slide's hero drawing (design guide, Iceberg; the Spec's picked Title-slide Option 0a): a Surface sky the
 * title and the sun sit in, the waterline, then the four zones under it, the Abyss reaching the bottom. The drawing is
 * fitted to the hero's height, so all five zones and the sun show at any width (Han, 2026-11-14); the sky and water run
 * on past both sides for screens wider than the drawing. The Sunlit band is deep enough for an iceberg keel twice its
 * tip that ends a fifth into the Twilight zone.
 */
import { ZONES, type Zone } from './ruler.pure';
import { type IcebergPlacement, placeIceberg } from './scenery/iceberg-placement.pure';

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
  const bands = heroDepthBands(depth);
  const sunlit = bands.find((band) => band.zone === 'sunlit')!;
  const twilight = bands.find((band) => band.zone === 'twilight')!;
  return placeIceberg({
    x: 1010,
    waterline: depth.waterline,
    scale: 0.7,
    sunlitBottom: sunlit.bottom,
    twilightDepth: twilight.bottom - twilight.top,
  });
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
