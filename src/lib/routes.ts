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
 * Every Episode, public or unlisted: each registered once. Which of them has an `/episodes/` page is the visibility
 * predicate's (`pageTreatment`): an unlisted one lives only under its Event. The tooling pages served beside them are
 * no Episodes: `TOOLING_SLUGS`.
 */
export const EPISODE_SLUGS = [
  'maintaining-markdown-for-ai',
  'ai-token-economy',
  'never-too-early-sales',
  'onboard-ai-every-time',
  'ai-attention-span',
  'ai-gives-you-more-work',
  'axel-onboard-ai-every-time',
  'axel-ai-attention-span',
  'axel-ai-gives-you-more-work',
] as const;

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
export function episodesPathPage(
  slug: EpisodesPathSlug,
): { readonly episode: EpisodeSlug } | { readonly tooling: ToolingSlug } {
  return isToolingSlug(slug) ? { tooling: slug } : { episode: slug };
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
 * Every Event, by slug: a hand-kept page list, checked against the content store's Event records by the store's
 * tests (lib cannot read the store, FE-007).
 */
export const EVENT_SLUGS = ['2026-10-23-axel-agentic-workflow'] as const;

export type EventSlug = (typeof EVENT_SLUGS)[number];

export function isEventSlug(slug: string): slug is EventSlug {
  return (EVENT_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Event's page. */
export function eventRoute(slug: string): string {
  return `${ROUTES.events}/${slug}`;
}

/** The logical path of one Episode of an Event's Playlist, shown under the Event. */
export function eventEpisodeRoute(event: string, episode: string): string {
  return `${eventRoute(event)}${ROUTES.episodes}/${episode}`;
}

/** One static param per Event; both Event routes export exactly these (FE-005). */
export function eventParams(): { event: EventSlug }[] {
  return EVENT_SLUGS.map((event) => ({ event }));
}

/** An Episode as an Event presents it, at `/events/<event>/episodes/<episode>/`. */
export interface EventEpisodePage {
  readonly event: EventSlug;
  readonly episode: EpisodeSlug;
}

/**
 * A page with its own metadata and a closed set of exported locales. An Event-scoped Episode page is one too, but not
 * in `PAGES`: which Episodes an Event presents is its Playlist's, read through the content store (lib cannot).
 */
export type PageRef =
  | 'home'
  | 'dashboard'
  | 'episodes'
  | 'events'
  | { readonly episode: EpisodeSlug }
  | { readonly tooling: ToolingSlug }
  | { readonly event: EventSlug }
  | EventEpisodePage;

/**
 * Every page that may be exported: the one list the sitemap and the post-build tests derive from (FE-005, FE-008),
 * each filtered by the visibility predicate, which drops an unlisted Episode's `/episodes/` page.
 */
export const PAGES: readonly PageRef[] = [
  'home',
  'dashboard',
  'episodes',
  'events',
  ...EPISODE_SLUGS.map((episode) => ({ episode })),
  ...TOOLING_SLUGS.map((tooling) => ({ tooling })),
  ...EVENT_SLUGS.map((event) => ({ event })),
];

/** English-only operations pages have no German counterpart. */
export function pageLocales(page: PageRef): readonly Locale[] {
  return page === 'dashboard' ? ['en'] : LOCALES;
}

/** The logical path a page is exported at. */
export function routeOf(page: PageRef): string {
  if (isEventEpisodePage(page)) return eventEpisodeRoute(page.event, page.episode);
  if (isEpisodePage(page)) return episodeRoute(page.episode);
  if (isToolingPage(page)) return episodeRoute(page.tooling);
  return isEventPage(page) ? eventRoute(page.event) : ROUTES[page];
}

/** Whether a page is an Episode's own, at `/episodes/<slug>/`, narrowing to the `{ episode }` form. */
export function isEpisodePage(page: PageRef): page is { readonly episode: EpisodeSlug } {
  return typeof page !== 'string' && 'episode' in page && !('event' in page);
}

/** Whether a page is a tooling page, narrowing to the `{ tooling }` form. */
export function isToolingPage(page: PageRef): page is { readonly tooling: ToolingSlug } {
  return typeof page !== 'string' && 'tooling' in page;
}

/** Whether a page is an Event's own, narrowing to the `{ event }` form. */
export function isEventPage(page: PageRef): page is { readonly event: EventSlug } {
  return typeof page !== 'string' && 'event' in page && !('episode' in page);
}

/** Whether a page is an Episode shown under an Event, narrowing to the `{ event, episode }` form. */
export function isEventEpisodePage(page: PageRef): page is EventEpisodePage {
  return typeof page !== 'string' && 'event' in page && 'episode' in page;
}

/** The URL a logical path is served at under `siteUrl`: `trailingSlash` makes it the canonical, the origin alone for the home page. */
export function servedUrl(siteUrl: string, route: string, locale: Locale): string {
  const path = localizePath(route, locale);
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;
}
