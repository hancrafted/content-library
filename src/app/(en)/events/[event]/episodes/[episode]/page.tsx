import { EventEpisodePage, eventEpisodePageCopy, eventEpisodeParams } from '@/components/pages/event-episode-page';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { isEpisodeSlug, isEventSlug } from '@/lib/routes';
import { notFound } from 'next/navigation';

interface EventEpisodeParams {
  params: Promise<{ event: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = eventEpisodeParams;

export async function generateMetadata({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  if (!isEventSlug(event) || !isEpisodeSlug(episode)) notFound();
  return pageMetadata(
    { kind: 'event-episode', event, episode },
    DEFAULT_LOCALE,
    eventEpisodePageCopy(event, episode, DEFAULT_LOCALE),
  );
}

export default async function Page({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  return <EventEpisodePage event={event} episode={episode} locale={DEFAULT_LOCALE} />;
}
