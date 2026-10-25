import { contentStore } from '@/components/episodes/content-store';
import { episodeCopy } from '@/components/episodes/registry';
import { TRANSLATIONS } from '@/i18n/translations';
import { BUILD_DAY } from '@/lib/build-day';
import type { IsoDate } from '@/lib/episode-metadata.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { playlistPosition } from '@/lib/playlists.pure';
import { eventEpisodeRoute, eventRoute, isEventSlug } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { EventBreadcrumb, type Crumb } from './event-breadcrumb';
import { PastNotice } from './past-notice';

/**
 * What an Event-scoped Episode page adds around the Episode (design-ADR 0016, Event page behaviour): the breadcrumb
 * and, for a past Event, the notice above the title; the Episode's place in the Playlist after it; the previous and
 * next Episodes and the way back to the Event at the end. Plain values, read in one locale.
 */
export interface EventEpisodeChrome {
  readonly locale: Locale;
  readonly breadcrumb: { readonly breadcrumb: string; readonly events: string };
  readonly event: Crumb & { readonly date: IsoDate };
  readonly episode: string;
  readonly notice: { readonly buildDay: IsoDate; readonly text: string };
  /** "Episode 2 of 4". */
  readonly position: string;
  readonly nav: {
    readonly label: string;
    readonly back: Crumb;
    readonly previous?: Crumb & { readonly cue: string };
    readonly next?: Crumb & { readonly cue: string };
  };
}

/** Reads the chrome of one Episode's page under one Event; throws when the Event or its Playlist is missing, so the build fails. */
export async function eventEpisodeChrome(event: string, slug: string, locale: Locale): Promise<EventEpisodeChrome> {
  const { events, playlists } = contentStore();
  const record = events.find((each) => each.slug === event);
  const playlist = playlists.find((each) => each.id === record?.playlist);
  if (record === undefined || playlist === undefined || !isEventSlug(event))
    throw new Error(`No Event "${event}" with a Playlist`);
  const t = await getTranslations({ locale, namespace: 'eventsPage' });
  const { title } = TRANSLATIONS[locale].eventsPage.items[event];
  const place = playlistPosition(playlist.episodes, slug);
  const crumbOf = (episode: string): Crumb => ({
    label: episodeCopy(episode, locale).title,
    route: eventEpisodeRoute(event, episode),
  });
  return {
    locale,
    breadcrumb: { breadcrumb: t('breadcrumb'), events: t('title') },
    event: { label: title, route: eventRoute(event), date: record.date },
    episode: episodeCopy(slug, locale).title,
    notice: { buildDay: BUILD_DAY, text: t('pastNotice') },
    position: t('position', { position: place.position, count: place.count }),
    nav: {
      label: t('playlistNav'),
      back: { label: t('backToEvent'), route: eventRoute(event) },
      ...(place.previous === undefined ? {} : { previous: { ...crumbOf(place.previous), cue: t('previous') } }),
      ...(place.next === undefined ? {} : { next: { ...crumbOf(place.next), cue: t('next') } }),
    },
  };
}

/** Above the Content area, so before the Title slide's `h1`: the breadcrumb ending in the Episode, then, for a past Event, the notice. */
export function EventEpisodeHeader({ chrome, className }: { chrome: EventEpisodeChrome; className?: string }) {
  return (
    <section
      aria-label={chrome.event.label}
      data-event-episode-header
      className={cn('flex flex-col gap-4 pt-6', className)}
    >
      <EventBreadcrumb
        locale={chrome.locale}
        labels={chrome.breadcrumb}
        event={chrome.event}
        episode={chrome.episode}
      />
      <PastNotice date={chrome.event.date} buildDay={chrome.notice.buildDay} text={chrome.notice.text} />
    </section>
  );
}

const STEP =
  'flex flex-col gap-0.5 rounded-sm text-body text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none';

type Walk = 'previous' | 'next';

/** One step of the walk: its cue ("Previous", "Next") with an arrow pointing the way, over the Episode's title. */
function WalkStep({ step, walk, locale }: { step: Crumb & { readonly cue: string }; walk: Walk; locale: Locale }) {
  const Arrow = walk === 'previous' ? ArrowLeft : ArrowRight;
  return (
    <Link
      {...{ [`data-playlist-${walk}`]: '' }}
      href={localizePath(step.route, locale)}
      className={cn(STEP, walk === 'next' && 'items-end')}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1 text-caption text-muted-foreground',
          walk === 'next' && 'flex-row-reverse',
        )}
      >
        <Arrow aria-hidden className="size-4" />
        {step.cue}
      </span>
      <span className="font-medium">{step.label}</span>
    </Link>
  );
}

/** After the Content area, so after the last Slide: the previous Episode, the way back to the Event, and the next Episode, each when there is one. */
export function PlaylistNav({ chrome, className }: { chrome: EventEpisodeChrome; className?: string }) {
  const { locale, nav } = chrome;
  return (
    <nav aria-label={nav.label} data-playlist-nav className={cn('grid grid-cols-3 items-start gap-4 py-10', className)}>
      <div>{nav.previous && <WalkStep step={nav.previous} walk="previous" locale={locale} />}</div>
      <div className="flex justify-center">
        <Link data-playlist-back href={localizePath(nav.back.route, locale)} className={cn(STEP, 'font-medium')}>
          {nav.back.label}
        </Link>
      </div>
      <div className="flex justify-end">{nav.next && <WalkStep step={nav.next} walk="next" locale={locale} />}</div>
    </nav>
  );
}
