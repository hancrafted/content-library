/*
 * The Title slide's hero drawing (design guide, Iceberg; the Spec's picked Title-slide Option 0a): a Surface sky the
 * title and the sun sit in, about a third of the height, the waterline, then the four zones under it, the Abyss ending
 * on the seabed at the bottom. The drawing is fitted to the hero's height, so all five zones and the sun show at any
 * width (Han, 2026-11-14); the sky and water run on past both sides for screens wider than the drawing. The Sunlit
 * band is deep enough for an iceberg keel twice its tip that ends a fifth into the Twilight zone. The zones meet on
 * uneven waves (feedback 3, decision 45); the waterline stays straight and lit.
 */
import { type IcebergPlacement, placeIcebergInBands } from './scenery/iceberg-placement.pure';
import { HERO_ROLE, titleBottom, type TitleLines, titleLineStyle, type TitleWindow } from './title-clearance.pure';
import { bandFacets, type SeaFacet, WATER_CELL, type ZoneEdge, zoneEdge } from './zone-edges.pure';
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

/**
 * The hero's drawing space (feedback 3, decision 45): the sky, 36% of it, holds the title, the sun, the ship and the
 * berg's tip; the water, 64%, shows every zone down to the seabed.
 */
export const HERO_DEPTH: HeroDepth = {
  width: 1200,
  height: 1180,
  waterline: 425,
  depths: { sunlit: 260, twilight: 150, midnight: 150, abyss: 195 },
};

/** The hero's iceberg, through the one placement every Scene shares: keel a fifth into Twilight, twice the tip deep. */
export function heroIceberg(depth: HeroDepth): IcebergPlacement {
  return placeIcebergInBands(heroDepthBands(depth), { x: 1010, waterline: depth.waterline, scale: 0.75 });
}

/** How tall the drawn seabed is, ridge to foot (`Seabed`). */
const SEABED_HEIGHT = 80;

/** Where the hero's seabed lies: its foot on the drawing's bottom, its ridge in the Abyss (feedback 3, decision 45). */
export function heroSeabed({ height }: HeroDepth): { readonly y: number; readonly height: number } {
  return { y: height - SEABED_HEIGHT, height: SEABED_HEIGHT };
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

/** How far the boundaries between the zones under the waterline wave above and below their line. */
const BOUNDARY_AMPLITUDE = 14;

/** One underwater band of the hero: its two boundaries and its facets, across the bleed. */
export interface HeroWaterBand {
  readonly zone: UnderwaterZone;
  readonly top: ZoneEdge;
  readonly bottom: ZoneEdge;
  readonly facets: readonly SeaFacet[];
}

/**
 * The hero's water under the waterline (feedback 2, decision 8; feedback 3, decision 45): each band between two
 * boundaries from `zoneEdge`, low poly in the shared water cell, run a whole drawing's width past each side, so a
 * wider screen, or a short one that shrinks the drawing, sees the same water with no flat column beside it. The
 * waterline and the drawing's bottom stay straight; every boundary between two zones waves.
 */
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

/** How far the ship reaches above the waterline in the hero's units: its masthead and pennant (`Ship`). */
export const HERO_SHIP_TOP = 190;
/** The air kept between the title's last line and the masthead, in the hero's units. */
const AIR = 24;

/** A window the hero fills, in CSS pixels. */
export type HeroWindow = TitleWindow;

/** The hero title's lines on a wide screen, a tablet and a phone, counted generously for the German title. */
const HERO_LINES: TitleLines = [2, 3, 5];

/** Where the hero title's last line ends, in pixels from the top: its words start a rem under the header band. */
export function heroTitleBottom(window: HeroWindow): number {
  return titleBottom(window, { role: HERO_ROLE, lines: HERO_LINES, below: 16 });
}

/** The share of the drawing's height above the ship's masthead: what must clear the title. */
export function heroKeep(depth: HeroDepth = HERO_DEPTH): number {
  return (depth.waterline - HERO_SHIP_TOP - AIR) / depth.height;
}

/**
 * How far the hero drawing starts below the window's top (feedback 3, option B): on a window too short for the title
 * above the ship at a 36% sky, the drawing moves down and shrinks, its sky bleeding up above it, until the masthead
 * clears the title's last line; every zone and the seabed still show. Zero on a window tall enough. The hero's CSS
 * module computes the same from `heroLiftStyle`'s numbers and the tokens.
 */
export function heroLift(window: HeroWindow, depth: HeroDepth = HERO_DEPTH): number {
  const keep = heroKeep(depth);
  return Math.max(0, (heroTitleBottom(window) - keep * window.height) / (1 - keep));
}

/** The numbers the hero's CSS module lifts the drawing by: the share to keep clear and the title's line counts. */
export function heroLiftStyle(depth: HeroDepth = HERO_DEPTH): Readonly<Record<`--${string}`, string>> {
  return { '--hero-keep': heroKeep(depth).toFixed(4), ...titleLineStyle(HERO_LINES) };
}
