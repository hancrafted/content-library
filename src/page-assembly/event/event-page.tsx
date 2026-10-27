import type { EventSlug } from '@/content-store/catalogue/record-routes';
import { findEvent, listedEpisodes, treatmentOf, type ServedEvent } from '@/content-store/store';
import { cardLabels, EpisodeCardView, type CardLabels } from '@/episodes/components/episode-card/episode-card';
import type { EpisodeCard } from '@/episodes/components/episode-card/episode-card.pure';
import { episodeCardMaker } from '@/episodes/components/episode-card/episode-cards';
import { EventBreadcrumb } from '@/events/components/event-breadcrumb';
import { PastNotice } from '@/events/components/past-notice';
import { PlaylistList, type PlaylistEntry } from '@/events/components/playlist-list';
import { eventCard, type EventCard } from '@/events/lib/event-card.pure';
import { eventPlaylistCards, startOf } from '@/events/lib/event-playlist.pure';
import { EVENT_WORDS, eventCopy } from '@/events/lib/event-words';
import { relatedEpisodes } from '@/events/lib/related-episodes.pure';
import { BUILD_DAY } from '@/page-assembly/lib/build-day';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import { PAGE_WORDS } from '@/page-assembly/lib/page-words';
import { PAGE_CONTAINER } from '@/shared/components/page-header';
import { Button } from '@/shared/components/ui/button';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { cn } from '@/shared/lib/utils';
import { ArrowRight, CalendarDays, Layers, MapPin, Presentation, Users, Video, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { RelatedEpisodes } from './event-related';
import { SidePanelBottom, SidePanelTop } from './event-side-panel';
import type { EventT } from './event-translator';

/**
 * An Event page's title and description in one locale, for its metadata, with its treatment: an Event whose Playlist
 * is unlisted is `noindex` and out of the sitemap.
 */
export function eventPageCopy(slug: EventSlug, locale: Locale): PageCopy {
  const { title, description } = eventCopy(slug, locale);
  return { title, description, treatment: treatmentOf({ kind: 'event', event: slug }) };
}

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
  t: EventT;
}

/**
 * The facts, stacked in the side panel: the kind, the date with the time when the Event has one, where it takes
 * place, the Audience and the Episode count.
 */
function Facts({ card, record, t }: FactsProps) {
  return (
    <ul data-event-facts className="flex flex-col gap-2 text-body text-muted-foreground">
      <Fact icon={Presentation}>
        <span data-event-kind>{t(`kinds.${record.kind}`)}</span>
      </Fact>
      <DateFact card={card} />
      <Fact icon={card.place.format === 'remote' ? Video : MapPin}>
        <span data-event-place={card.place.format}>{card.place.label}</span>
      </Fact>
      <Fact icon={Users}>
        <span data-event-audience>{t(`audiences.${record.audience}`)}</span>
      </Fact>
      <Fact icon={Layers}>
        <span data-event-episode-count>{card.episodeCountLabel}</span>
      </Fact>
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

interface MainColumnProps {
  card: EventCard;
  record: ServedEvent;
  episodes: readonly EpisodeCard[];
  entries: readonly PlaylistEntry[];
  related: ReactNode;
  locale: Locale;
  t: EventT;
}

/** The main column: the description, the past notice, the Start button, the Playlist and the related Episodes. */
function MainColumn({ card, record, episodes, entries, related, locale, t }: MainColumnProps) {
  return (
    <div className="lg:col-start-1 lg:row-span-2 lg:row-start-2">
      <p className="mt-8 max-w-prose text-body text-pretty text-foreground lg:mt-6">{card.description}</p>
      <PastNotice date={record.date} buildDay={BUILD_DAY} text={EVENT_WORDS[locale].pastNotice} className="mt-8" />
      <StartButton start={startOf(episodes)} locale={locale} t={t} />
      <PlaylistList entries={entries} title={t('playlist')} />
      {related}
    </div>
  );
}

interface LayoutProps extends Omit<MainColumnProps, 'related' | 'entries'> {
  main: Pick<MainColumnProps, 'entries' | 'related'>;
}

/** The page's two-column frame: the title, the side panel's top, the main column and the side panel's rest. */
function EventLayout({ main, ...column }: LayoutProps) {
  const { card, record, locale, t } = column;
  return (
    <main
      data-testid="event-page"
      className={cn(
        PAGE_CONTAINER,
        'lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_auto_1fr] lg:items-start lg:gap-x-12',
      )}
    >
      <header className="lg:col-start-1 lg:row-start-1">
        <EventBreadcrumb
          locale={locale}
          labels={EVENT_WORDS[locale].breadcrumb}
          event={{ slug: record.slug, title: card.title }}
        />
        <h1 className="mt-6 text-heading font-semibold text-balance text-foreground">{card.title}</h1>
      </header>
      <SidePanelTop record={record} t={t} facts={<Facts card={card} record={record} t={t} />} />
      <MainColumn {...column} {...main} />
      <SidePanelBottom record={record} t={t} />
    </main>
  );
}

/**
 * An Event's own page, (design-ADR 0016, Routes and visibility): two columns from `lg`. The main column holds the
 * breadcrumb, title, description, for a past Event the notice, the Start button, the Episodes its Playlist presents
 * as a numbered list of compact cards, and other Episodes to watch. The side panel holds the image, the facts, the
 * Organizers, the listing and the references. Every part sits once in the DOM, in the order a screen reader and the
 * stacked page read it: the image and facts right after the title, the Organizers, listing and references after the
 * main column. The grid only places those two groups in the second column; nothing is reordered visually.
 */
export async function EventPage({ slug, locale }: { slug: string; locale: Locale }) {
  const record = findEvent(slug);
  if (record === undefined) notFound();
  const t = await getTranslations({ locale, namespace: 'eventPage' });
  const labels = cardLabels(await getTranslations({ locale, namespace: 'episodeBrowser' }));
  const card = eventCard(record, locale, PAGE_WORDS[locale].tags);
  const makeCard = await episodeCardMaker(locale);
  const episodes = eventPlaylistCards(record, makeCard, locale);
  const related = relatedEpisodes(record, listedEpisodes()).map(makeCard);
  const main = {
    entries: playlistEntries(episodes, locale, labels),
    related: <RelatedEpisodes cards={related} locale={locale} labels={labels} t={t} />,
  };
  return <EventLayout main={main} card={card} record={record} episodes={episodes} locale={locale} t={t} />;
}
