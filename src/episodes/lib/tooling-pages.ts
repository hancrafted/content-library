import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import {
  episodesPathPage,
  isEpisodesPathSlug,
  isToolingSlug,
  matchPage,
  type EpisodesPathPage,
  type ToolingSlug,
} from '@/lib/routes';
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

/** The page a slug under `/episodes/<slug>/` names: a tooling page, or an Episode's own; any other slug is no page. */
export function findEpisodesPathPage(slug: string): EpisodesPathPage {
  if (!isEpisodesPathSlug(slug)) notFound();
  return episodesPathPage(slug);
}

/** The Slides a page under `/episodes/<slug>/` renders: a tooling page's, else the Episode's from the registry. */
export function findPageRecord(slug: string): EpisodeComposition {
  return matchPage<EpisodesPathPage, EpisodeComposition>(findEpisodesPathPage(slug), {
    tooling: ({ tooling }) => TOOLING_PAGES[tooling],
    episode: ({ episode }) => findEpisode(episode),
  });
}
