import { isListed, type EpisodeMetadata, type EpisodeStatus, type IsoDate } from '@/lib/episode-metadata.pure';
import { FEATURED, LAYOUT_REFERENCES } from '@/lib/episode-overview';
import { isEpisodeSlug, type AnyEpisodeSlug, type EpisodeSlug } from '@/lib/routes';
import { contentStore, type REGISTERED } from './content-store';
/*
 * The Episode overview's read API (#40): every Episode's own metadata,
 * collected by explicit imports as the registry collects records. No glob, no
 * codegen, no React (FE-007 §3). Reads the content store, the one seam a database would replace.
 */

/** The slugs whose metadata says `published`. */
type PublishedSlug = {
  [S in keyof typeof REGISTERED]: (typeof REGISTERED)[S]['status'] extends 'published' ? S : never;
}[keyof typeof REGISTERED];

/** The Featured slugs, typed so `tsc` refuses one that names an upcoming Episode. */
export function featuredSlugs(): readonly PublishedSlug[] {
  return FEATURED;
}

/** Every Episode's metadata, the unlisted ones included: the published ones, then the upcoming ones in overview order. */
export function allEpisodes(): readonly EpisodeMetadata[] {
  return contentStore().episodes;
}

/** The Episodes the overview lists: public, standard ones only, the published ones then the upcoming ones. */
export function listEpisodes(options?: { includeDrafts?: boolean }): readonly EpisodeMetadata[] {
  const all = allEpisodes().filter(isListed);
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
export function episodeStatus(slug: AnyEpisodeSlug): EpisodeStatus {
  if ((LAYOUT_REFERENCES as readonly string[]).includes(slug)) return 'published';
  const episode = allEpisodes().find((entry) => entry.slug === slug);
  if (!episode) throw new Error(`No Episode metadata lists the registered slug "${slug}"`);
  return episode.status;
}

/** The release date of a published Episode; undefined for a layout reference, which has no metadata, and an upcoming one. */
export function episodePublishedOn(slug: string): IsoDate | undefined {
  const episode = allEpisodes().find((entry) => entry.slug === slug);
  return episode?.status === 'published' ? episode.publishedOn : undefined;
}
