import { episodesPathParams } from '@/content-store/store';
import { episodePageCopy, episodesPathPageOf } from '@/page-assembly/episode/episode-page';
import { EpisodeStubPage } from '@/page-assembly/episode/episode-stub-page';
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
  return <EpisodeStubPage slug={(await params).episode} locale={DEFAULT_LOCALE} />;
}
