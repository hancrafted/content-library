import { EpisodePageContainer } from '@/components/episode-page/episode-page-container';
import { episodeCopy, findEpisode } from '@/components/episodes/registry';
import type { Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';

/** Every Episode's page component (FE-007 §1): looks the Episode up and renders it through the container (FE-002). */
export function EpisodePage({ slug, locale }: { slug: string; locale: Locale }) {
  return <EpisodePageContainer locale={locale} episode={findEpisode(slug)} />;
}

/** An Episode page's title and description in one locale, read through the registry, for `pageMetadata` (FE-008). */
export function episodePageCopy(slug: string, locale: Locale): PageCopy {
  const { title, description } = episodeCopy(slug, locale);
  return { title, description };
}
