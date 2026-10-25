import type { EpisodeCard } from './episode-card.pure';

/** The card fields an Event's Playlist reads. */
type AgendaCard = Pick<EpisodeCard, 'slug' | 'route' | 'minutes'>;

/** The Playlist's reading time: the counted minutes of the Episodes that have them; none when no Episode has one, so nothing shows. */
export function totalMinutes(cards: readonly AgendaCard[]): number | undefined {
  const known = cards.flatMap((card) => (card.minutes === undefined ? [] : [card.minutes]));
  return known.length === 0 ? undefined : known.reduce((sum, minutes) => sum + minutes, 0);
}

/** The first Episode a visitor can open, with its 1-based step in the Playlist; none while every Episode is upcoming. */
export function startOf<Card extends AgendaCard>(cards: readonly Card[]): { step: number; card: Card } | undefined {
  const index = cards.findIndex((card) => card.route !== null);
  return index === -1 ? undefined : { step: index + 1, card: cards[index] };
}
