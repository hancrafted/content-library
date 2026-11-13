/*
 * The Iceberg style's depth (docs/design/design-guide.md#iceberg, design-ADR 0025): the five zones from the top, the
 * one mapping from a zone to its colour token and its text, and the depth ruler's layout, one tile per Section on its
 * zone's band. An Episode hands over which zone each of its Sections sits in; the style knows no Episode.
 */

/** The Iceberg style's five zones, from the top. */
export const ZONES = ['surface', 'sunlit', 'twilight', 'midnight', 'abyss'] as const;
export type Zone = (typeof ZONES)[number];

/** Zones dark in both themes, whose surfaces carry light text in both. */
const DARK_ZONES: ReadonlySet<Zone> = new Set(['midnight', 'abyss']);

/** The zone's one colour token in `globals.css`, light and dark there: what every Iceberg surface reads. */
export function zoneToken(zone: Zone): string {
  return `var(--zone-${zone})`;
}

/** True where the zone is dark in both themes, so text on it turns light. */
export function isDarkZone(zone: Zone): boolean {
  return DARK_ZONES.has(zone);
}

/** The zone a Section sits in; the one place a Section out of the Episode's range is refused. */
export function zoneOf(sections: readonly Zone[], section: number): Zone {
  const zone = Number.isInteger(section) ? sections[section] : undefined;
  if (zone === undefined) throw new Error(`No Section ${section} of ${sections.length}; Sections count from 0.`);
  return zone;
}

/** How many bands the ruler's view travels down from the Surface to reach a Section's band. */
export function descentOf(sections: readonly Zone[], section: number): number {
  return ZONES.indexOf(zoneOf(sections, section));
}

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
  zoneOf(sections, lit);
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
