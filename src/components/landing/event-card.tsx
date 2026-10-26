import { CardArrow, CardShell, CardTitle } from '@/components/landing/card-shell';
import type { CardHeadingLevel } from '@/components/landing/card-variant.pure';
import type { EventCard } from '@/components/landing/event-card.pure';
import { TAG_ACCENTS } from '@/episodes/components/episode-card/episode-visuals';
import type { Locale } from '@/lib/locale.pure';
import { CalendarDays } from 'lucide-react';

const WHEN = TAG_ACCENTS.primary.ink;

export interface EventCardProps {
  card: EventCard;
  locale: Locale;
  /** The title's heading level, one below the heading the list sits under. */
  headingLevel: CardHeadingLevel;
  /** Where the card sits in its grid. */
  className?: string;
}

/** The date is the card's loudest line, with the time beside it when the Event has one. */
function EventDate({ card }: { card: EventCard }) {
  return (
    <p className={`flex flex-wrap items-baseline gap-x-3 text-subheading font-semibold ${WHEN}`}>
      <time data-event-date dateTime={card.date}>
        {card.dateLabel}
      </time>
      {card.time !== undefined && (
        <span data-event-time className="text-caption font-medium">
          {card.time}
        </span>
      )}
    </p>
  );
}

/**
 * One Event as a card, in the Episode card's style: the calendar icon in the primary accent,
 * the date first, the title as the card's one link, the Episode count where an Episode shows its Tags;
 * no description, which the Event's own page carries.
 */
export function EventCardView({ card, locale, headingLevel, className }: EventCardProps) {
  return (
    <CardShell
      variant="event"
      linked
      accent="primary"
      icon={CalendarDays}
      className={className}
      data={{ 'data-event-card': '', 'data-event-slug': card.slug }}
    >
      <EventDate card={card} />
      <CardTitle variant="event" title={card.title} route={card.route} locale={locale} level={headingLevel} />
      <div className="mt-auto flex min-h-11 items-center justify-between gap-4 pt-2">
        <span data-event-episode-count className="text-caption text-muted-foreground">
          {card.episodeCountLabel}
        </span>
        <CardArrow variant="event" />
      </div>
    </CardShell>
  );
}
