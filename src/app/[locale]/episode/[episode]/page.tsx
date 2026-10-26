import { episodesPathParams } from '@/content-store/store';
import { episodePageCopy, episodesPathPageOf } from '@/page-assembly/episode/episode-page';
import { EpisodeStubPage } from '@/page-assembly/episode/episode-stub-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { resolveLocale } from '../../params';

interface EpisodeParams {
  params: Promise<{ locale: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = episodesPathParams;

export async function generateMetadata({ params }: EpisodeParams) {
  const page = episodesPathPageOf(await params);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, episodePageCopy(page, locale));
}

export default async function Page({ params }: EpisodeParams) {
  return <EpisodeStubPage slug={(await params).episode} locale={await resolveLocale(params)} />;
}
