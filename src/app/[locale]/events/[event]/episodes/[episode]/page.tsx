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
  const page = eventEpisodePageOf(await params);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, episodePageCopy(page, locale));
}

export default async function Page({ params }: EventEpisodeParams) {
  return <EpisodePage page={eventEpisodePageOf(await params)} locale={await resolveLocale(params)} />;
}
