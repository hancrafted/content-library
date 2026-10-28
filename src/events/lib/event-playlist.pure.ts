import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { eventEpisodeRoute, type EpisodeId, type EventSlug } from '@/content-store/catalogue/record-routes';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';

/**
 * The card fields an Event's Playlist reads of each Episode card page assembly hands it: the logical path of its page
 * (`null` while announced only) and that path localized.
 */
export interface PlaylistCard {
  readonly route: string | null;
  readonly href: string | null;
}

/**
 * What the cards read of an Event the store serves (`ServedEvent`): its slug, and each entry with its Episode, the
 * anchor it opens at, and its page.
 */
interface EventWithPlaylist<Listed> {
  readonly slug: EventSlug;
  readonly playlist: {
    readonly episodes: readonly {
      readonly episode: Listed;
      readonly anchor?: string;
      readonly page?: EpisodeRef<EpisodeId>;
    }[];
  };
}

/**
 * The Playlist's entries as cards, in the Playlist's order, each linked card opening the Episode under its Event so
 * the attendee stays in the Event's context, at its anchor when the entry names one; a card with no page stays
 * unlinked. `cardOf` gets the anchor too, so an anchored entry's card can show its Section.
 */
export function eventPlaylistCards<Listed, Card extends PlaylistCard>(
  event: EventWithPlaylist<Listed>,
  cardOf: (episode: Listed, anchor?: string) => Card,
  locale: Locale,
): Card[] {
  return event.playlist.episodes.map(({ episode, anchor, page }) => {
    const card = cardOf(episode, anchor);
    if (card.route === null || page === undefined) return card;
    const route = `${eventEpisodeRoute(event.slug, page)}${anchor === undefined ? '' : `#${anchor}`}`;
    return { ...card, route, href: localizePath(route, locale) };
  });
}

/** The first Episode a visitor can open, with its 1-based step in the Playlist; none while every Episode is upcoming. */
export function startOf<Card extends Pick<PlaylistCard, 'route'>>(
  cards: readonly Card[],
): { step: number; card: Card } | undefined {
  const index = cards.findIndex((card) => card.route !== null);
  return index === -1 ? undefined : { step: index + 1, card: cards[index] };
}
