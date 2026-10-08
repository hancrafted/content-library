import { EpisodePage } from '@/components/pages/episode-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { episodeParams, isEpisodeSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { resolveLocale } from '../../params';

interface EpisodeParams {
  params: Promise<{ locale: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = episodeParams;

export async function generateMetadata({ params }: EpisodeParams) {
  const { episode } = await params;
  if (!isEpisodeSlug(episode)) notFound();
  return pageMetadata({ episode }, await resolveLocale(params));
}

export default async function Page({ params }: EpisodeParams) {
  return <EpisodePage slug={(await params).episode} locale={await resolveLocale(params)} />;
}
