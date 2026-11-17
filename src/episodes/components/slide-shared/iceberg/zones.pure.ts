// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export const ZONES = ['surface', 'sunlit', 'twilight', 'midnight', 'abyss'] as const;
export type Zone = (typeof ZONES)[number];

const DARK_ZONES: ReadonlySet<Zone> = new Set(['twilight', 'midnight', 'abyss']);

export function zoneToken(zone: Zone): string {
  return `var(--zone-${zone})`;
}

export function isDarkZone(zone: Zone): boolean {
  return DARK_ZONES.has(zone);
}

export function zoneOf(sections: readonly Zone[], section: number): Zone {
  const zone = Number.isInteger(section) ? sections[section] : undefined;
  if (zone === undefined) throw new Error(`No Section ${section} of ${sections.length}; Sections count from 0.`);
  return zone;
}

export interface RailTile {
  readonly section: number;
  readonly lit?: true;
}

export interface RailBand {
  readonly zone: Zone;
  readonly tiles: readonly RailTile[];
}

export function railBands(sections: readonly Zone[], lit: number): readonly RailBand[] {
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
