import { axelAgenticWorkflowOnboardAiEveryTime as episode } from '@/episodes/by-event/2026-10-23-axel-agentic-workflow/onboard-ai-every-time/episode';
import { EpisodePage, episodePageCopy, eventEpisodePageOf } from '@/page-assembly/episode/episode-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from '../../../../params';

const PAGE_PARAMS = { event: '2026-10-23-axel-agentic-workflow', episode: 'onboard-ai-every-time' };

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: LocaleParams) {
  const page = eventEpisodePageOf(PAGE_PARAMS);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, episodePageCopy(page, locale));
}

export default async function Page({ params }: LocaleParams) {
  return (
    <EpisodePage page={eventEpisodePageOf(PAGE_PARAMS)} composition={episode} locale={await resolveLocale(params)} />
  );
}
