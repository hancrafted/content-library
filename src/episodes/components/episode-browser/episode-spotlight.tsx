import { showsFormat, spotlightOf } from '@/episodes/components/episode-browser/episode-browser.pure';
import { EpisodeCardView, type CardLabels } from '@/episodes/components/episode-card/episode-card';
import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import type { CardHeadingLevel } from '@/shared/components/ui/card-variant.pure';
import type { Locale } from '@/shared/lib/locale.pure';

/** Where each card sits: the lead spans two thirds and the full height of the stack beside it, and fills the row when nothing sits beside it. */
function placement(isLead: boolean, sideCount: number): string {
  if (!isLead) return sideCount === 1 ? 'md:col-span-2 lg:col-span-1' : '';
  if (sideCount === 0) return 'md:col-span-2 lg:col-span-3';
  return sideCount === 1 ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-2 lg:col-span-2 lg:row-span-2';
}

interface SpotlightProps {
  cards: readonly EpisodeCard[];
  locale: Locale;
  labels: CardLabels;
  /** The cards' heading level, one below the heading the Spotlight sits under. */
  headingLevel: CardHeadingLevel;
}

/**
 * The hottest published Episodes as an asymmetric bento: a lead card and up to
 * two beside it. Static, never rotating; an upcoming Episode never reaches it,
 * because the selection only takes published cards. DOM order is reading order.
 */
export function EpisodeSpotlight({ cards, locale, labels, headingLevel }: SpotlightProps) {
  const { lead, side } = spotlightOf(cards);
  if (lead === null) return null;
  const shared = { locale, labels, headingLevel, showFormat: showsFormat(cards) };
  return (
    <div data-episode-spotlight className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <EpisodeCardView card={lead} variant="lead" className={placement(true, side.length)} {...shared} />
      {side.map((card) => (
        <EpisodeCardView
          key={card.slug}
          card={card}
          variant="compact"
          className={placement(false, side.length)}
          {...shared}
        />
      ))}
    </div>
  );
}
