import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { listEpisodes } from '@/components/episodes/episode-repository';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import type { EpisodeStatus } from '@/lib/episode-metadata.pure';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';

/** Every Episode's page component (FE-007 §1): looks the Episode up and renders it through the container (FE-002). */
export function EpisodePage({ slug, locale }: { slug: string; locale: Locale }) {
  return <EpisodePageContainer locale={locale} episode={findEpisode(slug)} />;
}

/** An Episode page's title, description and status, read through the registry, for `pageMetadata` (FE-008); the status makes an upcoming page `noindex`. */
export function episodePageCopy(slug: string, locale: Locale): PageCopy {
  const { title, description } = episodeCopy(slug, locale);
  return { title, description, status: episodeStatus(slug) };
}

/** The Episode's status; a layout reference has no metadata and counts as published. */
function episodeStatus(slug: string): EpisodeStatus {
  return listEpisodes().find((episode) => episode.slug === slug)?.status ?? 'published';
}
