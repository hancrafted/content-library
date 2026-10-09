/** Locale-neutral logical paths. Turn one into a URL with `localizePath`. */
export const ROUTES = {
  home: '/',
  /** Prefix every Episode route sits under; there is no page at this path. */
  episodes: '/episode',
} as const;

export const EPISODE_SLUGS = [
  'page-template',
  'amnesiac-freelancer',
  'maintaining-markdown-for-ai',
  'ai-token-economy',
] as const;

export type EpisodeSlug = (typeof EPISODE_SLUGS)[number];

export function isEpisodeSlug(slug: string): slug is EpisodeSlug {
  return (EPISODE_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Episode. */
export function episodeRoute(slug: EpisodeSlug): string {
  return `${ROUTES.episodes}/${slug}`;
}

/** One static param per Episode; both Episode routes export exactly these (FE-002, FE-005). */
export function episodeParams(): { episode: EpisodeSlug }[] {
  return EPISODE_SLUGS.map((episode) => ({ episode }));
}

/** A page with its own metadata (FE-008): the landing page, or one Episode. */
export type PageRef = 'home' | { readonly episode: EpisodeSlug };

/** The logical path a page is exported at. */
export function routeOf(page: PageRef): string {
  return page === 'home' ? ROUTES.home : episodeRoute(page.episode);
}
