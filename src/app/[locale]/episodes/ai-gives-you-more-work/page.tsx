import { aiGivesYouMoreWork as episode } from '@/episodes/ai-gives-you-more-work/episode';
import { EpisodePage, episodePageCopy, episodesPathPageOf } from '@/page-assembly/episode/episode-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { prefixedLocaleParams, resolveLocale, type LocaleParams } from '../../params';

const PAGE_PARAMS = { episode: 'ai-gives-you-more-work' };

export const dynamicParams = false;
export const generateStaticParams = prefixedLocaleParams;

export async function generateMetadata({ params }: LocaleParams) {
  const page = episodesPathPageOf(PAGE_PARAMS);
  const locale = await resolveLocale(params);
  return pageMetadata(page, locale, episodePageCopy(page, locale));
}

export default async function Page({ params }: LocaleParams) {
  return (
    <EpisodePage page={episodesPathPageOf(PAGE_PARAMS)} composition={episode} locale={await resolveLocale(params)} />
  );
}
