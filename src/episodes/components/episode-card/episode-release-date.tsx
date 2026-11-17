import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';

export function ReleaseDate({ card, className }: { card: EpisodeCard; className: string }) {
  if (card.publishedOn === undefined || card.releaseDate === undefined) return null;
  return (
    <time data-episode-date dateTime={card.publishedOn} className={className}>
      {card.releaseDate}
    </time>
  );
}
