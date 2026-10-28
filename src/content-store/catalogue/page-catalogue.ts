import { matchEpisode, resourceRef } from '@/content-store/catalogue/episode-id.pure';
import {
  hasPage,
  pageKeyOf,
  type EpisodeId,
  type EpisodesPathPage,
  type EpisodesPathSlug,
  type EventSlug,
  type PageOf,
  type PageRef,
  type ResourceSlug,
} from '@/content-store/catalogue/record-routes';
import {
  pageTreatment,
  type PageFacts,
  type PageTreatment,
  type TreatedPage,
} from '@/content-store/catalogue/visibility.pure';
import type { LoadedEpisode } from '../episode-refusals';
import type { Content } from '../refusals';
import type { ResourceType } from '../schemas/fields';
import type { Resource } from '../schemas/resource.schema';
import type { PresentedEpisode, ServedEvent } from '../served-event';

/*
 * The page catalogue (GLOSSARY, FE-005, FE-008): every page the site has, read from the records, each with its
 * treatment from the one visibility predicate (design-ADR 0016, Routes and visibility). Pages, routes, the sitemap,
 * page metadata and the site's own lists ask it "treatment of this page"; none fetches the facts of what a page
 * presents and pairs them with the predicate itself. It also maps each built page to its route's params and back
 * (GLOSSARY, page catalogue). The store serves one catalogue over its records (`store.ts`).
 */

/** The params of a page built under `/episodes/`: `/episodes/<episode>/`. */
export interface EpisodesPathParams {
  readonly episode: EpisodesPathSlug;
}

/** The params of a page built under a Resource type's path: `/<type plural>/<resource>/`. */
export interface ResourceParams {
  readonly resource: ResourceSlug;
}

/** A Resource the overview lists: its page, its record's type, Tags and slug. */
export interface ListedResource {
  readonly page: PageOf<'resource'>;
  readonly tags: Resource['tags'];
}

/** The params of an Episode's page under its Event: `/events/<event>/episodes/<episode>/`, the Episode's slug. */
export interface EventEpisodeParams {
  readonly event: EventSlug;
  readonly episode: string;
}

/** A route's params as the URL hands them in, each a plain string, before the catalogue names the page they build. */
export type RouteParams<P> = { readonly [K in keyof P]: string };

/**
 * An Episode's page under its Event, carrying the Episode it presents there: the served Event, its ref and its place
 * in the Playlist. Still a page reference, so it is treated, titled and matched like any other.
 */
export type EventEpisodePage = PageOf<'event-episode'> & { readonly presented: PresentedEpisode };

export interface PageCatalogue {
  /**
   * Every page, each once, with its treatment: the site's own lists, each Episode's own page (public or not), each
   * Resource page, each Event, then each Episode under its Event. Only a page whose treatment says `exported` is built;
   * the sitemap keeps this order.
   */
  readonly pages: readonly TreatedPage[];
  /** A page's treatment; a page whose record the records do not hold is never listed or indexed (fails closed). */
  readonly treatmentOf: (page: PageRef) => PageTreatment;
  /** One static param per page built under `/episodes/`: each exported Episode's own page. */
  readonly episodesPathParams: () => EpisodesPathParams[];
  /**
   * The page built at `/episodes/<episode>/`: an Episode's own page. Undefined when none is built there: an unknown
   * slug, or an Event's copy, which lives only under its Event.
   */
  readonly episodesPathPageAt: (params: RouteParams<EpisodesPathParams>) => EpisodesPathPage | undefined;
  /** One static param per built Resource page of this type, for the route under that type's path. */
  readonly resourceParams: (type: ResourceType) => ResourceParams[];
  /** The Resource page built at `/<type plural>/<resource>/`; undefined for a slug of another type or none. */
  readonly resourcePageAt: (type: ResourceType, params: RouteParams<ResourceParams>) => PageOf<'resource'> | undefined;
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
  readonly eventEpisodePageAt: (params: RouteParams<EventEpisodeParams>) => EventEpisodePage | undefined;
  /** The Episodes the site's own lists show (overview, Spotlight, Upcoming), in record order: never an unlisted one or a copy. */
  readonly listedEpisodes: () => readonly LoadedEpisode[];
  /** The Events `/events/` lists, in record order: those whose Playlist is public. */
  readonly listedEvents: () => readonly ServedEvent[];
  /** The Resources `/resources/` lists, in record order: those whose record says `public`. */
  readonly listedResources: () => readonly ListedResource[];
}

const NO_FACTS: PageFacts = {};

/** What an Episode presents, as the predicate reads it: visibility, status, and whether it is an Event's copy. */
function episodeFactsOf({ ref, visibility, status }: LoadedEpisode): PageFacts {
  const copy = matchEpisode(ref, { standalone: () => false, 'event-copy': () => true });
  return { visibility, status, ...(copy && { copy }) };
}

/**
 * A page, its record, the facts the predicate reads from it and the treatment those give, paired once. `record` is
 * undefined for a site list or a page whose record is not held (no facts, so it fails closed).
 */
interface Entry<P extends PageRef = PageRef, R = unknown> {
  readonly page: P;
  readonly record: R;
  readonly facts: PageFacts;
  readonly treatment: PageTreatment;
}

function entryOf<P extends PageRef, R>(page: P, record: R, facts: PageFacts): Entry<P, R> {
  return { page, record, facts, treatment: pageTreatment(page, facts) };
}

/** The page an Episode has at `/episodes/<slug>/`: one no Event owns, with a page; an Event's copy has none there. */
function ownPageOf({ ref }: LoadedEpisode): PageOf<'episode'>[] {
  if (!hasPage(ref)) return [];
  return matchEpisode(ref, {
    standalone: (episode) => [{ kind: 'episode', episode }],
    'event-copy': () => [],
  });
}

/** Each Resource's page, in record order: its type from its record, its slug naming the composition folder. */
function resourcePageOf({ type, slug }: Resource): PageOf<'resource'> {
  // Every Resource the store loads is an entry of the generated Resource registry, keyed by its slug (`tsc` holds key
  // = slug, and the load refuses a record without a composition folder), so its slug names a composition.
  return { kind: 'resource', type, resource: resourceRef(slug as ResourceSlug) };
}

/**
 * Each Episode every Event's Playlist presents with a page, in record order, with its page under the Event: one page
 * per Episode, placed by its first entry; an entry the served Event marks `repeat` gets none.
 */
function eventEpisodePagesIn(content: Content): EventEpisodePage[] {
  return content.events.flatMap((event) =>
    event.playlist.episodes.flatMap(({ page: episode, place, repeat }) =>
      episode === undefined || repeat === true
        ? []
        : [{ kind: 'event-episode', event: event.slug, episode, presented: { event, episode, place } } as const],
    ),
  );
}

/** Every page the records give, in the catalogue's order, each read once with its record, facts and treatment. */
function entriesIn(content: Content) {
  const kinds = ['home', 'dashboard', 'episodes', 'events', 'resources'] as const;
  const lists = kinds.map((kind) => entryOf({ kind }, undefined, NO_FACTS));
  const episodeOf = (id: EpisodeId) => content.episodes.find(({ ref }) => ref.id === id);
  const episodeEntry = <P extends PageRef>(page: P, record: LoadedEpisode | undefined) =>
    entryOf(page, record, record === undefined ? NO_FACTS : episodeFactsOf(record));
  // Every Episode record, for the site's lists; only one with a page at `/episodes/` is a page of its own.
  const records = content.episodes.map((record) => {
    const [page] = ownPageOf(record);
    const standIn = page ?? ({ kind: 'episode', episode: record.ref } as PageOf<'episode'>);
    return { ...entryOf(standIn, record, episodeFactsOf(record)), hasOwnPage: page !== undefined };
  });
  const episodes = records.filter(({ hasOwnPage }) => hasOwnPage);
  const resources = content.resources.map((record) =>
    entryOf(resourcePageOf(record), record, { visibility: record.visibility }),
  );
  const events = content.events.map((record) =>
    entryOf({ kind: 'event', event: record.slug } as const, record, { visibility: record.playlist.visibility }),
  );
  const underEvents = eventEpisodePagesIn(content).map((page) => ({
    ...episodeEntry(
      { kind: page.kind, event: page.event, episode: page.episode } as PageOf<'event-episode'>,
      episodeOf(page.episode.id),
    ),
    presenting: page,
  }));
  return { lists, records, episodes, resources, events, underEvents };
}

/** The params a page under `/episodes/` is built at: an Episode's own page at its slug. */
export function episodesPathParamsOf({ episode }: EpisodesPathPage): EpisodesPathParams {
  return { episode: episode.slug };
}

/** The params an Episode's page under its Event is built at: the Event's slug and the Episode's slug. */
export function eventEpisodeParamsOf({ event, episode }: PageOf<'event-episode'>): EventEpisodeParams {
  return { event, episode: episode.slug };
}
type Entries = ReturnType<typeof entriesIn>;

/** The static params and page lookups of the built pages: the entries whose treatment exports. */
function routesOf({
  episodes,
  resources,
  events,
  underEvents,
}: Entries): Omit<PageCatalogue, 'pages' | 'treatmentOf' | `listed${string}`> {
  const exported = <E extends Entry>(of: readonly E[]) => of.filter(({ treatment }) => treatment.exported);
  return {
    episodesPathParams: () => exported(episodes).map(({ page }) => episodesPathParamsOf(page)),
    episodesPathPageAt: ({ episode }) =>
      exported(episodes).find(({ page }) => episodesPathParamsOf(page).episode === episode)?.page,
    resourceParams: (type) =>
      exported(resources)
        .filter(({ page }) => page.type === type)
        .map(({ page }) => ({ resource: page.resource.slug })),
    resourcePageAt: (type, { resource }) =>
      exported(resources).find(({ page }) => page.type === type && page.resource.slug === resource)?.page,
    eventParams: () => exported(events).map(({ page }) => ({ event: page.event })),
    eventEpisodeParams: () => exported(underEvents).map(({ page }) => eventEpisodeParamsOf(page)),
    eventEpisodePageAt: (params) =>
      exported(underEvents).find(({ page }) => {
        const { event, episode } = eventEpisodeParamsOf(page);
        return event === params.event && episode === params.episode;
      })?.presenting,
  };
}

/** The catalogue of the pages these records give: what the store serves over its own records. */
export function catalogueOf(content: Content): PageCatalogue {
  const all = entriesIn(content);
  const { lists, records, episodes, resources, events, underEvents } = all;
  const entries: readonly Entry[] = [...lists, ...episodes, ...resources, ...events, ...underEvents];
  const listed = <E extends Entry>(of: readonly E[]) => of.filter(({ treatment }) => treatment.listed);
  const byKey = new Map([...records, ...entries].map((entry) => [pageKeyOf(entry.page), entry]));
  return {
    pages: entries.map(({ page, treatment }) => ({ page, treatment })),
    treatmentOf: (page) => byKey.get(pageKeyOf(page))?.treatment ?? pageTreatment(page, NO_FACTS),
    ...routesOf(all),
    listedEpisodes: () => listed(records).map(({ record }) => record),
    listedEvents: () => listed(events).map(({ record }) => record),
    listedResources: () => listed(resources).map(({ page, record }) => ({ page, tags: record.tags })),
  };
}
