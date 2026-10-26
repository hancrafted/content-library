import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { eventEpisodeRoute, eventRoute, type EpisodeId } from '@/content-store/catalogue/record-routes';
import type { IsoDate } from '@/content-store/schemas/fields';
import type { PresentedEpisode } from '@/content-store/store';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { cn } from '@/shared/lib/utils';
import { ArrowLeft, ArrowRight, CornerLeftUp } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { EVENT_WORDS, eventCopy } from '../lib/event-words';
import { EventBreadcrumb } from './event-breadcrumb';
import { PastNotice } from './past-notice';

/**
 * What an Event adds around an Episode it presents at its own URL (design-ADR 0016, Routes and visibility), ready for
 * the Episode page container: the route the page is served at, the header above the Title slide (the breadcrumb, then
 * for a past Event the notice), "Episode n of m" under the title, and the Playlist walk after the last Slide.
 */
export interface EventEpisodeFrame {
  /** The logical path of the Episode under its Event; the contents and Slide links point there. */
  readonly route: string;
  readonly header: ReactNode;
  readonly footer: ReactNode;
  /** "Episode 2 of 3". */
  readonly position: string;
}

/** What the frame reads of the Episode the page catalogue presents: the Event's slug and day, the Episode, its place. */
type FramedEpisode = Pick<PresentedEpisode, 'episode' | 'place'> & {
  readonly event: Pick<PresentedEpisode['event'], 'slug' | 'date'>;
};

interface FrameOptions {
  readonly locale: Locale;
  /** An Episode's title in `locale`, handed in by page assembly, so the Events area never reads an Episode itself. */
  readonly titleOf: (episode: EpisodeRef<EpisodeId>) => string;
  /** The day the page is built; an Event dated before it is past. */
  readonly buildDay: IsoDate;
}

/** The insets every Slide wrapper takes, so the frame lines up with the Slides (FE-009 §2). */
const INSET = 'pl-(--inset-l) pr-(--inset-r)';

/** One step of the walk through the Playlist: the Episode's title and the logical path of its page under the Event. */
interface Step {
  readonly title: string;
  readonly route: string;
}

/** The words and places the header and the walk share, read once in the page's locale. */
interface FrameParts {
  readonly locale: Locale;
  readonly labels: (typeof EVENT_WORDS)[Locale];
  readonly event: { readonly slug: FramedEpisode['event']['slug']; readonly title: string; readonly date: IsoDate };
  readonly episode: string;
  readonly previous?: Step;
  readonly next?: Step;
}

/**
 * The whole frame of one Episode's page under one Event, read in one locale: the one call page assembly makes for an
 * Event-scoped Episode page.
 */
export function eventEpisodeFrame(
  { event, episode, place }: FramedEpisode,
  { locale, titleOf, buildDay }: FrameOptions,
): EventEpisodeFrame {
  const labels = EVENT_WORDS[locale];
  const stepOf = (to: EpisodeRef<EpisodeId> | undefined): Step | undefined =>
    to === undefined ? undefined : { title: titleOf(to), route: eventEpisodeRoute(event.slug, to) };
  const previous = stepOf(place.previous);
  const next = stepOf(place.next);
  const parts: FrameParts = {
    locale,
    labels,
    event: { slug: event.slug, title: eventCopy(event.slug, locale).title, date: event.date },
    episode: titleOf(episode),
    ...(previous && { previous }),
    ...(next && { next }),
  };
  return {
    route: eventEpisodeRoute(event.slug, episode),
    header: <EventEpisodeHeader parts={parts} buildDay={buildDay} />,
    footer: <PlaylistNav parts={parts} />,
    position: fillTemplate(labels.position, { position: place.position, count: place.count }),
  };
}

/** Above the Title slide: the breadcrumb ending in the Episode, then, for a past Event, the notice. */
function EventEpisodeHeader({ parts, buildDay }: { parts: FrameParts; buildDay: IsoDate }) {
  const { locale, labels, event, episode } = parts;
  return (
    <div data-event-episode-header className={cn('flex flex-col gap-4 pt-2 pb-6', INSET)}>
      <EventBreadcrumb locale={locale} labels={labels.breadcrumb} event={event} episode={episode} />
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
function PlaylistNav({ parts }: { parts: FrameParts }) {
  const { locale, labels, previous, next, event } = parts;
  const ahead = next
    ? { walk: 'next' as const, cue: labels.next, ...next }
    : { walk: 'back' as const, cue: labels.backToEvent, title: event.title, route: eventRoute(event.slug) };
  return (
    <nav
      aria-label={labels.playlistNav}
      data-playlist-nav
      className={cn('grid grid-cols-2 items-start gap-6 py-12', INSET)}
    >
      <div>{previous && <WalkStep walk="previous" cue={labels.previous} {...previous} locale={locale} />}</div>
      <div className="flex justify-end">
        <WalkStep {...ahead} locale={locale} />
      </div>
    </nav>
  );
}
