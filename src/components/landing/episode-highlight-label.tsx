import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { HIGHLIGHTED_TOPIC } from '@/lib/episode-overview';

/**
 * The highlighted Topic's name, for a card filed under it as an
 * extra Topic, so an Episode about AI stands out wherever it is filed. A card
 * whose primary Topic is the highlighted one already names it, so it gets none.
 */
export function HighlightLabel({ card, className }: { card: EpisodeCard; className: string }) {
  const topic = card.topics.find(({ id }) => id === HIGHLIGHTED_TOPIC);
  if (!card.highlighted || topic === undefined || card.topic.id === HIGHLIGHTED_TOPIC) return null;
  return (
    <span data-highlight-label className={className}>
      {topic.label}
    </span>
  );
}
