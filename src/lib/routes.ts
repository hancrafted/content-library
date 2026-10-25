import { LOCALES, localizePath, type Locale } from './locale.pure';
import { isToolingSlug, TOOLING_SLUGS, type ToolingSlug } from './tooling-pages';
import { WORKSHOPS, type WorkshopSlug } from './workshops.pure';

/** Locale-neutral logical paths. Turn one into a URL with `localizePath`. */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  /** Prefix every Episode route sits under; there is an index page at this path. */
  episodes: '/episodes',
  /** The Workshops list; each Workshop's page sits under this path. */
  workshops: '/workshops',
} as const;

export const LEGACY_EPISODE_PREFIX = '/episode';

/** Every Episode. The tooling pages served beside them are no Episodes: `TOOLING_SLUGS`. */
export const EPISODE_SLUGS = [
  'maintaining-markdown-for-ai',
  'ai-token-economy',
  'never-too-early-sales',
  'onboard-ai-every-time',
  'ai-attention-span',
  'ai-gives-you-more-work',
] as const;

export type EpisodeSlug = (typeof EPISODE_SLUGS)[number];

export function isEpisodeSlug(slug: string): slug is EpisodeSlug {
  return (EPISODE_SLUGS as readonly string[]).includes(slug);
}

/** Every page served at `/episodes/<slug>/`: each Episode's, then each tooling page's. */
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

/** One static param per page under `/episodes/`, Episode or tooling page; both routes and the legacy stubs export these (FE-002, FE-005). */
export function episodeParams(): { episode: EpisodesPathSlug }[] {
  return EPISODES_PATH_SLUGS.map((episode) => ({ episode }));
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

/** A page with its own metadata and a closed set of exported locales. */
export type PageRef =
  | 'home'
  | 'dashboard'
  | 'episodes'
  | 'workshops'
  | { readonly episode: EpisodeSlug }
  | { readonly tooling: ToolingSlug }
  | { readonly workshop: WorkshopSlug };

/** Every exported page: the one list the sitemap, the post-build tests and the redirect stubs derive from (FE-005, FE-008). */
export const PAGES: readonly PageRef[] = [
  'home',
  'dashboard',
  'episodes',
  'workshops',
  ...EPISODE_SLUGS.map((episode) => ({ episode })),
  ...TOOLING_SLUGS.map((tooling) => ({ tooling })),
  ...WORKSHOP_SLUGS.map((workshop) => ({ workshop })),
];

/** English-only operations pages have no German counterpart. */
export function pageLocales(page: PageRef): readonly Locale[] {
  return page === 'dashboard' ? ['en'] : LOCALES;
}

/** The logical path a page is exported at. */
export function routeOf(page: PageRef): string {
  if (isEpisodePage(page)) return episodeRoute(page.episode);
  if (isToolingPage(page)) return episodeRoute(page.tooling);
  return isWorkshopPage(page) ? workshopRoute(page.workshop) : ROUTES[page];
}

/** Whether a page is an Episode's, narrowing to the `{ episode }` form. */
export function isEpisodePage(page: PageRef): page is { readonly episode: EpisodeSlug } {
  return typeof page !== 'string' && 'episode' in page;
}

/** Whether a page is a tooling page, narrowing to the `{ tooling }` form. */
export function isToolingPage(page: PageRef): page is { readonly tooling: ToolingSlug } {
  return typeof page !== 'string' && 'tooling' in page;
}

/** Whether a page is a Workshop's, narrowing to the `{ workshop }` form. */
export function isWorkshopPage(page: PageRef): page is { readonly workshop: WorkshopSlug } {
  return typeof page !== 'string' && 'workshop' in page;
}

/** The URL a logical path is served at under `siteUrl`: `trailingSlash` makes it the canonical, the origin alone for the home page. */
export function servedUrl(siteUrl: string, route: string, locale: Locale): string {
  const path = localizePath(route, locale);
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;
}
