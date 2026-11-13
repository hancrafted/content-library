/*
 * The words a zone is named in (design-ADR 0025, Interaction 2): its plain name, its depth in metres and its
 * scientific name. A plain `slide-shared` part owns no words (FE-012 §3.1), so a Slide reads them from its own
 * `i18n/` under `zones.<zone>.<word>`, through its `t`, and hands the part plain strings.
 */
import { ZONES, type Zone } from './ruler.pure';

/** One zone's words. */
export interface ZoneLabelWords {
  /** The plain zone name, always visible: `Twilight`. */
  readonly name: string;
  /** Its depth in metres: `200–1,000 m`. */
  readonly metres: string;
  /** Its scientific name: `mesopelagic`. */
  readonly science: string;
}

/** Each zone's words, from the Surface down. */
export type ZoneWords = Readonly<Record<Zone, ZoneLabelWords>>;

/** The key a zone word sits under in a Slide's `i18n/`: `zones.twilight.science`. */
export type ZoneWordKey = `zones.${Zone}.${keyof ZoneLabelWords}`;

/** The five zones' words, each read by its key: `zoneWordsFrom((key) => t(key))`. */
export function zoneWordsFrom(read: (key: ZoneWordKey) => string): ZoneWords {
  const words = (zone: Zone): ZoneLabelWords => ({
    name: read(`zones.${zone}.name`),
    metres: read(`zones.${zone}.metres`),
    science: read(`zones.${zone}.science`),
  });
  return Object.fromEntries(ZONES.map((zone) => [zone, words(zone)])) as Record<Zone, ZoneLabelWords>;
}
