import { EpisodePage } from '@/components/pages/episode-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { episodeParams, isEpisodeSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';

interface EpisodeParams {
  params: Promise<{ episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = episodeParams;

export async function generateMetadata({ params }: EpisodeParams) {
  const { episode } = await params;
  if (!isEpisodeSlug(episode)) notFound();
  return pageMetadata({ episode }, DEFAULT_LOCALE);
}

export default async function Page({ params }: EpisodeParams) {
  return <EpisodePage slug={(await params).episode} locale={DEFAULT_LOCALE} />;
}
