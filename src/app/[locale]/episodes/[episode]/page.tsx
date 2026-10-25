import { EpisodePage, episodePageCopy } from '@/components/pages/episode-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { episodeParams, episodesPathPage, isEpisodesPathSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { resolveLocale } from '../../params';

interface EpisodeParams {
  params: Promise<{ locale: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = episodeParams;

export async function generateMetadata({ params }: EpisodeParams) {
  const { episode } = await params;
  if (!isEpisodesPathSlug(episode)) notFound();
  const locale = await resolveLocale(params);
  return pageMetadata(episodesPathPage(episode), locale, episodePageCopy(episode, locale));
}

export default async function Page({ params }: EpisodeParams) {
  return <EpisodePage slug={(await params).episode} locale={await resolveLocale(params)} />;
}
