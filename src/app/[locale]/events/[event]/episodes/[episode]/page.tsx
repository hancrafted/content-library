import { eventEpisodeParams } from '@/content-store/store';
import { EpisodePage, episodePageCopy, eventEpisodePageOf } from '@/page-assembly/episode/episode-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { resolveLocale } from '../../../../params';

interface EventEpisodeParams {
  params: Promise<{ locale: string; event: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = eventEpisodeParams;

export async function generateMetadata({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  const page = eventEpisodePageOf(event, episode);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, episodePageCopy(page, locale));
}

export default async function Page({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  return <EpisodePage page={eventEpisodePageOf(event, episode)} locale={await resolveLocale(params)} />;
}
