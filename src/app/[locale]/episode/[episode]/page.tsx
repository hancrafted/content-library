import { EpisodePageContainer } from '@/components/episode/episode-page-container';
import { episodeParams, findEpisode } from '@/episodes/registry';
import { resolveLocale } from '../../params';

export const dynamicParams = false;
export const generateStaticParams = episodeParams;

/** Every Episode in each prefixed locale, one static page per registry entry (FE-002). */
export default async function Page({ params }: { params: Promise<{ locale: string; episode: string }> }) {
  const { episode } = await params;
  return <EpisodePageContainer locale={await resolveLocale(params)} episode={findEpisode(episode)} />;
}
