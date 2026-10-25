import { EVENTS, type EventSlug } from './events.pure';
import { LOCALES, localizePath, type Locale } from './locale.pure';
import { PLAYLISTS } from './playlists.pure';
import { isToolingSlug, TOOLING_SLUGS, type ToolingSlug } from './tooling-pages';

/** Locale-neutral logical paths. Turn one into a URL with `localizePath`. */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  /** Prefix every Episode route sits under; there is an index page at this path. */
  episodes: '/episodes',
  /** The Events list; each Event's page, and the Episodes of its Playlist, sit under this path. */
  events: '/events',
  /** Prefix every Concept page sits under, English only; there is no index page yet. */
  concepts: '/concepts',
} as const;

export const LEGACY_EPISODE_PREFIX = '/episode';

export const EPISODE_SLUGS = [
  'page-template',
  'maintaining-markdown-for-ai',
  'ai-token-economy',
  'never-too-early-sales',
  'onboard-ai-every-time',
  'ai-attention-span',
  'ai-gives-you-more-work',
] as const;

export type EpisodeSlug = (typeof EPISODE_SLUGS)[number];

/** A page served at `/episodes/<slug>/`: an Episode's own, or a tooling page. */
export type EpisodesPathSlug = EpisodeSlug | ToolingSlug;

/** Every page under `/episodes/`: each Episode's own, then each tooling page. */
export const EPISODES_PATH_SLUGS: readonly EpisodesPathSlug[] = [...EPISODE_SLUGS, ...TOOLING_SLUGS];

export function isEpisodesPathSlug(slug: string): slug is EpisodesPathSlug {
  return isEpisodeSlug(slug) || isToolingSlug(slug);
}

/** The page a slug under `/episodes/` names: a tooling page's, else the Episode's own. */
export function episodesPathPage(
  slug: EpisodesPathSlug,
): { readonly episode: EpisodeSlug } | { readonly tooling: ToolingSlug } {
  return isToolingSlug(slug) ? { tooling: slug } : { episode: slug };
}

/**
 * Unlisted Episodes: built and exported only under the Event whose Playlist presents them
 * (`/events/<event>/episodes/<episode>/`), never at `/episodes/<slug>/`. Their metadata says `visibility: unlisted`;
 * the content store cross-checks the two.
 */
export const UNLISTED_EPISODE_SLUGS = ['axel-agentic-workflow-agenda'] as const;

export type UnlistedEpisodeSlug = (typeof UNLISTED_EPISODE_SLUGS)[number];

/** Every Episode: the ones with an `/episodes/` page and the unlisted ones. */
export type AnyEpisodeSlug = EpisodeSlug | UnlistedEpisodeSlug;

/** Every Slide record the registry holds: each Episode's, and each tooling page's. */
export type RecordSlug = AnyEpisodeSlug | ToolingSlug;

export function isRecordSlug(slug: string): slug is RecordSlug {
  return isAnyEpisodeSlug(slug) || isToolingSlug(slug);
}

export function isAnyEpisodeSlug(slug: string): slug is AnyEpisodeSlug {
  return isEpisodeSlug(slug) || (UNLISTED_EPISODE_SLUGS as readonly string[]).includes(slug);
}

export function isEpisodeSlug(slug: string): slug is EpisodeSlug {
  return (EPISODE_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Episode, or of a tooling page, which sits beside them. */
export function episodeRoute(slug: EpisodesPathSlug): string {
  return `${ROUTES.episodes}/${slug}`;
}

/**
 * The logical path an Episode's page is served at: the one handed in (an Event-scoped page passes its own), else the
 * Episode's own `/episodes/<slug>`. An unlisted Episode has no page of its own, so it must be handed one.
 */
export function episodePageRoute(slug: RecordSlug, route?: string): string {
  if (route !== undefined) return route;
  if (!isEpisodesPathSlug(slug)) throw new Error(`"${slug}" is unlisted: it has no /episodes/ page, only its Event's.`);
  return episodeRoute(slug);
}

/** The logical path of a legacy Episode stub. */
export function legacyEpisodeRoute(slug: EpisodesPathSlug): string {
  return `${LEGACY_EPISODE_PREFIX}/${slug}`;
}

/**
 * One static param per page under `/episodes/`, each Episode's and each tooling page's; both Episode routes and both
 * legacy stub routes export exactly these (FE-002, FE-005).
 */
export function episodeParams(): { episode: EpisodesPathSlug }[] {
  return EPISODES_PATH_SLUGS.map((episode) => ({ episode }));
}

export const EVENT_SLUGS: readonly EventSlug[] = EVENTS.map((event) => event.slug);

export function isEventSlug(slug: string): slug is EventSlug {
  return (EVENT_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Event. */
export function eventRoute(slug: string): string {
  return `${ROUTES.events}/${slug}`;
}

/** The logical path of one Episode as its Event presents it. */
export function eventEpisodeRoute(event: string, episode: string): string {
  return `${eventRoute(event)}/episodes/${episode}`;
}

/** One static param per Event; both Event routes export exactly these (FE-005). */
export function eventParams(): { event: EventSlug }[] {
  return EVENT_SLUGS.map((event) => ({ event }));
}

/** The Episode slugs an Event's Playlist presents, in order; none for a slug that names no Event. */
export function eventEpisodes(event: string): readonly AnyEpisodeSlug[] {
  const record = EVENTS.find((each) => each.slug === event);
  const playlist = PLAYLISTS.find((each) => each.id === record?.playlist);
  return playlist?.episodes ?? [];
}

/** One static param per Playlist entry of each Event, and no other; both Event-scoped Episode routes export these (FE-005). */
export function eventEpisodeParams(): { event: EventSlug; episode: AnyEpisodeSlug }[] {
  return EVENT_SLUGS.flatMap((event) => eventEpisodes(event).map((episode) => ({ event, episode })));
}

/** Whether an Event's Playlist presents the Episode, so the pair has a page. */
export function isEventEpisode(event: string, episode: string): boolean {
  return (eventEpisodes(event) as readonly string[]).includes(episode);
}

/**
 * Every Concept id, one page each at `/concepts/<id>`, in English only (design-ADR 0016). The ids are the folder
 * names under `docs/llm-wiki/concepts/`; the content store test fails when the two differ.
 */
export const CONCEPT_IDS = [
  'agentic-ai',
  'ai-adoption',
  'ai-cost',
  'context-engineering',
  'llm-behaviour',
  'markdown-documentation',
  'sales',
] as const;

export type ConceptId = (typeof CONCEPT_IDS)[number];

export function isConceptId(id: string): id is ConceptId {
  return (CONCEPT_IDS as readonly string[]).includes(id);
}

/** The logical path of one Concept page; it has no German counterpart, so link it with the `en` locale. */
export function conceptRoute(id: string): string {
  return `${ROUTES.concepts}/${id}`;
}

/** One static param per Concept; the Concept route exports exactly these (FE-005). */
export function conceptParams(): { concept: ConceptId }[] {
  return CONCEPT_IDS.map((concept) => ({ concept }));
}

/** A page with its own metadata and a closed set of exported locales. */
export type PageRef =
  | 'home'
  | 'dashboard'
  | 'episodes'
  | 'events'
  | { readonly episode: EpisodeSlug }
  | { readonly tooling: ToolingSlug }
  | { readonly event: EventSlug }
  | { readonly event: EventSlug; readonly episode: AnyEpisodeSlug }
  | { readonly concept: ConceptId };

/** Every exported page: the one list the sitemap, the post-build tests and the redirect stubs derive from (FE-005, FE-008). */
export const PAGES: readonly PageRef[] = [
  'home',
  'dashboard',
  'episodes',
  'events',
  ...EPISODE_SLUGS.map((episode) => ({ episode })),
  ...TOOLING_SLUGS.map((tooling) => ({ tooling })),
  ...EVENT_SLUGS.map((event) => ({ event })),
  ...eventEpisodeParams(),
  ...CONCEPT_IDS.map((concept) => ({ concept })),
];

/** English-only pages have no German counterpart: the operations dashboard, and every evidence page. */
export function pageLocales(page: PageRef): readonly Locale[] {
  return page === 'dashboard' || isConceptPage(page) ? ['en'] : LOCALES;
}

/** The logical path a page is exported at. */
export function routeOf(page: PageRef): string {
  if (isEpisodePage(page)) return episodeRoute(page.episode);
  if (isToolingPage(page)) return episodeRoute(page.tooling);
  if (isEventEpisodePage(page)) return eventEpisodeRoute(page.event, page.episode);
  if (isConceptPage(page)) return conceptRoute(page.concept);
  return isEventPage(page) ? eventRoute(page.event) : ROUTES[page];
}

/** Whether a page is an Episode's own, narrowing to the `{ episode }` form. */
export function isEpisodePage(page: PageRef): page is { readonly episode: EpisodeSlug } {
  return typeof page !== 'string' && 'episode' in page && !('event' in page);
}

/** Whether a page is a tooling page, narrowing to the `{ tooling }` form. */
export function isToolingPage(page: PageRef): page is { readonly tooling: ToolingSlug } {
  return typeof page !== 'string' && 'tooling' in page;
}

/** Whether a page is an Event's, narrowing to the `{ event }` form. */
export function isEventPage(page: PageRef): page is { readonly event: EventSlug } {
  return typeof page !== 'string' && 'event' in page && !('episode' in page);
}

/** Whether a page is an Episode as its Event presents it, narrowing to the `{ event, episode }` form. */
export function isEventEpisodePage(
  page: PageRef,
): page is { readonly event: EventSlug; readonly episode: AnyEpisodeSlug } {
  return typeof page !== 'string' && 'event' in page && 'episode' in page;
}

/** Whether a page is a Concept's, narrowing to the `{ concept }` form. */
export function isConceptPage(page: PageRef): page is { readonly concept: ConceptId } {
  return typeof page !== 'string' && 'concept' in page;
}

/** The URL a logical path is served at under `siteUrl`: `trailingSlash` makes it the canonical, the origin alone for the home page. */
export function servedUrl(siteUrl: string, route: string, locale: Locale): string {
  const path = localizePath(route, locale);
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;
}
