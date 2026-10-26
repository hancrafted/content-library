import { localizePath, type Locale } from '@/lib/locale.pure';
import { eventEpisodeRoute, isEpisodeSlug, type EventSlug } from '@/lib/routes';
import type { EpisodeCard } from './episode-card.pure';

/** The card fields an Event's Playlist reads. */
type PlaylistCard = Pick<EpisodeCard, 'slug' | 'route' | 'minutes'>;

/**
 * The Playlist's Episodes as cards, in the Playlist's order, each linked card opening the Episode under its Event so
 * the attendee stays in the Event's context; a card with no page stays unlinked. Throws on an Episode with no card,
 * so the build fails rather than ships a gap.
 */
export function eventPlaylistCards<Card extends Pick<EpisodeCard, 'slug' | 'route' | 'href'>>(
  { event, episodes }: { event: EventSlug; episodes: readonly string[] },
  cards: readonly Card[],
  locale: Locale,
): Card[] {
  return episodes.map((slug) => {
    const card = cards.find((each) => each.slug === slug);
    if (card === undefined) throw new Error(`No Episode card for "${slug}" in the Playlist of Event ${event}`);
    if (card.route === null) return card;
    if (!isEpisodeSlug(slug))
      throw new Error(`The linked card "${slug}" in the Playlist of Event ${event} is no registered Episode`);
    const route = eventEpisodeRoute(event, slug);
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
