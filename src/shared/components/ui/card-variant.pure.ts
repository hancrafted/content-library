/**
 * How big a card is drawn and what it carries. `lead` is the landing hero;
 * `compact` serves the landing side cards and the overview grid; `event` is an Event's card on /events. A new variant
 * is one more member here and one more entry in the shell's variant table.
 */
export type CardVariant = 'lead' | 'compact' | 'event';

/** The level a card's title is drawn at; the page that places the card picks it so no level is skipped under the heading above. */
export type CardHeadingLevel = 2 | 3 | 4;

/** The cue that says a card opens: a filled button, a hover-only arrow, or "coming soon" on a card with nowhere to go. */
export type OpenCue = 'button' | 'arrow' | 'coming-soon';

const LINKED_CUES: Record<CardVariant, Exclude<OpenCue, 'coming-soon'>> = {
  lead: 'button',
  compact: 'arrow',
  event: 'arrow',
};

/** What a card opens: the locale-neutral path of its page, `null` while what it shows has none. */
export interface CardRoute {
  readonly route: string | null;
}

/** A card is a link once what it shows has a page; an announced-only Episode has no route. */
export function isLinked(card: CardRoute): boolean {
  return card.route !== null;
}

export function cueOf(card: CardRoute, variant: CardVariant): OpenCue {
  return isLinked(card) ? LINKED_CUES[variant] : 'coming-soon';
}
