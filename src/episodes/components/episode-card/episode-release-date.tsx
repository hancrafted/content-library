import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';

/** The day the Episode was released, machine-readable in `dateTime`; drawn only on a published card. */
export function ReleaseDate({ card, className }: { card: EpisodeCard; className: string }) {
  if (card.publishedOn === undefined || card.releaseDate === undefined) return null;
  return (
    <time data-episode-date dateTime={card.publishedOn} className={className}>
      {card.releaseDate}
    </time>
  );
}
