import { LOCALES, type Locale } from './locale.pure';

/** Locale-neutral logical paths. Turn one into a URL with `localizePath`. */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  /** Prefix every Episode route sits under; there is an index page at this path. */
  episodes: '/episodes',
} as const;

export const LEGACY_EPISODE_PREFIX = '/episode';

export const EPISODE_SLUGS = [
  'page-template',
  'maintaining-markdown-for-ai',
  'ai-token-economy',
  'never-too-early-sales',
  // Unlisted: built and exported, linked from neither the landing page nor the header.
  'slide-layouts',
  // A catalog of reusable Slide layouts, linked from the landing page beside the page template.
  'slide-master',
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

/** A page with its own metadata and a closed set of exported locales. */
export type PageRef = 'home' | 'dashboard' | 'episodes' | { readonly episode: EpisodeSlug };

/** English-only operations pages have no German counterpart. */
export function pageLocales(page: PageRef): readonly Locale[] {
  return page === 'dashboard' ? ['en'] : LOCALES;
}

/** The logical path a page is exported at. */
export function routeOf(page: PageRef): string {
  return typeof page === 'string' ? ROUTES[page] : episodeRoute(page.episode);
}
