import type { EpisodeCard } from './episode-card.pure';

/**
 * How big a card is drawn and what it carries. `lead` is the landing hero;
 * `compact` serves the landing side cards and the overview grid. A new variant
 * is one more member here and one more entry in the shell's variant table.
 */
export type CardVariant = 'lead' | 'compact';

/** The cue that says a card opens: a filled button, a hover-only arrow, or "coming soon" on a card with nowhere to go. */
export type OpenCue = 'button' | 'arrow' | 'coming-soon';

const LINKED_CUES: Record<CardVariant, Exclude<OpenCue, 'coming-soon'>> = {
  lead: 'button',
  compact: 'arrow',
};

/** A card is a link once its Episode has a page; an announced-only Episode has no route. */
export function isLinked(card: Pick<EpisodeCard, 'route'>): boolean {
  return card.route !== null;
}

export function cueOf(card: Pick<EpisodeCard, 'route'>, variant: CardVariant): OpenCue {
  return isLinked(card) ? LINKED_CUES[variant] : 'coming-soon';
}
