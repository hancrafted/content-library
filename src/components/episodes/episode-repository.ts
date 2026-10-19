import type { EpisodeMetadata, EpisodeStatus, UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';
import { FEATURED, LAYOUT_REFERENCES, type ListedEpisodeSlug } from '@/lib/episode-overview';
import { isEpisodeSlug, type EpisodeSlug } from '@/lib/routes';
import { episodeMetadata as aiTokenEconomy } from './ai-token-economy/episode-metadata';
import { episodeMetadata as maintainingMarkdownForAi } from './maintaining-markdown-for-ai/episode-metadata';
import { episodeMetadata as neverTooEarlySales } from './never-too-early-sales/episode-metadata';

/*
 * The Episode overview's read API (#40): every Episode's own metadata,
 * collected by explicit imports as the registry collects records. No glob, no
 * codegen, no React (FE-007 §3). The one seam a database would replace.
 */

/**
 * Episodes that have a page, by slug: every registered listed one. Its
 * `status` says published or upcoming; an upcoming one with a page sits among them. Typed against the registered slugs, so a
 * registered Episode without metadata, or a key naming another Episode's
 * metadata, fails `tsc`.
 */
const REGISTERED = {
  'maintaining-markdown-for-ai': maintainingMarkdownForAi,
  'ai-token-economy': aiTokenEconomy,
  'never-too-early-sales': neverTooEarlySales,
} as const satisfies { readonly [S in ListedEpisodeSlug]: EpisodeMetadata & { readonly slug: S } };

/** The slugs whose metadata says `published`. */
type PublishedSlug = {
  [S in keyof typeof REGISTERED]: (typeof REGISTERED)[S]['status'] extends 'published' ? S : never;
}[keyof typeof REGISTERED];

/** The Featured slugs, typed so `tsc` refuses one that names an upcoming Episode. */
export function featuredSlugs(): readonly PublishedSlug[] {
  return FEATURED;
}

/** Upcoming Episodes in the order the overview lists them. */
const UPCOMING: readonly UpcomingEpisodeMetadata[] = [];

/** Every Episode's metadata: the published ones, then the upcoming ones in overview order. */
export function listEpisodes(options?: { includeDrafts?: boolean }): readonly EpisodeMetadata[] {
  const all = [...Object.values(REGISTERED), ...UPCOMING];
  if (options?.includeDrafts ?? true) return all;
  return all.filter((entry) => entry.status === 'published');
}

/** Whether the slug has an Episode page: every registered slug, layout references included, whatever the status. */
export function hasPage(slug: string): slug is EpisodeSlug {
  return isEpisodeSlug(slug);
}

/**
 * The Episode's status. A layout reference has no metadata and is published
 * for indexing; a listed slug the metadata does not list is a bug, so it throws.
 */
export function episodeStatus(slug: EpisodeSlug): EpisodeStatus {
  if ((LAYOUT_REFERENCES as readonly string[]).includes(slug)) return 'published';
  const episode = listEpisodes().find((entry) => entry.slug === slug);
  if (!episode) throw new Error(`No Episode metadata lists the registered slug "${slug}"`);
  return episode.status;
}
