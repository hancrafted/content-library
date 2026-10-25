import { CardArrow, CardShell, CardTitle } from '@/components/landing/card-shell';
import type { CardHeadingLevel } from '@/components/landing/card-variant.pure';
import { THEME_ACCENTS } from '@/components/landing/episode-visuals';
import type { WorkshopCard } from '@/components/landing/workshop-card.pure';
import type { Locale } from '@/lib/locale.pure';
import { CalendarDays } from 'lucide-react';

const WHEN = THEME_ACCENTS.primary.ink;

export interface WorkshopCardProps {
  card: WorkshopCard;
  locale: Locale;
  /** The title's heading level, one below the heading the list sits under. */
  headingLevel: CardHeadingLevel;
  /** Where the card sits in its grid. */
  className?: string;
}

/** The date is the card's loudest line, with the time beside it when the Workshop has one. */
function WorkshopDate({ card }: { card: WorkshopCard }) {
  return (
    <p className={`flex flex-wrap items-baseline gap-x-3 text-subheading font-semibold ${WHEN}`}>
      <time data-workshop-date dateTime={card.date}>
        {card.dateLabel}
      </time>
      {card.time !== undefined && (
        <span data-workshop-time className="text-caption font-medium">
          {card.time}
        </span>
      )}
    </p>
  );
}

/**
 * One Workshop as a card, in the Episode card's style: the calendar icon in the primary accent,
 * the date first, the title as the card's one link, the Episode count where an Episode shows its Concepts;
 * no description, which the Workshop's own page carries.
 */
export function WorkshopCardView({ card, locale, headingLevel, className }: WorkshopCardProps) {
  return (
    <CardShell
      variant="workshop"
      linked
      accent="primary"
      icon={CalendarDays}
      className={className}
      data={{ 'data-workshop-card': '', 'data-workshop-slug': card.slug }}
    >
      <WorkshopDate card={card} />
      <CardTitle variant="workshop" title={card.title} route={card.route} locale={locale} level={headingLevel} />
      <div className="mt-auto flex min-h-11 items-center justify-between gap-4 pt-2">
        <span data-workshop-episode-count className="text-caption text-muted-foreground">
          {card.episodeCountLabel}
        </span>
        <CardArrow variant="workshop" />
      </div>
    </CardShell>
  );
}
