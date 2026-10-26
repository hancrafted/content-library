import type { EventSlug } from '@/content-store/catalogue/routes';
import { findEvent, treatmentOf, type ServedEvent } from '@/content-store/store';
import { cardLabels, EpisodeCardView, type CardLabels } from '@/episodes/components/episode-card/episode-card';
import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import { episodeCardMaker } from '@/episodes/components/episode-card/episode-cards';
import { EventBreadcrumb } from '@/events/components/event-breadcrumb';
import { eventCardOf } from '@/events/components/event-cards';
import { PastNotice } from '@/events/components/past-notice';
import { PlaylistList, type PlaylistEntry } from '@/events/components/playlist-list';
import type { EventCard } from '@/events/lib/event-card.pure';
import { eventPlaylistCards, startOf, totalMinutes } from '@/events/lib/event-playlist.pure';
import { EVENT_WORDS, eventCopy } from '@/events/lib/event-words';
import { BUILD_DAY } from '@/page-assembly/lib/build-day';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import { Button } from '@/shared/components/ui/button';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { ArrowRight, CalendarDays, Clock, Layers, MapPin, Presentation, Users, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * An Event page's title and description in one locale, for its metadata, with its treatment: an Event whose Playlist
 * is unlisted is `noindex` and out of the sitemap.
 */
export function eventPageCopy(slug: EventSlug, locale: Locale): PageCopy {
  const { title, description } = eventCopy(slug, locale);
  return { title, description, treatment: treatmentOf({ kind: 'event', event: slug }) };
}

type EventT = Awaited<ReturnType<typeof getTranslations<'eventPage'>>>;

function Fact({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2">
      <Icon aria-hidden className="size-4 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

/** The day as the reader's locale writes it, with the start time when the Event has one. */
function DateFact({ card }: { card: EventCard }) {
  return (
    <Fact icon={CalendarDays}>
      <time data-event-date dateTime={card.date}>
        {card.dateLabel}
      </time>
      {card.time !== undefined && <span data-event-time> · {card.time}</span>}
    </Fact>
  );
}

interface FactsProps {
  card: EventCard;
  record: ServedEvent;
  minutes: number | undefined;
  t: EventT;
}

/**
 * The one facts line: the kind, the date with the time when the Event has one, the place when it has one, the
 * Audience, the Episode count, and the reading time when one is counted.
 */
function Facts({ card, record, minutes, t }: FactsProps) {
  return (
    <ul data-event-facts className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-body text-muted-foreground">
      <Fact icon={Presentation}>
        <span data-event-kind>{t(`kinds.${record.kind}`)}</span>
      </Fact>
      <DateFact card={card} />
      {card.location !== undefined && (
        <Fact icon={MapPin}>
          <span data-event-location>{card.location}</span>
        </Fact>
      )}
      <Fact icon={Users}>
        <span data-event-audience>{t(`audiences.${record.audience}`)}</span>
      </Fact>
      <Fact icon={Layers}>
        <span data-event-episode-count>{card.episodeCountLabel}</span>
      </Fact>
      {minutes !== undefined && (
        <Fact icon={Clock}>
          <span data-event-reading-time>{fillTemplate(t.raw('readingTime') as string, { minutes })}</span>
        </Fact>
      )}
    </ul>
  );
}

/** The primary button, to the first Episode a visitor can open, under the Event; absent while every one is upcoming. */
function StartButton({ start, locale, t }: { start: ReturnType<typeof startOf>; locale: Locale; t: EventT }) {
  if (start === undefined || start.card.route === null) return null;
  return (
    <Button asChild className="mt-8 h-11 rounded-full px-6 font-semibold">
      <Link data-event-start href={localizePath(start.card.route, locale)}>
        {fillTemplate(t.raw('start') as string, { step: start.step })}
        <ArrowRight aria-hidden />
      </Link>
    </Button>
  );
}

/** The Playlist's Episodes as entries of the Playlist list, each card a compact Episode card built here. */
function playlistEntries(cards: readonly EpisodeCard[], locale: Locale, labels: CardLabels): PlaylistEntry[] {
  return cards.map((card) => ({
    key: card.slug,
    linked: card.route !== null,
    card: (className: string) => (
      <EpisodeCardView
        card={card}
        variant="compact"
        headingLevel={3}
        locale={locale}
        labels={labels}
        showFormat={false}
        className={className}
      />
    ),
  }));
}

/**
 * An Event's own page, in one column (design-ADR 0016, Routes and visibility): breadcrumb, title, the facts line, the
 * description, for a past Event the notice, the Start button, then the Episodes its Playlist presents as a numbered
 * list of compact cards, the first emphasised, each opening its Episode under the Event.
 */
export async function EventPage({ slug, locale }: { slug: string; locale: Locale }) {
  const record = findEvent(slug);
  if (record === undefined) notFound();
  const t = await getTranslations({ locale, namespace: 'eventPage' });
  const browser = await getTranslations({ locale, namespace: 'episodeBrowser' });
  const words = EVENT_WORDS[locale];
  const card = await eventCardOf(record, locale);
  const episodes = eventPlaylistCards(record, await episodeCardMaker(locale), locale);
  return (
    <main data-testid="event-page" className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <EventBreadcrumb locale={locale} labels={words.breadcrumb} event={{ slug: record.slug, title: card.title }} />
      <h1 className="mt-6 text-heading font-semibold text-balance text-foreground">{card.title}</h1>
      <Facts card={card} record={record} minutes={totalMinutes(episodes)} t={t} />
      <p className="mt-6 max-w-2xl text-body text-pretty text-foreground">{card.description}</p>
      <PastNotice date={record.date} buildDay={BUILD_DAY} text={words.pastNotice} className="mt-8" />
      <StartButton start={startOf(episodes)} locale={locale} t={t} />
      <PlaylistList entries={playlistEntries(episodes, locale, cardLabels(browser))} title={t('playlist')} />
    </main>
  );
}
