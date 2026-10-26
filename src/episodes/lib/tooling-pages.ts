import { isToolingSlug, type ToolingSlug } from '@/content-store/catalogue/record-routes';
import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { notFound } from 'next/navigation';
import { TOOLING_PAGES } from './episode-registry.generated';
import { findEpisode } from './registry';

/*
 * Every tooling page's Slides, by slug (design-ADR 0016 decision 12): the authoring benches under
 * `src/episodes/tooling/<slug>/`, composed like an Episode and rendered by the same container, but no Episode. The
 * generated registry lists and composes them from their folders, typed against `TOOLING_SLUGS`.
 */

export function findToolingPage(slug: string): EpisodeComposition<ToolingSlug> {
  if (!isToolingSlug(slug)) notFound();
  return TOOLING_PAGES[slug];
}

/** The Slides a page renders, by its Episode id or tooling page's slug: a tooling page's, else the Episode's. */
export function findPageRecord(slug: string): EpisodeComposition {
  return isToolingSlug(slug) ? TOOLING_PAGES[slug] : findEpisode(slug);
}
