import { LOCALES, localizePath, type Locale } from './locale.pure';
import { WORKSHOPS, type WorkshopSlug } from './workshops.pure';

/** Locale-neutral logical paths. Turn one into a URL with `localizePath`. */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  /** Prefix every Episode route sits under; there is an index page at this path. */
  episodes: '/episodes',
  /** The Workshops list; each Workshop's page sits under this path. */
  workshops: '/workshops',
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
  // Unlisted: built and exported, linked from neither the landing page nor the header.
  'slide-layouts',
  // A catalog of reusable Slide layouts, linked from the bottom of /episodes beside the page template.
  'slide-master',
  // The cornerstone Slides one by one, outside their Episodes: a preview bench and a link to send one Slide.
  'slides',
] as const;

export type EpisodeSlug = (typeof EPISODE_SLUGS)[number];

export function isEpisodeSlug(slug: string): slug is EpisodeSlug {
  return (EPISODE_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Episode. */
export function episodeRoute(slug: EpisodeSlug): string {
  return `${ROUTES.episodes}/${slug}`;
}

/** The logical path of a legacy Episode stub. */
export function legacyEpisodeRoute(slug: EpisodeSlug): string {
  return `${LEGACY_EPISODE_PREFIX}/${slug}`;
}

/** One static param per Episode; both Episode routes export exactly these (FE-002, FE-005). */
export function episodeParams(): { episode: EpisodeSlug }[] {
  return EPISODE_SLUGS.map((episode) => ({ episode }));
}

export const WORKSHOP_SLUGS: readonly WorkshopSlug[] = WORKSHOPS.map((workshop) => workshop.slug);

export function isWorkshopSlug(slug: string): slug is WorkshopSlug {
  return (WORKSHOP_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Workshop. */
export function workshopRoute(slug: string): string {
  return `${ROUTES.workshops}/${slug}`;
}

/** One static param per Workshop; both Workshop routes export exactly these (FE-005). */
export function workshopParams(): { workshop: WorkshopSlug }[] {
  return WORKSHOP_SLUGS.map((workshop) => ({ workshop }));
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
  | 'workshops'
  | { readonly episode: EpisodeSlug }
  | { readonly workshop: WorkshopSlug }
  | { readonly concept: ConceptId };

/** Every exported page: the one list the sitemap, the post-build tests and the redirect stubs derive from (FE-005, FE-008). */
export const PAGES: readonly PageRef[] = [
  'home',
  'dashboard',
  'episodes',
  'workshops',
  ...EPISODE_SLUGS.map((episode) => ({ episode })),
  ...WORKSHOP_SLUGS.map((workshop) => ({ workshop })),
  ...CONCEPT_IDS.map((concept) => ({ concept })),
];

/** English-only pages have no German counterpart: the operations dashboard, and every evidence page. */
export function pageLocales(page: PageRef): readonly Locale[] {
  return page === 'dashboard' || isConceptPage(page) ? ['en'] : LOCALES;
}

/** The logical path a page is exported at. */
export function routeOf(page: PageRef): string {
  if (isEpisodePage(page)) return episodeRoute(page.episode);
  if (isConceptPage(page)) return conceptRoute(page.concept);
  return isWorkshopPage(page) ? workshopRoute(page.workshop) : ROUTES[page];
}

/** Whether a page is an Episode's, narrowing to the `{ episode }` form. */
export function isEpisodePage(page: PageRef): page is { readonly episode: EpisodeSlug } {
  return typeof page !== 'string' && 'episode' in page;
}

/** Whether a page is a Workshop's, narrowing to the `{ workshop }` form. */
export function isWorkshopPage(page: PageRef): page is { readonly workshop: WorkshopSlug } {
  return typeof page !== 'string' && 'workshop' in page;
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
