/** Locale-neutral logical paths. Turn one into a URL with `localizePath`. */
export const ROUTES = {
  home: '/',
  /** Prefix every Episode route sits under; there is no page at this path. */
  episodes: '/episode',
} as const;

/** Every published Episode, by slug. The Episode registry must list each one. */
export const EPISODE_SLUGS = ['page-template'] as const;

export type EpisodeSlug = (typeof EPISODE_SLUGS)[number];

export function isEpisodeSlug(slug: string): slug is EpisodeSlug {
  return (EPISODE_SLUGS as readonly string[]).includes(slug);
}

/** The logical path of one Episode. */
export function episodeRoute(slug: EpisodeSlug): string {
  return `${ROUTES.episodes}/${slug}`;
}
