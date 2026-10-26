import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/routes';
import { episodeRefOf } from './episode-id.pure';
import { EPISODE_IDS, TOOLING_SLUGS } from './episode-ids.generated';
import { EVENT_SLUGS } from './event-slugs.generated';

/*
 * The record routes (spec #348, the content store's delivery policy): the Episode and Event slug lists and their
 * types, each record's logical path, and the page reference every page is known by. The static paths they build on,
 * `ROUTES`, are domain-free and sit in `src/shared/lib/routes.ts`.
 */

export const LEGACY_EPISODE_PREFIX = '/episode';

/**
 * Every Episode with a page, public or unlisted, by its Episode id (GLOSSARY): one folder each,
 * `src/episodes/<slug>/`, or `…/by-event/<event-slug>/<slug>/` for an Event's copy, whose id is
 * `<event-slug>__<slug>`. Listed by the generated Episode registry. Which of them has an `/episodes/` page is the page
 * catalogue's (`treatmentOf` in the content store): an Event's copy lives only under its Event. The tooling pages
 * served beside them are no Episodes: `TOOLING_SLUGS`.
 */
export { EPISODE_IDS };

export type EpisodeId = (typeof EPISODE_IDS)[number];

export function isEpisodeId(id: string): id is EpisodeId {
  return (EPISODE_IDS as readonly string[]).includes(id);
}

/**
 * Tooling pages: authoring benches served at `/episodes/<slug>/` beside the Episodes, but no Episode (design-ADR
 * 0016 decision 12), one folder each, `src/episodes/tooling/<slug>/`, listed by the generated registry. They have no
 * visibility and no status, are `noindex`, self-canonical and never in the sitemap, and no Episode list shows them.
 */
export { TOOLING_SLUGS };

export type ToolingSlug = (typeof TOOLING_SLUGS)[number];

export function isToolingSlug(slug: string): slug is ToolingSlug {
  return (TOOLING_SLUGS as readonly string[]).includes(slug);
}

/**
 * Every name that may name a page at `/episodes/<slug>/`: each Episode's id, then each tooling page's slug. An Event's
 * copy, whose id holds its Event's slug, is never exported there; nor is an unlisted Episode.
 */
export const EPISODES_PATH_SLUGS = [...EPISODE_IDS, ...TOOLING_SLUGS] as const;

/** A page served at `/episodes/<slug>/`: an Episode's own, or a tooling page. */
export type EpisodesPathSlug = EpisodeId | ToolingSlug;

export function isEpisodesPathSlug(slug: string): slug is EpisodesPathSlug {
  return isEpisodeId(slug) || isToolingSlug(slug);
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
 * Every Event, by slug: each one file, `src/content-store/events/<slug>.ts`, listed by the generated Event registry
 * (`npm run registry`), so a record and its page cannot drift apart.
 */
export { EVENT_SLUGS };

export type EventSlug = (typeof EVENT_SLUGS)[number];

export function isEventSlug(slug: string): slug is EventSlug {
  return (EVENT_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Event's page. */
export function eventRoute(slug: EventSlug): string {
  return `${ROUTES.events}/${slug}`;
}

/** The logical path of one Episode of an Event's Playlist, shown under the Event at its slug, an Event's copy's too. */
export function eventEpisodeRoute(event: EventSlug, episode: EpisodeId): string {
  return `${eventRoute(event)}${ROUTES.episodes}/${episodeRefOf(episode).slug}`;
}

/**
 * A page with its own metadata and a closed set of exported locales, told apart by its `kind`. Every site that
 * branches on the kind does so through `matchPage` or a table keyed by `PageKind`, so a new kind fails `tsc` at each.
 * Which pages exist, and how each is treated, is the page catalogue's (`PAGES` in the content store): it reads them
 * from the records, which lib cannot.
 */
export type PageRef =
  | { readonly kind: 'home' }
  | { readonly kind: 'dashboard' }
  | { readonly kind: 'episodes' }
  | { readonly kind: 'events' }
  | { readonly kind: 'episode'; readonly episode: EpisodeId }
  | { readonly kind: 'tooling'; readonly tooling: ToolingSlug }
  | { readonly kind: 'event'; readonly event: EventSlug }
  | { readonly kind: 'event-episode'; readonly event: EventSlug; readonly episode: EpisodeId };

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
