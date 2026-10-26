import { EPISODE_SLUGS } from './episode-registry.generated';
import { LOCALES, localizePath, type Locale } from './locale.pure';
import { isToolingSlug, TOOLING_SLUGS, type ToolingSlug } from './tooling-pages';

/** Locale-neutral logical paths. Turn one into a URL with `localizePath`. */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  /** Prefix every Episode route sits under; there is an index page at this path. */
  episodes: '/episodes',
  /** The Events list; each Event's page sits under this path. */
  events: '/events',
} as const;

export const LEGACY_EPISODE_PREFIX = '/episode';

/**
 * Every Episode, public or unlisted: each one folder, `src/components/episodes/<slug>/`, listed by the generated
 * Episode registry. Which of them has an `/episodes/` page is the visibility predicate's (`pageTreatment`): an unlisted
 * one lives only under its Event. The tooling pages served beside them are no Episodes: `TOOLING_SLUGS`.
 */
export { EPISODE_SLUGS };

export type EpisodeSlug = (typeof EPISODE_SLUGS)[number];

export function isEpisodeSlug(slug: string): slug is EpisodeSlug {
  return (EPISODE_SLUGS as readonly string[]).includes(slug);
}

/** Every slug that may name a page at `/episodes/<slug>/`: each Episode's, then each tooling page's; an unlisted Episode's is not exported. */
export const EPISODES_PATH_SLUGS = [...EPISODE_SLUGS, ...TOOLING_SLUGS] as const;

/** A page served at `/episodes/<slug>/`: an Episode's own, or a tooling page. */
export type EpisodesPathSlug = EpisodeSlug | ToolingSlug;

export function isEpisodesPathSlug(slug: string): slug is EpisodesPathSlug {
  return isEpisodeSlug(slug) || isToolingSlug(slug);
}

/** The page a slug under `/episodes/` names: a tooling page's, else the Episode's own. */
export function episodesPathPage(slug: EpisodesPathSlug): EpisodesPathPage {
  return isToolingSlug(slug) ? { kind: 'tooling', tooling: slug } : { kind: 'episode', episode: slug };
}

/** The logical path of one Episode, or of a tooling page, which sits beside them. */
export function episodeRoute(slug: EpisodesPathSlug): string {
  return `${ROUTES.episodes}/${slug}`;
}

/** The logical path of a legacy Episode stub. */
export function legacyEpisodeRoute(slug: EpisodesPathSlug): string {
  return `${LEGACY_EPISODE_PREFIX}/${slug}`;
}

/**
 * Every Event, by slug: a hand-kept page list (lib cannot read the store, FE-007). The store refuses an Event record
 * missing from it, and the store's tests refuse a slug no Event record carries.
 */
export const EVENT_SLUGS = [
  '2026-10-23-axel-agentic-workflow',
  '2026-10-28-cyberforum-akademie-intro-agentic-workflow',
] as const;

export type EventSlug = (typeof EVENT_SLUGS)[number];

export function isEventSlug(slug: string): slug is EventSlug {
  return (EVENT_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Event's page. */
export function eventRoute(slug: EventSlug): string {
  return `${ROUTES.events}/${slug}`;
}

/** The logical path of one Episode of an Event's Playlist, shown under the Event. */
export function eventEpisodeRoute(event: EventSlug, episode: EpisodeSlug): string {
  return `${eventRoute(event)}${ROUTES.episodes}/${episode}`;
}

/** One static param per Event; both Event routes export exactly these (FE-005). */
export function eventParams(): { event: EventSlug }[] {
  return EVENT_SLUGS.map((event) => ({ event }));
}

/**
 * A page with its own metadata and a closed set of exported locales, told apart by its `kind`. Every site that
 * branches on the kind does so through `matchPage` or a table keyed by `PageKind`, so a new kind fails `tsc` at each.
 * An Event-scoped Episode page is one too, but not in `PAGES`: which Episodes an Event presents is its Playlist's,
 * read through the content store (lib cannot).
 */
export type PageRef =
  | { readonly kind: 'home' }
  | { readonly kind: 'dashboard' }
  | { readonly kind: 'episodes' }
  | { readonly kind: 'events' }
  | { readonly kind: 'episode'; readonly episode: EpisodeSlug }
  | { readonly kind: 'tooling'; readonly tooling: ToolingSlug }
  | { readonly kind: 'event'; readonly event: EventSlug }
  | { readonly kind: 'event-episode'; readonly event: EventSlug; readonly episode: EpisodeSlug };

/** A page's kind: what every site that treats pages differently branches on. */
export type PageKind = PageRef['kind'];

/** A page of one kind. */
export type PageOf<K extends PageKind> = Extract<PageRef, { readonly kind: K }>;

/** A page that presents no record: its copy is `meta.<kind>` of the Translation file. */
export type ListPage = PageOf<'home' | 'dashboard' | 'episodes' | 'events'>;

/** A page that presents a record, so its route hands in its copy and facts. */
export type RecordPage = PageOf<'episode' | 'tooling' | 'event' | 'event-episode'>;

/** A page served at `/episodes/<slug>/`: an Episode's own, or a tooling page. */
export type EpisodesPathPage = PageOf<'episode' | 'tooling'>;

/** One case per kind of the pages `P`, each handed its page narrowed to that kind. */
export type PageCases<P extends PageRef, R> = {
  readonly [K in P['kind']]: (page: Extract<P, { readonly kind: K }>) => R;
};

/**
 * The one way to branch on a page's kind: hands the page to its kind's case. The cases are typed against every kind
 * of `P`, so a new kind fails `tsc` at each site until it has a case there. `otherwise` answers a kind no case names
 * (a page built around the types); left out, such a page throws.
 */
export function matchPage<P extends PageRef, R>(page: P, cases: PageCases<P, R>, otherwise?: () => R): R {
  const kind: P['kind'] = page.kind;
  if (Object.hasOwn(cases, kind)) return (cases[kind] as (page: P) => R)(page);
  if (otherwise) return otherwise();
  throw new Error(`No case for page kind "${String(kind)}"`);
}

/**
 * Every page that may be exported: the one list the sitemap and the post-build tests derive from (FE-005, FE-008),
 * each filtered by the visibility predicate, which drops an unlisted Episode's `/episodes/` page.
 */
export const PAGES: readonly PageRef[] = [
  { kind: 'home' },
  { kind: 'dashboard' },
  { kind: 'episodes' },
  { kind: 'events' },
  ...EPISODE_SLUGS.map((episode) => ({ kind: 'episode', episode }) as const),
  ...TOOLING_SLUGS.map((tooling) => ({ kind: 'tooling', tooling }) as const),
  ...EVENT_SLUGS.map((event) => ({ kind: 'event', event }) as const),
];

/** The locales each kind of page is exported in: the English-only dashboard has no German counterpart. */
const LOCALES_BY_KIND: Readonly<Record<PageKind, readonly Locale[]>> = {
  home: LOCALES,
  dashboard: ['en'],
  episodes: LOCALES,
  events: LOCALES,
  episode: LOCALES,
  tooling: LOCALES,
  event: LOCALES,
  'event-episode': LOCALES,
};

/** The locales a page is exported in. */
export function pageLocales(page: PageRef): readonly Locale[] {
  return LOCALES_BY_KIND[page.kind];
}

/** The logical path a page is exported at. */
export function routeOf(page: PageRef): string {
  return matchPage(page, {
    home: () => ROUTES.home,
    dashboard: () => ROUTES.dashboard,
    episodes: () => ROUTES.episodes,
    events: () => ROUTES.events,
    episode: ({ episode }) => episodeRoute(episode),
    tooling: ({ tooling }) => episodeRoute(tooling),
    event: ({ event }) => eventRoute(event),
    'event-episode': ({ event, episode }) => eventEpisodeRoute(event, episode),
  });
}

/** The URL a logical path is served at under `siteUrl`: `trailingSlash` makes it the canonical, the origin alone for the home page. */
export function servedUrl(siteUrl: string, route: string, locale: Locale): string {
  const path = localizePath(route, locale);
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;
}
