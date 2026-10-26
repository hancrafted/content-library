import { episodeRefOf, matchEpisode } from '@/content-store/catalogue/episode-id.pure';
import {
  isEpisodeId,
  matchPage,
  TOOLING_SLUGS,
  type EpisodeId,
  type EpisodesPathSlug,
  type EventSlug,
  type PageRef,
} from '@/content-store/catalogue/routes';
import {
  episodePageTreatment,
  pageTreatment,
  type PageFacts,
  type PageTreatment,
  type TreatedPage,
} from '@/content-store/catalogue/visibility.pure';
import type { Content, LoadedEpisode } from '../refusals';
import type { ServedEvent } from '../served-event';

/*
 * The page catalogue (GLOSSARY, FE-005, FE-008): every page the site has, read from the records, each with its
 * treatment from the one visibility predicate (design-ADR 0016, Routes and visibility). Pages, routes, the sitemap,
 * page metadata and the site's own lists ask it "treatment of this page"; none fetches the facts of what a page
 * presents and pairs them with the predicate itself. The store serves one catalogue over its records (`store.ts`).
 */

export interface PageCatalogue {
  /**
   * Every page, each once, with its treatment: the site's own lists, each Episode's own page (public or not), each
   * tooling page, each Event, then each Episode under its Event. Only a page whose treatment says `exported` is built;
   * the sitemap keeps this order.
   */
  readonly pages: readonly TreatedPage[];
  /** A page's treatment; a page whose record the records do not hold is never listed or indexed (fails closed). */
  readonly treatmentOf: (page: PageRef) => PageTreatment;
  /** One static param per page built under `/episodes/`: each exported Episode's own page and each tooling page. */
  readonly episodesPathParams: () => { episode: EpisodesPathSlug }[];
  /** One static param per Event page. */
  readonly eventParams: () => { event: EventSlug }[];
  /**
   * One static param per Episode an Event's Playlist presents that has a page, built under the Event at the Episode's
   * slug: an Event's copy at its own slug, unique within its Event's Playlist.
   */
  readonly eventEpisodeParams: () => { event: EventSlug; episode: string }[];
  /** The Episodes the site's own lists show (overview, Spotlight, Upcoming), in record order: never an unlisted one or a copy. */
  readonly listedEpisodes: () => readonly LoadedEpisode[];
  /** The Events `/events/` lists, in record order: those whose Playlist is public. */
  readonly listedEvents: () => readonly ServedEvent[];
}

const NO_FACTS: PageFacts = {};

/** What an Episode presents, as the predicate reads it: its visibility, its status, and whether it is an Event's copy. */
function episodeFactsOf({ id, visibility, status }: LoadedEpisode): PageFacts {
  const copy = matchEpisode(episodeRefOf(id), { standalone: () => false, 'event-copy': () => true });
  return { visibility, status, ...(copy && { copy }) };
}

/** What a page presents, as the predicate reads it; an Episode or Event the records do not hold hands in nothing. */
function factsIn(content: Content, page: PageRef): PageFacts {
  const none = () => NO_FACTS;
  const episodeFacts = ({ episode: id }: { readonly episode: EpisodeId }): PageFacts => {
    const episode = content.episodes.find((entry) => entry.id === id);
    return episode === undefined ? NO_FACTS : episodeFactsOf(episode);
  };
  return matchPage(page, {
    home: none,
    dashboard: none,
    episodes: none,
    events: none,
    episode: episodeFacts,
    tooling: none,
    event: ({ event: slug }) => {
      const event = content.events.find((entry) => entry.slug === slug);
      return event === undefined ? NO_FACTS : { visibility: event.playlist.visibility };
    },
    'event-episode': episodeFacts,
  });
}

/** The page an Episode has at `/episodes/<slug>/`: one no Event owns, with a page; an Event's copy has none there. */
function ownPageOf({ id }: LoadedEpisode): PageRef[] {
  if (!isEpisodeId(id)) return [];
  return matchEpisode(episodeRefOf(id), {
    standalone: () => [{ kind: 'episode', episode: id }],
    'event-copy': () => [],
  });
}

/** Every page the records give, in the catalogue's order. */
function pagesIn(content: Content): PageRef[] {
  return [
    { kind: 'home' },
    { kind: 'dashboard' },
    { kind: 'episodes' },
    { kind: 'events' },
    ...content.episodes.flatMap(ownPageOf),
    ...TOOLING_SLUGS.map((tooling) => ({ kind: 'tooling', tooling }) as const),
    ...content.events.map(({ slug }) => ({ kind: 'event', event: slug }) as const),
    ...content.events.flatMap(({ slug: event, playlist }) =>
      playlist.episodes.flatMap(({ page }) =>
        page === undefined ? [] : [{ kind: 'event-episode', event, episode: page } as const],
      ),
    ),
  ];
}

/** The catalogue of the pages these records give: what the store serves over its own records. */
export function catalogueOf(content: Content): PageCatalogue {
  const treatmentOf = (page: PageRef) => pageTreatment(page, factsIn(content, page));
  const pages = pagesIn(content).map((page) => ({ page, treatment: treatmentOf(page) }));
  const built = pages.filter(({ treatment }) => treatment.exported).map(({ page }) => page);
  return {
    pages,
    treatmentOf,
    episodesPathParams: () =>
      built.flatMap((page): { episode: EpisodesPathSlug }[] => {
        if (page.kind === 'episode') return [{ episode: page.episode }];
        return page.kind === 'tooling' ? [{ episode: page.tooling }] : [];
      }),
    eventParams: () => built.flatMap((page) => (page.kind === 'event' ? [{ event: page.event }] : [])),
    eventEpisodeParams: () =>
      built.flatMap((page) =>
        page.kind === 'event-episode' ? [{ event: page.event, episode: episodeRefOf(page.episode).slug }] : [],
      ),
    listedEpisodes: () => content.episodes.filter((episode) => episodePageTreatment(episodeFactsOf(episode)).listed),
    listedEvents: () => content.events.filter(({ slug }) => treatmentOf({ kind: 'event', event: slug }).listed),
  };
}
