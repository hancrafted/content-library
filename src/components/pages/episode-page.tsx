import { EpisodePageContainer } from '@/components/episode/episode-page-container';
import { findEpisode } from '@/components/episodes/registry';
import type { Locale } from '@/lib/locale.pure';

/** Every Episode's page component (FE-007 §1): looks the Episode up and renders it through the container (FE-002). */
export function EpisodePage({ slug, locale }: { slug: string; locale: Locale }) {
  return <EpisodePageContainer locale={locale} episode={findEpisode(slug)} />;
}
