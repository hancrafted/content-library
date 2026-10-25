import { EpisodePage, episodePageCopy } from '@/components/pages/episode-page';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { eventEpisodeParams, eventEpisodeRoute, isAnyEpisodeSlug, isEventEpisode, isEventSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { resolveLocale } from '../../../../params';

interface EventEpisodeParams {
  params: Promise<{ locale: string; event: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = eventEpisodeParams;

export async function generateMetadata({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  if (!isEventSlug(event) || !isAnyEpisodeSlug(episode) || !isEventEpisode(event, episode)) notFound();
  const locale = await resolveLocale(params);
  return pageMetadata({ event, episode }, locale, episodePageCopy(episode, locale));
}

export default async function Page({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  const locale = await resolveLocale(params);
  return <EpisodePage slug={episode} locale={locale} route={eventEpisodeRoute(event, episode)} />;
}
