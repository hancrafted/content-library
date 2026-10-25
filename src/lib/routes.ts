import { EVENTS, type EventSlug } from './events.pure';
import { LOCALES, localizePath, type Locale } from './locale.pure';
import { PLAYLISTS } from './playlists.pure';
import { RESEARCH_IDS, type ResearchId } from './research-ids';

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
  /** Prefix every Research question page sits under, English only; there is no index page yet. */
  research: '/research',
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
  // Unlisted: built and exported, linked from neither the landing page nor the header.
  'slide-layouts',
  // A catalog of reusable Slide layouts, linked from the bottom of /episodes beside the page template.
  'slide-master',
  // The cornerstone Slides one by one, outside their Episodes: a preview bench and a link to send one Slide.
  'slides',
] as const;

export type EpisodeSlug = (typeof EPISODE_SLUGS)[number];

/**
 * Unlisted Episodes: built and exported only under the Event whose Playlist presents them
 * (`/events/<event>/episodes/<episode>/`), never at `/episodes/<slug>/`. Their metadata says `visibility: unlisted`;
 * the content store cross-checks the two.
 */
export const UNLISTED_EPISODE_SLUGS = ['axel-agentic-workflow-agenda'] as const;

export type UnlistedEpisodeSlug = (typeof UNLISTED_EPISODE_SLUGS)[number];

/** Every Episode the registry holds: the ones with an `/episodes/` page and the unlisted ones. */
export type AnyEpisodeSlug = EpisodeSlug | UnlistedEpisodeSlug;

export function isAnyEpisodeSlug(slug: string): slug is AnyEpisodeSlug {
  return isEpisodeSlug(slug) || (UNLISTED_EPISODE_SLUGS as readonly string[]).includes(slug);
}

export function isEpisodeSlug(slug: string): slug is EpisodeSlug {
  return (EPISODE_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Episode. */
export function episodeRoute(slug: EpisodeSlug): string {
  return `${ROUTES.episodes}/${slug}`;
}

/**
 * The logical path an Episode's page is served at: the one handed in (an Event-scoped page passes its own), else the
 * Episode's own `/episodes/<slug>`. An unlisted Episode has no page of its own, so it must be handed one.
 */
export function episodePageRoute(slug: AnyEpisodeSlug, route?: string): string {
  if (route !== undefined) return route;
  if (!isEpisodeSlug(slug)) throw new Error(`"${slug}" is unlisted: it has no /episodes/ page, only its Event's.`);
  return episodeRoute(slug);
}

/** The logical path of a legacy Episode stub. */
export function legacyEpisodeRoute(slug: EpisodeSlug): string {
  return `${LEGACY_EPISODE_PREFIX}/${slug}`;
}

/** One static param per Episode; both Episode routes export exactly these (FE-002, FE-005). */
export function episodeParams(): { episode: EpisodeSlug }[] {
  return EPISODE_SLUGS.map((episode) => ({ episode }));
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

/** The logical path of one Research question page; it has no German counterpart, so link it with the `en` locale. */
export function researchRoute(id: string): string {
  return `${ROUTES.research}/${id}`;
}

/** One static param per promoted Research question; the Research route exports exactly these (FE-005). */
export function researchParams(): { research: ResearchId }[] {
  return RESEARCH_IDS.map((research) => ({ research }));
}

/** A page with its own metadata and a closed set of exported locales. */
export type PageRef =
  | 'home'
  | 'dashboard'
  | 'episodes'
  | 'events'
  | { readonly episode: EpisodeSlug }
  | { readonly event: EventSlug }
  | { readonly event: EventSlug; readonly episode: AnyEpisodeSlug }
  | { readonly concept: ConceptId }
  | { readonly research: ResearchId };

/** Every exported page: the one list the sitemap, the post-build tests and the redirect stubs derive from (FE-005, FE-008). */
export const PAGES: readonly PageRef[] = [
  'home',
  'dashboard',
  'episodes',
  'events',
  ...EPISODE_SLUGS.map((episode) => ({ episode })),
  ...EVENT_SLUGS.map((event) => ({ event })),
  ...eventEpisodeParams(),
  ...CONCEPT_IDS.map((concept) => ({ concept })),
  ...RESEARCH_IDS.map((research) => ({ research })),
];

/** English-only pages have no German counterpart: the operations dashboard, and every evidence page. */
export function pageLocales(page: PageRef): readonly Locale[] {
  return page === 'dashboard' || isConceptPage(page) || isResearchPage(page) ? ['en'] : LOCALES;
}

/** The logical path a page is exported at. */
export function routeOf(page: PageRef): string {
  if (isEpisodePage(page)) return episodeRoute(page.episode);
  if (isEventEpisodePage(page)) return eventEpisodeRoute(page.event, page.episode);
  if (isConceptPage(page)) return conceptRoute(page.concept);
  if (isResearchPage(page)) return researchRoute(page.research);
  return isEventPage(page) ? eventRoute(page.event) : ROUTES[page];
}

/** Whether a page is an Episode's own, narrowing to the `{ episode }` form. */
export function isEpisodePage(page: PageRef): page is { readonly episode: EpisodeSlug } {
  return typeof page !== 'string' && 'episode' in page && !('event' in page);
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

/** Whether a page is a Research question's, narrowing to the `{ research }` form. */
export function isResearchPage(page: PageRef): page is { readonly research: ResearchId } {
  return typeof page !== 'string' && 'research' in page;
}

/** The URL a logical path is served at under `siteUrl`: `trailingSlash` makes it the canonical, the origin alone for the home page. */
export function servedUrl(siteUrl: string, route: string, locale: Locale): string {
  const path = localizePath(route, locale);
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;
}
