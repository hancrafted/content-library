import { TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import type { EventCard, EventPlace } from '@/events/lib/event-card.pure';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardArrow, CardCaption, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import type { CardHeadingLevel } from '@/shared/components/ui/card-variant.pure';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';
import { CalendarDays, MapPin, Video } from 'lucide-react';

export interface EventCardProps {
  card: EventCard;
  locale: Locale;
  /** The title's heading level, one below the heading the list sits under. */
  headingLevel: CardHeadingLevel;
  /** Where the card sits in its grid. */
  className?: string;
}

const META = 'inline-flex items-center gap-2 text-caption text-muted-foreground';

/** Where the Event takes place: a pin at a venue, a camera on a platform; a hybrid Event is at its venue first. */
function Place({ place }: { place: EventPlace }) {
  const Icon = place.format === 'remote' ? Video : MapPin;
  return (
    <p data-event-place={place.format} className={META}>
      <Icon aria-hidden className="size-4 shrink-0" />
      <span>{place.label}</span>
    </p>
  );
}

/** The day, with the time beside it when the Event has one. */
function When({ card }: { card: EventCard }) {
  return (
    <p className={`${META} font-medium text-foreground`}>
      <CalendarDays aria-hidden className="size-4 shrink-0" />
      <time data-event-date dateTime={card.date}>
        {card.dateLabel}
      </time>
      {card.time !== undefined && <span data-event-time>· {card.time}</span>}
    </p>
  );
}

/**
 * One Event as a card, laid out as an Episode card is: the lead Tag's icon and accent, the title as the card's one
 * link, the description, the Tags, then where it takes place, and the day and time at the bottom.
 */
export function EventCardView({ card, locale, headingLevel, className }: EventCardProps) {
  return (
    <CardShell
      variant="event"
      linked
      accent={tagToken(card.leadTag)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag]]}
      className={className}
      data={{ 'data-event-card': '', 'data-event-slug': card.slug, 'data-lead-tag': card.leadTag }}
    >
      <CardTitle variant="event" title={card.title} route={card.route} locale={locale} level={headingLevel} />
      <CardCaption variant="event">{card.description}</CardCaption>
      <BadgeList items={card.tags} data={{ 'data-event-tags': '' }} />
      <Place place={card.place} />
      <div className="mt-auto flex min-h-11 items-center justify-between gap-4 pt-2">
        <When card={card} />
        <CardArrow variant="event" />
      </div>
    </CardShell>
  );
}
