import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { eventEpisodeRoute, type EpisodeId, type EventSlug } from '@/lib/routes';

/** The card fields an Event's Playlist reads. */
type PlaylistCard = Pick<EpisodeCard, 'slug' | 'route' | 'minutes'>;

/** What the cards read of an Event the store serves (`ServedEvent`): its slug, and each listed Episode with its page. */
interface EventWithPlaylist<Listed> {
  readonly slug: EventSlug;
  readonly playlist: { readonly episodes: readonly { readonly episode: Listed; readonly page?: EpisodeId }[] };
}

/**
 * The Playlist's Episodes as cards, in the Playlist's order, each linked card opening the Episode under its Event so
 * the attendee stays in the Event's context; a card with no page stays unlinked.
 */
export function eventPlaylistCards<Listed, Card extends Pick<EpisodeCard, 'route' | 'href'>>(
  event: EventWithPlaylist<Listed>,
  cardOf: (episode: Listed) => Card,
  locale: Locale,
): Card[] {
  return event.playlist.episodes.map(({ episode, page }) => {
    const card = cardOf(episode);
    if (card.route === null || page === undefined) return card;
    const route = eventEpisodeRoute(event.slug, page);
    return { ...card, route, href: localizePath(route, locale) };
  });
}

/** The Playlist's reading time: the counted minutes of the Episodes that have them; none when no Episode has one, so nothing shows. */
export function totalMinutes(cards: readonly PlaylistCard[]): number | undefined {
  const known = cards.flatMap((card) => (card.minutes === undefined ? [] : [card.minutes]));
  return known.length === 0 ? undefined : known.reduce((sum, minutes) => sum + minutes, 0);
}

/** The first Episode a visitor can open, with its 1-based step in the Playlist; none while every Episode is upcoming. */
export function startOf<Card extends PlaylistCard>(cards: readonly Card[]): { step: number; card: Card } | undefined {
  const index = cards.findIndex((card) => card.route !== null);
  return index === -1 ? undefined : { step: index + 1, card: cards[index] };
}
