import { aiTokenEconomy as episode } from '@/episodes/ai-token-economy/episode';
import { EpisodePage, episodePageCopy, episodesPathPageOf } from '@/page-assembly/episode/episode-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

const PAGE_PARAMS = { episode: 'ai-token-economy' };

export async function generateMetadata() {
  const page = episodesPathPageOf(PAGE_PARAMS);
  return pageMetadata(page, DEFAULT_LOCALE, episodePageCopy(page, DEFAULT_LOCALE));
}

export default function Page() {
  return <EpisodePage page={episodesPathPageOf(PAGE_PARAMS)} composition={episode} locale={DEFAULT_LOCALE} />;
}
