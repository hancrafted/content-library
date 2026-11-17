import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import { YoutubeLink, type VideoLabels } from '@/shared/components/ui/youtube-link';

export function EpisodeLinks({ card, labels }: { card: EpisodeCard; labels: VideoLabels }) {
  if (card.youtubeUrl === undefined) return null;
  return (
    <div data-episode-links className="flex items-center gap-2">
      <YoutubeLink url={card.youtubeUrl} labels={labels} data={{ 'data-episode-video': '' }} labelled />
    </div>
  );
}
