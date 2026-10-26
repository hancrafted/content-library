import type { IsoDate } from '@/content-store/schemas/fields';
import type { PlaylistPlace, ServedEvent } from '@/content-store/store';
import { episodeCopy } from '@/episodes/lib/registry';
import { TRANSLATIONS } from '@/i18n/translations';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { eventEpisodeRoute, eventRoute, type EpisodeId, type EventSlug } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, CornerLeftUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { EventBreadcrumb } from './event-breadcrumb';
import { PastNotice } from './past-notice';

/** One step of the walk through the Playlist: the Episode's title and the logical path of its page under the Event. */
interface Step {
  readonly title: string;
  readonly route: string;
}

/**
 * What an Event-scoped Episode page adds around the Episode (design-ADR 0016, Routes and visibility), read in one
 * locale: the breadcrumb and, for a past Event, the notice above the title; "Episode n of m" under the title; the
 * previous and next Episodes after the last Slide, and the way back to the Event once the Playlist ends.
 */
export interface EventEpisodeChrome {
  readonly locale: Locale;
  readonly labels: (typeof TRANSLATIONS)[Locale]['eventsPage'];
  readonly event: { readonly slug: EventSlug; readonly title: string; readonly date: IsoDate };
  readonly episode: string;
  /** "Episode 2 of 3". */
  readonly position: string;
  readonly previous?: Step;
  readonly next?: Step;
}

/** One Episode an Event presents: the served Event, the Episode's page, and its place in the Event's Playlist. */
export interface PresentedEpisode {
  readonly event: ServedEvent;
  readonly episode: EpisodeId;
  readonly place: PlaylistPlace;
}

/** The chrome of one Episode's page under one Event, read in one locale. */
export async function eventEpisodeChrome(
  { event, episode: slug, place }: PresentedEpisode,
  locale: Locale,
): Promise<EventEpisodeChrome> {
  const labels = TRANSLATIONS[locale].eventsPage;
  const t = await getTranslations({ locale, namespace: 'eventsPage' });
  const stepOf = (episode: EpisodeId | undefined): Step | undefined =>
    episode === undefined
      ? undefined
      : { title: episodeCopy(episode, locale).title, route: eventEpisodeRoute(event.slug, episode) };
  const previous = stepOf(place.previous);
  const next = stepOf(place.next);
  return {
    locale,
    labels,
    event: { slug: event.slug, title: labels.items[event.slug].title, date: event.date },
    episode: episodeCopy(slug, locale).title,
    position: t('position', { position: place.position, count: place.count }),
    ...(previous && { previous }),
    ...(next && { next }),
  };
}

/** Above the Title slide: the breadcrumb ending in the Episode, then, for a past Event, the notice. */
export function EventEpisodeHeader({
  chrome,
  buildDay,
  className,
}: {
  chrome: EventEpisodeChrome;
  /** The day the page is built; an Event dated before it is past. */
  buildDay: IsoDate;
  className?: string;
}) {
  const { locale, labels, event, episode } = chrome;
  return (
    <div data-event-episode-header className={cn('flex flex-col gap-4 pt-2 pb-6', className)}>
      <EventBreadcrumb
        locale={locale}
        labels={{ breadcrumb: labels.breadcrumb, events: labels.title }}
        event={event}
        episode={episode}
      />
      <PastNotice date={event.date} buildDay={buildDay} text={labels.pastNotice} />
    </div>
  );
}

const STEP =
  'flex min-w-0 flex-col gap-1 rounded-sm text-body text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none';

/** One step of the walk: its cue, with an arrow pointing the way, over the title it opens. */
function WalkStep(props: {
  walk: 'previous' | 'next' | 'back';
  cue: string;
  title: string;
  route: string;
  locale: Locale;
}) {
  const Arrow = { previous: ArrowLeft, next: ArrowRight, back: CornerLeftUp }[props.walk];
  const ahead = props.walk !== 'previous';
  return (
    <Link
      {...{ [`data-playlist-${props.walk}`]: '' }}
      href={localizePath(props.route, props.locale)}
      className={cn(STEP, ahead && 'items-end text-right')}
    >
      <span
        data-playlist-cue
        className={cn('inline-flex items-center gap-1 text-caption text-muted-foreground', ahead && 'flex-row-reverse')}
      >
        <Arrow aria-hidden className="size-4 shrink-0" />
        {props.cue}
      </span>
      <span className="font-medium text-balance">{props.title}</span>
    </Link>
  );
}

/**
 * After the last Slide: the previous Episode of the Playlist and the next one, each when there is one; on the last
 * Episode the next step leads back to the Event, so the attendee is never stranded.
 */
export function PlaylistNav({ chrome, className }: { chrome: EventEpisodeChrome; className?: string }) {
  const { locale, labels, previous, next, event } = chrome;
  const ahead = next
    ? { walk: 'next' as const, cue: labels.next, ...next }
    : { walk: 'back' as const, cue: labels.backToEvent, title: event.title, route: eventRoute(event.slug) };
  return (
    <nav
      aria-label={labels.playlistNav}
      data-playlist-nav
      className={cn('grid grid-cols-2 items-start gap-6 py-12', className)}
    >
      <div>{previous && <WalkStep walk="previous" cue={labels.previous} {...previous} locale={locale} />}</div>
      <div className="flex justify-end">
        <WalkStep {...ahead} locale={locale} />
      </div>
    </nav>
  );
}
