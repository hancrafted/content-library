// decision: docs/adr/0025-scene-figures-are-deep-modules.md
// decision: FE-012 §3.1
import { ZONES, type Zone } from './zones.pure';

export interface ZoneLabelWords {
  readonly name: string;
  readonly metres: string;
  readonly science: string;
}

export type ZoneWords = Readonly<Record<Zone, ZoneLabelWords>>;

export type ZoneWordKey = `zones.${Zone}.${keyof ZoneLabelWords}`;

export function zoneWordsFrom(read: (key: ZoneWordKey) => string): ZoneWords {
  const words = (zone: Zone): ZoneLabelWords => ({
    name: read(`zones.${zone}.name`),
    metres: read(`zones.${zone}.metres`),
    science: read(`zones.${zone}.science`),
  });
  return Object.fromEntries(ZONES.map((zone) => [zone, words(zone)])) as Record<Zone, ZoneLabelWords>;
}
