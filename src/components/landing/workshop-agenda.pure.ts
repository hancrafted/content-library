import type { EpisodeCard } from './episode-card.pure';

/** The card fields a Workshop's agenda reads. */
type AgendaCard = Pick<EpisodeCard, 'slug' | 'route' | 'minutes'>;

/** The Workshop's Episodes as cards, in the order the record teaches them; throws on an Episode with no card, so the build fails rather than ships a gap. */
export function agendaOf<Card extends Pick<EpisodeCard, 'slug'>>(
  slugs: readonly string[],
  cards: readonly Card[],
): Card[] {
  return slugs.map((slug) => {
    const card = cards.find((each) => each.slug === slug);
    if (card === undefined) throw new Error(`No Episode card for "${slug}" in the Workshop`);
    return card;
  });
}

/** The agenda's reading time: the counted minutes of the Episodes that have them; none when no Episode has one, so nothing shows. */
export function totalMinutes(cards: readonly AgendaCard[]): number | undefined {
  const known = cards.flatMap((card) => (card.minutes === undefined ? [] : [card.minutes]));
  return known.length === 0 ? undefined : known.reduce((sum, minutes) => sum + minutes, 0);
}

/** The first Episode a visitor can open, with its 1-based step in the agenda; none while every Episode is upcoming. */
export function startOf<Card extends AgendaCard>(cards: readonly Card[]): { step: number; card: Card } | undefined {
  const index = cards.findIndex((card) => card.route !== null);
  return index === -1 ? undefined : { step: index + 1, card: cards[index] };
}
