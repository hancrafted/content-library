import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { YoutubeLink, type VideoLabels } from '@/components/landing/episode-youtube-link';

/**
 * The places the Episode is also published, one icon link each, in a row of
 * the card's last row, so further channels (LinkedIn, Medium) can join without
 * crowding the card's head. Drawn only when the Episode is published somewhere.
 */
export function EpisodeLinks({ card, labels }: { card: EpisodeCard; labels: VideoLabels }) {
  if (card.youtubeUrl === undefined) return null;
  return (
    <div data-episode-links className="flex items-center gap-2">
      <YoutubeLink card={card} labels={labels} />
    </div>
  );
}
