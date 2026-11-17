import { axelAiAttentionSpan as episode } from '@/episodes/by-event/2026-10-23-axel-agentic-workflow/ai-attention-span/episode';
import { EpisodePage, episodePageCopy, eventEpisodePageOf } from '@/page-assembly/episode/episode-page';
import { pageMetadata } from '@/page-assembly/lib/page-metadata.pure';
import { DEFAULT_LOCALE } from '@/shared/lib/locale.pure';

const PAGE_PARAMS = { event: '2026-10-23-axel-agentic-workflow', episode: 'ai-attention-span' };

export async function generateMetadata() {
  const page = eventEpisodePageOf(PAGE_PARAMS);
  return pageMetadata(page, DEFAULT_LOCALE, episodePageCopy(page, DEFAULT_LOCALE));
}

export default function Page() {
  return <EpisodePage page={eventEpisodePageOf(PAGE_PARAMS)} composition={episode} locale={DEFAULT_LOCALE} />;
}
