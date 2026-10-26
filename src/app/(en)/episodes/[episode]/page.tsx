import { episodesPathParams } from '@/content-store/store';
import { EpisodePage, episodePageCopy, episodesPathPageOf } from '@/page-assembly/episode/episode-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

interface EpisodeParams {
  params: Promise<{ episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = episodesPathParams;

export async function generateMetadata({ params }: EpisodeParams) {
  const page = episodesPathPageOf(await params);
  return pageMetadata(page, DEFAULT_LOCALE, episodePageCopy(page, DEFAULT_LOCALE));
}

export default async function Page({ params }: EpisodeParams) {
  return <EpisodePage page={episodesPathPageOf(await params)} locale={DEFAULT_LOCALE} />;
}
