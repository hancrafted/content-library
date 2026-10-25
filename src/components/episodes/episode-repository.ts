import type { EpisodeMetadata, EpisodeStatus, IsoDate, UpcomingEpisodeMetadata } from '@/lib/episode-metadata.pure';
import { FEATURED } from '@/lib/episode-overview';
import { isEpisodeSlug, type EpisodeSlug } from '@/lib/routes';
import { episodeMetadata as aiAttentionSpan } from './ai-attention-span/episode-metadata';
import { episodeMetadata as aiGivesYouMoreWork } from './ai-gives-you-more-work/episode-metadata';
import { episodeMetadata as aiTokenEconomy } from './ai-token-economy/episode-metadata';
import { episodeMetadata as maintainingMarkdownForAi } from './maintaining-markdown-for-ai/episode-metadata';
import { episodeMetadata as neverTooEarlySales } from './never-too-early-sales/episode-metadata';
import { episodeMetadata as onboardAiEveryTime } from './onboard-ai-every-time/episode-metadata';

/*
 * The Episode overview's read API (#40): every Episode's own metadata,
 * collected by explicit imports as the registry collects records. No glob, no
 * codegen, no React (FE-007 §3). The one seam a database would replace.
 */

/**
 * Episodes that have a page, by slug: every registered one. Its
 * `status` says published or upcoming; an upcoming one with a page sits among them. Typed against the registered slugs, so a
 * registered Episode without metadata, or a key naming another Episode's
 * metadata, fails `tsc`.
 */
const REGISTERED = {
  'maintaining-markdown-for-ai': maintainingMarkdownForAi,
  'ai-token-economy': aiTokenEconomy,
  'never-too-early-sales': neverTooEarlySales,
  'onboard-ai-every-time': onboardAiEveryTime,
  'ai-attention-span': aiAttentionSpan,
  'ai-gives-you-more-work': aiGivesYouMoreWork,
} as const satisfies { readonly [S in EpisodeSlug]: EpisodeMetadata & { readonly slug: S } };

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

/** Whether the slug has an Episode page: every registered slug, whatever the status. A tooling page is no Episode. */
export function hasPage(slug: string): slug is EpisodeSlug {
  return isEpisodeSlug(slug);
}

/** The Episode's status. A registered slug the metadata does not list is a bug, so it throws. */
export function episodeStatus(slug: EpisodeSlug): EpisodeStatus {
  const episode = listEpisodes().find((entry) => entry.slug === slug);
  if (!episode) throw new Error(`No Episode metadata lists the registered slug "${slug}"`);
  return episode.status;
}

/** The release date of a published Episode; undefined for an upcoming one. */
export function episodePublishedOn(slug: string): IsoDate | undefined {
  const episode = listEpisodes().find((entry) => entry.slug === slug);
  return episode?.status === 'published' ? episode.publishedOn : undefined;
}
