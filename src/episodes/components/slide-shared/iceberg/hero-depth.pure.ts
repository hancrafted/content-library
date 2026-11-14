/*
 * The Title slide's hero drawing (design guide, Iceberg; the Spec's picked Title-slide Option 0a): a Surface sky the
 * title sits in, the waterline, then the four zones under it in bands that thin with depth, the Abyss reaching the
 * bottom. The drawing shows from its top (Han, 2026-11-14), so the sky is low enough that a wide screen still reaches
 * the waterline and the ship on it.
 */
import { ZONES, type Zone } from './ruler.pure';

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

/** The hero's drawing space; the sky holds a two-line title above the ship, and a 16:9 screen reaches the water. */
export const HERO_DEPTH: HeroDepth = {
  width: 1200,
  height: 830,
  waterline: 540,
  depths: { sunlit: 100, twilight: 75, midnight: 60, abyss: 55 },
};

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
