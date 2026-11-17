import { maintainingMarkdownForAi as episode } from '@/episodes/maintaining-markdown-for-ai/episode';
import { EpisodePage, episodePageCopy, episodesPathPageOf } from '@/page-assembly/episode/episode-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

const PAGE_PARAMS = { episode: 'maintaining-markdown-for-ai' };

export async function generateMetadata() {
  const page = episodesPathPageOf(PAGE_PARAMS);
  return pageMetadata(page, DEFAULT_LOCALE, episodePageCopy(page, DEFAULT_LOCALE));
}

export default function Page() {
  return <EpisodePage page={episodesPathPageOf(PAGE_PARAMS)} composition={episode} locale={DEFAULT_LOCALE} />;
}
