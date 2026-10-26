import { eventEpisodeParams } from '@/content-store/store';
import { EpisodePage, episodePageCopy, eventEpisodePageOf } from '@/page-assembly/episode/episode-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

interface EventEpisodeParams {
  params: Promise<{ event: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = eventEpisodeParams;

export async function generateMetadata({ params }: EventEpisodeParams) {
  const page = eventEpisodePageOf(await params);
  return pageMetadata(page, DEFAULT_LOCALE, episodePageCopy(page, DEFAULT_LOCALE));
}

export default async function Page({ params }: EventEpisodeParams) {
  return <EpisodePage page={eventEpisodePageOf(await params)} locale={DEFAULT_LOCALE} />;
}
