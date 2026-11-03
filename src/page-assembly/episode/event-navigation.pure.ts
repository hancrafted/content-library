import { eventEpisodeRoute, eventRoute } from '@/content-store/catalogue/record-routes';
import type { ServedEvent } from '@/content-store/store';
import { tocSectionsOf } from '@/episodes/components/episode-page/episode-page-container.pure';
import { localizeSlideOutline } from '@/episodes/components/slide-master/slide-outline';
import { placeSections } from '@/episodes/lib/episode.pure';
import { compositionOf } from '@/episodes/lib/registry';
import { eventCopy } from '@/events/lib/event-words';
import type { Locale } from '@/shared/lib/locale.pure';
import type { TocCollection } from '@/shared/lib/table-of-contents.pure';

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
              title: compositionOf(page).messages[locale].title,
              sections: tocSectionsOf(
                placeSections(compositionOf(page).sections)
                  .flat()
                  .map((slide) => localizeSlideOutline(slide, locale)),
              ),
            },
          ],
    ),
  };
}
