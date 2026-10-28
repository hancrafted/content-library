import type { LoadedEpisode } from '../episode-refusals';
import type { ExplorablePage } from '../schemas/explorable-page.schema';
import type { ResourceType } from '../schemas/fields';
import type { Resource } from '../schemas/resource.schema';
import type { PresentedEpisode, ServedEvent } from '../served-event';
import type {
  EpisodesPathPage,
  EpisodesPathSlug,
  EventSlug,
  ExplorablePageSlug,
  PageOf,
  PageRef,
  ResourceSlug,
} from './record-routes';
import type { PageTreatment, TreatedPage } from './visibility.pure';

/* The page catalogue's interface (`./page-catalogue.ts`): the params each route is built at and what the catalogue answers. */

/** The params of a page built under `/episodes/`: `/episodes/<episode>/`. */
export interface EpisodesPathParams {
  readonly episode: EpisodesPathSlug;
}

/** The params of a page built under a Resource type's path: `/<type plural>/<resource>/`. */
export interface ResourceParams {
  readonly resource: ResourceSlug;
}

/** The params of a page built under `/explorables/`: `/explorables/<slug>/`. */
export interface ExplorablePageParams {
  readonly slug: ExplorablePageSlug;
}

/** An Explorable page the overview lists: its page and its record's Tags. */
export interface ListedExplorablePage {
  readonly page: PageOf<'explorable-page'>;
  readonly tags: ExplorablePage['tags'];
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
  /** One static param per built Explorable page, for the route under `/explorables/`. */
  readonly explorablePageParams: () => ExplorablePageParams[];
  /** The Explorable page built at `/explorables/<slug>/`; undefined for a slug no Explorable page has. */
  readonly explorablePageAt: (params: RouteParams<ExplorablePageParams>) => PageOf<'explorable-page'> | undefined;
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
  /** The Explorable pages `/explorables/` lists, in record order: those whose record says `public`. */
  readonly listedExplorablePages: () => readonly ListedExplorablePage[];
  /** The Resources `/resources/` lists, in record order: those whose record says `public`. */
  readonly listedResources: () => readonly ListedResource[];
}
