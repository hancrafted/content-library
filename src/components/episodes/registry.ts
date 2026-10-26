import type { EpisodeComposition, EpisodeMessages } from '@/components/slide-master/slide';
import type { Locale } from '@/lib/locale.pure';
import { isEpisodeSlug, type EpisodeSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { EPISODES } from './episode-registry.generated';

/**
 * One Episode's composition (FE-002), from the generated Episode registry: every Episode, public or unlisted, by slug,
 * and nothing else — the tooling pages have their own list (`tooling-pages.ts`). An unregistered slug is a 404.
 */
export function findEpisode(slug: string): EpisodeComposition<EpisodeSlug> {
  if (!isEpisodeSlug(slug)) notFound();
  return EPISODES[slug];
}

/** An Episode's own text in one locale, from its record: what the page metadata and the landing card read. */
export function episodeCopy(slug: string, locale: Locale): EpisodeMessages {
  return findEpisode(slug).messages[locale];
}
