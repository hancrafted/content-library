import { EpisodePageContainer } from '@/components/episode/episode-page-container';
import { episodeParams, findEpisode } from '@/episodes/registry';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';

export const dynamicParams = false;
export const generateStaticParams = episodeParams;

/** Every Episode in the default locale, one static page per registry entry (FE-002). */
export default async function Page({ params }: { params: Promise<{ episode: string }> }) {
  const { episode } = await params;
  return <EpisodePageContainer locale={DEFAULT_LOCALE} episode={findEpisode(episode)} />;
}
