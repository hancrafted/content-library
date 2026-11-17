import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { eventEpisodeRoute, type EpisodeId, type EventSlug } from '@/content-store/catalogue/record-routes';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';

export interface PlaylistCard {
  readonly route: string | null;
  readonly href: string | null;
}

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
