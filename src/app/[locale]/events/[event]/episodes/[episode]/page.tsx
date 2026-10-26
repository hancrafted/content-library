import { EventEpisodePage, eventEpisodePage, eventEpisodePageCopy } from '@/components/pages/event-episode-page';
import { eventEpisodeParams } from '@/content-store/store';
import { pageMetadata } from '@/lib/page-metadata.pure';
import { resolveLocale } from '../../../../params';

interface EventEpisodeParams {
  params: Promise<{ locale: string; event: string; episode: string }>;
}

export const dynamicParams = false;
export const generateStaticParams = eventEpisodeParams;

export async function generateMetadata({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  const page = eventEpisodePage(event, episode);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, eventEpisodePageCopy(page, locale));
}

export default async function Page({ params }: EventEpisodeParams) {
  const { event, episode } = await params;
  return <EventEpisodePage event={event} episode={episode} locale={await resolveLocale(params)} />;
}
