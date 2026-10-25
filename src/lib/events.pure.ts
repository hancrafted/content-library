import type { IsoDate } from '../content-store/schemas/fields';

/**
 * Whether an Event is past: its date lies before the build day (design-ADR 0016, Past Event). Derived, never stored;
 * an Event built on its own day is still upcoming. ISO days compare as strings.
 */
export function isPastEvent(date: IsoDate, buildDay: IsoDate): boolean {
  return date < buildDay;
}

/**
 * Where one Episode sits in its Event's Playlist, for an Event-scoped Episode page: its 1-based position and the
 * count, which every listed Episode makes, and the nearest Episode before and after it that has a page to walk to.
 */
export interface PlaylistPlace {
  readonly position: number;
  readonly count: number;
  readonly previous?: string;
  readonly next?: string;
}

/** The Episode's place in the Playlist's order; throws on a slug the Playlist does not list, so the build fails. */
export function playlistPlace(
  episodes: readonly string[],
  slug: string,
  hasPage: (slug: string) => boolean,
): PlaylistPlace {
  const index = episodes.indexOf(slug);
  if (index === -1) throw new Error(`The Playlist lists no Episode "${slug}"`);
  const previous = episodes.slice(0, index).reverse().find(hasPage);
  const next = episodes.slice(index + 1).find(hasPage);
  return {
    position: index + 1,
    count: episodes.length,
    ...(previous === undefined ? {} : { previous }),
    ...(next === undefined ? {} : { next }),
  };
}
