import { eventEpisodeRoute, eventRoute, routeOf, type EpisodesPathPage } from '@/content-store/catalogue/record-routes';
import type { EventEpisodePage, ServedEvent } from '@/content-store/store';
import { summaryOf } from '@/episodes/lib/page-summary';
import { eventCopy } from '@/events/lib/event-words';
import type { Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import type { TocCollection, TocPageContext } from '@/shared/lib/table-of-contents.pure';

export function episodeContextOf(
  page: EventEpisodePage | EpisodesPathPage,
  locale: Locale,
  backLabel: string,
): TocPageContext {
  return {
    title: summaryOf(page.episode)[locale].title,
    route: routeOf(page),
    back: {
      label: page.kind === 'event-episode' ? eventCopy(page.presented.event.slug, locale).title : backLabel,
      route: page.kind === 'event-episode' ? eventRoute(page.presented.event.slug) : ROUTES.episodes,
    },
  };
}

/** The Event's page-bearing Episodes, in Playlist order, projected for domain-free page chrome. */
export function eventNavigationOf(event: ServedEvent, locale: Locale): TocCollection {
  return {
    title: eventCopy(event.slug, locale).title,
    route: eventRoute(event.slug),
    pages: event.playlist.episodes.flatMap(({ page, repeat }) =>
      page === undefined || repeat
        ? []
        : [
            {
              route: eventEpisodeRoute(event.slug, page),
              title: summaryOf(page)[locale].title,
              sections: summaryOf(page)[locale].sections,
            },
          ],
    ),
  };
}
