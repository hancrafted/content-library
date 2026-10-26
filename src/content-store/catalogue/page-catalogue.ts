import { matchEpisode } from '@/content-store/catalogue/episode-id.pure';
import {
  hasPage,
  matchPage,
  TOOLING_SLUGS,
  type EpisodeId,
  type EpisodesPathPage,
  type EpisodesPathSlug,
  type EventSlug,
  type PageOf,
  type PageRef,
} from '@/content-store/catalogue/record-routes';
import {
  episodePageTreatment,
  pageTreatment,
  type PageFacts,
  type PageTreatment,
  type TreatedPage,
} from '@/content-store/catalogue/visibility.pure';
import type { LoadedEpisode } from '../episode-refusals';
import type { Content } from '../refusals';
import type { PresentedEpisode, ServedEvent } from '../served-event';

/*
 * The page catalogue (GLOSSARY, FE-005, FE-008): every page the site has, read from the records, each with its
 * treatment from the one visibility predicate (design-ADR 0016, Routes and visibility). Pages, routes, the sitemap,
 * page metadata and the site's own lists ask it "treatment of this page"; none fetches the facts of what a page
 * presents and pairs them with the predicate itself. It holds both directions between a page and its route's params:
 * the static params each built page exports, and the built page a route's params name, or none. The store serves one
 * catalogue over its records (`store.ts`); the page templates turn "none" into the 404.
 */

/** The params of a page built under `/episodes/`: `/episodes/<episode>/`. */
export interface EpisodesPathParams {
  readonly episode: EpisodesPathSlug;
}

/** The params of an Episode's page under its Event: `/events/<event>/episodes/<episode>/`, the Episode's slug. */
export interface EventEpisodeParams {
  readonly event: EventSlug;
  readonly episode: string;
}

/**
 * An Episode's page under its Event, carrying the Episode it presents there: the served Event, its ref and its place
 * in the Playlist. Still a page reference, so it is treated, titled and matched like any other.
 */
export type EventEpisodePage = PageOf<'event-episode'> & { readonly presented: PresentedEpisode };

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
  readonly episodesPathParams: () => EpisodesPathParams[];
  /**
   * The page built at `/episodes/<episode>/`: an Episode's own page, or a tooling page. Undefined when none is built
   * there: an unknown slug, or an Event's copy, which lives only under its Event.
   */
  readonly episodesPathPageAt: (params: { readonly episode: string }) => EpisodesPathPage | undefined;
  /** One static param per Event page. */
  readonly eventParams: () => { event: EventSlug }[];
  /**
   * One static param per Episode an Event's Playlist presents that has a page, built under the Event at the Episode's
   * slug: an Event's copy at its own slug, unique within its Event's Playlist.
   */
  readonly eventEpisodeParams: () => EventEpisodeParams[];
  /**
   * The page built at `/events/<event>/episodes/<episode>/`, with the Episode it presents. Undefined when none is
   * built there: an Event the records do not hold, or an Episode its Playlist does not list with a page.
   */
  readonly eventEpisodePageAt: (params: {
    readonly event: string;
    readonly episode: string;
  }) => EventEpisodePage | undefined;
  /** The Episodes the site's own lists show (overview, Spotlight, Upcoming), in record order: never an unlisted one or a copy. */
  readonly listedEpisodes: () => readonly LoadedEpisode[];
  /** The Events `/events/` lists, in record order: those whose Playlist is public. */
  readonly listedEvents: () => readonly ServedEvent[];
}

const NO_FACTS: PageFacts = {};

/** What an Episode presents, as the predicate reads it: its visibility, its status, and whether it is an Event's copy. */
function episodeFactsOf({ ref, visibility, status }: LoadedEpisode): PageFacts {
  const copy = matchEpisode(ref, { standalone: () => false, 'event-copy': () => true });
  return { visibility, status, ...(copy && { copy }) };
}

/** What a page presents, as the predicate reads it; an Episode or Event the records do not hold hands in nothing. */
function factsIn(content: Content, page: PageRef): PageFacts {
  const none = () => NO_FACTS;
  const episodeFacts = ({ episode: { id } }: { readonly episode: { readonly id: EpisodeId } }): PageFacts => {
    const episode = content.episodes.find(({ ref }) => ref.id === id);
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
function ownPageOf({ ref }: LoadedEpisode): PageRef[] {
  if (!hasPage(ref)) return [];
  return matchEpisode(ref, {
    standalone: () => [{ kind: 'episode', episode: ref }],
    'event-copy': () => [],
  });
}

/** Each Episode every Event's Playlist presents with a page, in record order, with its page under the Event. */
function eventEpisodePagesIn(content: Content): EventEpisodePage[] {
  return content.events.flatMap((event) =>
    event.playlist.episodes.flatMap(({ page: episode, place }) =>
      episode === undefined
        ? []
        : [{ kind: 'event-episode', event: event.slug, episode, presented: { event, episode, place } } as const],
    ),
  );
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
    ...eventEpisodePagesIn(content).map(({ kind, event, episode }) => ({ kind, event, episode })),
  ];
}

/** The params a page under `/episodes/` is built at: an Episode's own page at its slug, a tooling page at its. */
export function episodesPathParamsOf(page: EpisodesPathPage): EpisodesPathParams {
  return matchPage(page, {
    episode: ({ episode }) => ({ episode: episode.id }),
    tooling: ({ tooling }) => ({ episode: tooling }),
  });
}

/** The params an Episode's page under its Event is built at: the Event's slug and the Episode's slug. */
export function eventEpisodeParamsOf({ event, episode }: PageOf<'event-episode'>): EventEpisodeParams {
  return { event, episode: episode.slug };
}

const isEpisodesPathPage = (page: PageRef): page is EpisodesPathPage =>
  page.kind === 'episode' || page.kind === 'tooling';

/** The catalogue of the pages these records give: what the store serves over its own records. */
export function catalogueOf(content: Content): PageCatalogue {
  const treatmentOf = (page: PageRef) => pageTreatment(page, factsIn(content, page));
  const pages = pagesIn(content).map((page) => ({ page, treatment: treatmentOf(page) }));
  const built = pages.filter(({ treatment }) => treatment.exported).map(({ page }) => page);
  const builtUnderEpisodes = built.filter(isEpisodesPathPage);
  const builtUnderEvents = eventEpisodePagesIn(content).filter((page) => treatmentOf(page).exported);
  return {
    pages,
    treatmentOf,
    episodesPathParams: () => builtUnderEpisodes.map(episodesPathParamsOf),
    episodesPathPageAt: ({ episode }) =>
      builtUnderEpisodes.find((page) => episodesPathParamsOf(page).episode === episode),
    eventParams: () => built.flatMap((page) => (page.kind === 'event' ? [{ event: page.event }] : [])),
    eventEpisodeParams: () => builtUnderEvents.map(eventEpisodeParamsOf),
    eventEpisodePageAt: (params) =>
      builtUnderEvents.find((page) => {
        const { event, episode } = eventEpisodeParamsOf(page);
        return event === params.event && episode === params.episode;
      }),
    listedEpisodes: () => content.episodes.filter((episode) => episodePageTreatment(episodeFactsOf(episode)).listed),
    listedEvents: () => content.events.filter(({ slug }) => treatmentOf({ kind: 'event', event: slug }).listed),
  };
}
