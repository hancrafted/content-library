import type { EpisodeComposition } from '@/components/slide-master/slide';
import { episodesPathPage, isEpisodesPathSlug, matchPage, type EpisodesPathPage } from '@/lib/routes';
import { isToolingSlug, type ToolingSlug } from '@/lib/tooling-pages';
import { notFound } from 'next/navigation';
import { episodeTemplate } from './episode-template/episode';
import { explorableExplanations } from './explorable-explanations/episode';
import { findEpisode } from './registry';
import { slideMaster } from './slide-master/episode';
import { workshopTemplate } from './workshop-template/episode';

/**
 * Every tooling page's Slides, by slug (design-ADR 0016 decision 12): the authoring benches, composed like an
 * Episode and rendered by the same container, but no Episode, so they stay out of the Episode registry. Typed against
 * `TOOLING_SLUGS`, so a slug without a record, or a key that differs from its record's slug, fails `tsc`.
 */
const TOOLING_PAGES: { readonly [S in ToolingSlug]: EpisodeComposition & { readonly slug: S } } = {
  'episode-template': episodeTemplate,
  'workshop-template': workshopTemplate,
  'slide-master': slideMaster,
  'explorable-explanations': explorableExplanations,
};

export function findToolingPage(slug: string): EpisodeComposition<ToolingSlug> {
  if (!isToolingSlug(slug)) notFound();
  return TOOLING_PAGES[slug];
}

/** The Slides a page under `/episodes/<slug>/` renders: a tooling page's, else the Episode's from the registry. */
export function findPageRecord(slug: string): EpisodeComposition {
  if (!isEpisodesPathSlug(slug)) notFound();
  const page = episodesPathPage(slug);
  return matchPage<EpisodesPathPage, EpisodeComposition>(page, {
    tooling: ({ tooling }) => TOOLING_PAGES[tooling],
    episode: ({ episode }) => findEpisode(episode),
  });
}
