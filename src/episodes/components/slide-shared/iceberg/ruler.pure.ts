/*
 * The Iceberg style's depth (docs/design/design-guide.md#iceberg, design-ADR 0025): the five zones from the top, and
 * the depth ruler's layout, one tile per Section on its zone's band. An Episode hands over which zone each of its
 * Sections sits in; the style knows no Episode.
 */

/** The Iceberg style's five zones, from the top. */
export const ZONES = ['surface', 'sunlit', 'twilight', 'midnight', 'abyss'] as const;
export type Zone = (typeof ZONES)[number];

/** One Section's tile on the ruler; `lit` only on the Section the Slide belongs to. */
export interface RulerTile {
  readonly section: number;
  readonly lit?: true;
}

/** One zone's band and the tiles of the Sections that sit in it, from the top. */
export interface RulerBand {
  readonly zone: Zone;
  readonly tiles: readonly RulerTile[];
}

/**
 * The ruler's five bands, each Section's tile on its zone's band and the Section `lit` lit. Sections only go down:
 * an Episode's descent never climbs back towards the Surface.
 */
export function rulerBands(sections: readonly Zone[], lit: number): readonly RulerBand[] {
  if (!Number.isInteger(lit) || lit < 0 || lit >= sections.length)
    throw new Error(`No Section ${lit} of ${sections.length} to light; Sections count from 0.`);
  sections.forEach((zone, index) => {
    const above = sections[index - 1];
    if (above !== undefined && ZONES.indexOf(zone) < ZONES.indexOf(above))
      throw new Error(
        `Section ${index} sits in ${zone}, above Section ${index - 1}; each Section sits as deep or deeper.`,
      );
  });
  return ZONES.map((zone) => ({
    zone,
    tiles: sections.flatMap((own, section) =>
      own === zone ? [section === lit ? { section, lit: true as const } : { section }] : [],
    ),
  }));
}
