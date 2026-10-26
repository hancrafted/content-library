import { isEpisodeId } from '@/content-store/catalogue/record-routes';
import type { EpisodeComposition, EpisodeMessages } from '@/episodes/components/slide-master/slide';
import type { Locale } from '@/shared/lib/locale.pure';
import { notFound } from 'next/navigation';
import { EPISODES } from './episode-registry.generated';

/**
 * One Episode's composition (FE-002), from the generated Episode registry: every Episode, public or unlisted, by its
 * Episode id, and nothing else — the tooling pages have their own list (`tooling-pages.ts`). An unregistered id is a 404.
 */
export function findEpisode(id: string): EpisodeComposition {
  if (!isEpisodeId(id)) notFound();
  return EPISODES[id];
}

/** An Episode's own text in one locale, from its record, by its Episode id: what the page metadata and cards read. */
export function episodeCopy(id: string, locale: Locale): EpisodeMessages {
  return findEpisode(id).messages[locale];
}
