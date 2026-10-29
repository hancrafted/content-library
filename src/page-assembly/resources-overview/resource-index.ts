import { matchEpisode } from '@/content-store/catalogue/episode-id.pure';
import { hasPage, pageLocales, routeOf, type PageRef } from '@/content-store/catalogue/record-routes';
import {
  listedEpisodes,
  listedEvents,
  listedExplorablePages,
  listedGuides,
  listedTemplates,
  type LoadedEpisode,
} from '@/content-store/store';
import { compositionOf } from '@/episodes/lib/registry';
import { eventCopy } from '@/events/lib/event-words';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import type { ResourceEntry, ResourceKind } from './resource-index.pure';

/** One listed page with its record's Tags and the words it says of itself, before it is spread over its locales. */
interface Listed {
  readonly kind: ResourceKind;
  readonly slug: string;
  readonly page: PageRef;
  readonly tags: ResourceEntry['tags'];
  readonly words: (locale: Locale) => Pick<ResourceEntry, 'title' | 'description'>;
}

/** The Episodes the overview lists that have a page of their own; an announced one with no page yet has no URL to list. */
function listedEpisodePages(): Listed[] {
  return listedEpisodes().flatMap(({ ref, tags }: LoadedEpisode): Listed[] =>
    hasPage(ref)
      ? matchEpisode(ref, {
          standalone: (episode) => [
            {
              kind: 'episode',
              slug: episode.slug,
              page: { kind: 'episode', episode },
              tags,
              words: (locale: Locale) => compositionOf(episode).messages[locale],
            },
          ],
          'event-copy': () => [],
        })
      : [],
  );
}

function listedEventPages(): Listed[] {
  return listedEvents().map(({ slug, tags }) => ({
    kind: 'event',
    slug,
    page: { kind: 'event', event: slug },
    tags,
    words: (locale) => eventCopy(slug, locale),
  }));
}

function listedExplorablePagePages(): Listed[] {
  return listedExplorablePages().map(({ page, tags }) => ({
    kind: 'explorable-page',
    slug: page.explorablePage.slug,
    page,
    tags,
    words: (locale) => compositionOf(page.explorablePage).messages[locale],
  }));
}

function listedGuidePages(): Listed[] {
  return listedGuides().map(({ page, tags }) => ({
    kind: 'guide',
    slug: page.guide.slug,
    page,
    tags,
    words: (locale) => compositionOf(page.guide).messages[locale],
  }));
}

function listedTemplatePages(): Listed[] {
  return listedTemplates().map(({ page, tags }) => ({
    kind: page.type,
    slug: page.template.slug,
    page,
    tags,
    words: (locale) => compositionOf(page.template).messages[locale],
  }));
}

/**
 * The Resource index: every listed page of every kind, one entry per locale the page is exported in, projected from
 * the page catalogue's lists and never stored, so it cannot hold a page the site does not list. Title and description
 * are each composition's or Event's own words.
 */
export function resourceIndex(): ResourceEntry[] {
  const listed = [
    ...listedEpisodePages(),
    ...listedEventPages(),
    ...listedExplorablePagePages(),
    ...listedGuidePages(),
    ...listedTemplatePages(),
  ];
  return listed.flatMap(({ kind, slug, page, tags, words }) =>
    pageLocales(page).map((locale) => {
      const route = routeOf(page);
      const { title, description } = words(locale);
      return { kind, slug, title, description, tags, route, url: localizePath(route, locale), locale };
    }),
  );
}
