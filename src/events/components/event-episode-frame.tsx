import type { EpisodeRef } from '@/content-store/catalogue/episode-id.pure';
import { eventEpisodeRoute, eventRoute } from '@/content-store/catalogue/record-routes';
import type { IsoDate } from '@/content-store/schemas/fields';
import type { PresentedEpisode } from '@/content-store/store';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { ArrowLeft, ArrowRight, CornerLeftUp } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { EVENT_WORDS, eventCopy } from '../lib/event-words';
import { isPastEvent } from '../lib/events.pure';
import { PastNotice } from './past-notice';

// decision: docs/decision-records/0016-content-data-model.md
export interface EventEpisodeFrame {
  readonly route: string;
  readonly header: ReactNode;
  readonly footer: ReactNode;
  readonly time: string | undefined;
}

interface FramedEpisode<Id extends string> {
  readonly event: Pick<PresentedEpisode['event'], 'slug' | 'date' | 'time'>;
  readonly episode: EpisodeRef<Id>;
  readonly place: { readonly previous?: EpisodeRef<Id>; readonly next?: EpisodeRef<Id> };
}

interface FrameOptions<Id extends string> {
  readonly locale: Locale;
  readonly titleOf: (episode: EpisodeRef<Id>) => string;
  readonly buildDay: IsoDate;
}

// decision: FE-009 §2
const INSET = 'pl-(--inset-l) pr-(--inset-r)';

interface Step {
  readonly title: string;
  readonly route: string;
}

interface FrameParts {
  readonly locale: Locale;
  readonly labels: (typeof EVENT_WORDS)[Locale];
  readonly event: { readonly slug: PresentedEpisode['event']['slug']; readonly title: string; readonly date: IsoDate };
  readonly previous?: Step;
  readonly next?: Step;
}

export function eventEpisodeFrame<Id extends string>(
  { event, episode, place }: FramedEpisode<Id>,
  { locale, titleOf, buildDay }: FrameOptions<Id>,
): EventEpisodeFrame {
  const labels = EVENT_WORDS[locale];
  const stepOf = (to: EpisodeRef<Id> | undefined): Step | undefined =>
    to === undefined ? undefined : { title: titleOf(to), route: eventEpisodeRoute(event.slug, to) };
  const previous = stepOf(place.previous);
  const next = stepOf(place.next);
  const parts: FrameParts = {
    locale,
    labels,
    event: { slug: event.slug, title: eventCopy(event.slug, locale).title, date: event.date },
    ...(previous && { previous }),
    ...(next && { next }),
  };
  return {
    route: eventEpisodeRoute(event.slug, episode),
    header: isPastEvent(event.date, buildDay) ? (
      <PastNotice date={event.date} buildDay={buildDay} text={labels.pastNotice} />
    ) : null,
    footer: <PlaylistNav parts={parts} />,
    time: event.time,
  };
}

const STEP =
  'flex min-w-0 flex-col gap-1 rounded-sm text-body text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none';

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
