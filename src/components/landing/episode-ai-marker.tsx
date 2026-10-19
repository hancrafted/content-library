import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { TOPIC_ACCENTS } from '@/components/landing/episode-visuals';
import { HIGHLIGHTED_TOPIC, TOPICS } from '@/lib/episode-overview';
import { Sparkles } from 'lucide-react';

/**
 * The highlighted Topic's mark beside another Topic's name, so an Episode about
 * AI stands out wherever it is filed. A card whose primary Topic is the
 * highlighted one already wears its icon and colour, so it gets no second mark.
 */
export function AiMarker({ card }: { card: EpisodeCard }) {
  const topic = card.topics.find(({ id }) => id === HIGHLIGHTED_TOPIC);
  if (!card.highlighted || topic === undefined || card.topic.id === HIGHLIGHTED_TOPIC) return null;
  return (
    <span
      data-ai-marker
      title={topic.label}
      className={`inline-flex ${TOPIC_ACCENTS[TOPICS[HIGHLIGHTED_TOPIC].accent].ink}`}
    >
      <Sparkles aria-hidden className="h-3.5 w-3.5" />
      <span className="sr-only">{topic.label}</span>
    </span>
  );
}
