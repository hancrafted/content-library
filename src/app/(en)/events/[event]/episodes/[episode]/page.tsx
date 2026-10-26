import { EventEpisodePage, eventEpisodePage, eventEpisodePageCopy } from '@/components/pages/event-episode-page';
import { eventEpisodeParams } from '@/content-store/store';
import { DEFAULT_LOCALE } from '@/lib/locale.pure';
import { pageMetadata } from '@/lib/page-metadata.pure';

interface EventEpisodeParams {
  params: Promise<{ event: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = eventEpisodeParams;

export async function generateMetadata({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  const page = eventEpisodePage(event, episode);
  return pageMetadata(page, DEFAULT_LOCALE, eventEpisodePageCopy(page, DEFAULT_LOCALE));
}

export default async function Page({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  return <EventEpisodePage event={event} episode={episode} locale={DEFAULT_LOCALE} />;
}
