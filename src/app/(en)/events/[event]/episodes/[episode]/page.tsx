import { EpisodePage, episodePageCopy } from '@/components/pages/episode-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { eventEpisodeParams, isAnyEpisodeSlug, isEventEpisode, isEventSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';

interface EventEpisodeParams {
  params: Promise<{ event: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = eventEpisodeParams;

export async function generateMetadata({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  if (!isEventSlug(event) || !isAnyEpisodeSlug(episode) || !isEventEpisode(event, episode)) notFound();
  return pageMetadata({ event, episode }, DEFAULT_LOCALE, episodePageCopy(episode, DEFAULT_LOCALE));
}

export default async function Page({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  return <EpisodePage slug={episode} locale={DEFAULT_LOCALE} event={event} />;
}
