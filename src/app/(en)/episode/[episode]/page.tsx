import { episodePageCopy } from '@/components/pages/episode-page';
import { EpisodeStubPage } from '@/components/pages/episode-stub-page';
import { episodesPathParams } from '@/content-store/store';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { episodesPathPage, isEpisodesPathSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';

interface EpisodeParams {
  params: Promise<{ episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = episodesPathParams;

export async function generateMetadata({ params }: EpisodeParams) {
  const { episode } = await params;
  if (!isEpisodesPathSlug(episode)) notFound();
  return pageMetadata(episodesPathPage(episode), DEFAULT_LOCALE, episodePageCopy(episode, DEFAULT_LOCALE));
}

export default async function Page({ params }: EpisodeParams) {
  return <EpisodeStubPage slug={(await params).episode} locale={DEFAULT_LOCALE} />;
}
