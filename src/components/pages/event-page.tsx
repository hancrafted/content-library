import { contentStore } from '@/components/episodes/content-store';
import { eventFacts } from '@/components/episodes/page-facts';
import { EventBreadcrumb } from '@/components/events/event-breadcrumb';
import { PastNotice } from '@/components/events/past-notice';
import { cardLabels, EpisodeCardView, type CardLabels } from '@/components/landing/episode-card';
import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { playlistCards } from '@/components/landing/episode-cards';
import type { EventCard } from '@/components/landing/event-card.pure';
import { eventCards } from '@/components/landing/event-cards';
import { startOf, totalMinutes } from '@/components/landing/event-playlist.pure';
import { Button } from '@/components/ui/button';
import { TRANSLATIONS } from '@/i18n/translations';
import { BUILD_DAY } from '@/lib/build-day';
import type { EventRecord, EventSlug } from '@/lib/events.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import type { PageCopy } from '@/lib/page-metadata.pure';
import { playlistChip, type PlaylistChip } from '@/lib/playlists.pure';
import { eventEpisodeRoute, eventRoute } from '@/lib/routes';
import { fillTemplate } from '@/lib/template.pure';
import { ArrowRight, CalendarDays, Clock, Layers, MapPin, Presentation, Users, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

/** An Event page's title and description in one locale, and its Playlist's visibility, for its metadata. */
export function eventPageCopy(slug: EventSlug, locale: Locale): PageCopy {
  const { title, description } = TRANSLATIONS[locale].eventsPage.items[slug];
  return { title, description, facts: eventFacts(slug) };
}

type EventT = Awaited<ReturnType<typeof getTranslations<'eventsPage'>>>;
function Fact({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2">
      <Icon aria-hidden className="size-4 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

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
  record: EventRecord;
  minutes: number | undefined;
  t: EventT;
}

/**
 * The one facts line: the kind, the date, then the time and place when the Event has them, the Audience, the Episode
 * count, and the reading time when one is counted.
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

/** The primary button, to the first Episode a visitor can open; absent while every Episode is still upcoming. */
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

interface AgendaProps {
  cards: readonly EpisodeCard[];
  /** Each card's chip, in the cards' order: the event-frame Episode's and any unlisted one's. */
  chips: readonly (PlaylistChip | undefined)[];
  locale: Locale;
  labels: CardLabels;
  t: EventT;
}

function StepNumber({ step, muted }: { step: number; muted: boolean }) {
  return (
    <span
      aria-hidden
      data-step-number
      className={`w-10 shrink-0 text-subheading font-semibold tabular-nums sm:w-14 ${muted ? 'text-muted-foreground' : 'text-primary'}`}
    >
      {step}
    </span>
  );
}

interface AgendaStepProps {
  card: EpisodeCard;
  step: number;
  chip: PlaylistChip | undefined;
  chipLabel: string | undefined;
  locale: Locale;
  labels: CardLabels;
}

/** One Playlist entry: its step number and its card, the event-frame Episode shaded as a band. */
function AgendaStep({ card, step, chip, chipLabel, locale, labels }: AgendaStepProps) {
  const band = chip === 'event-frame';
  return (
    <li
      data-agenda-step
      {...(band ? { 'data-event-frame': '' } : {})}
      className={`flex items-start gap-4 sm:gap-6 ${band ? '-mx-3 rounded-2xl bg-muted p-3' : ''}`}
    >
      <StepNumber step={step} muted={card.route === null} />
      <EpisodeCardView
        card={card}
        variant="compact"
        headingLevel={3}
        locale={locale}
        labels={labels}
        showFormat={false}
        className="min-w-0 flex-1"
        {...(chipLabel === undefined ? {} : { chip: chipLabel })}
      />
    </li>
  );
}

/**
 * The Episodes in the order the Event's Playlist presents them, the event-frame Episode first; the step number is
 * text beside the card, the list itself says the order.
 */
function Agenda({ cards, chips, locale, labels, t }: AgendaProps) {
  const chipLabels: Record<PlaylistChip, string> = {
    'event-frame': t('chips.event-frame'),
    unlisted: t('chips.unlisted'),
  };
  return (
    <section aria-labelledby="event-playlist" className="mt-14">
      <h2 id="event-playlist" className="text-subheading font-semibold text-foreground">
        {t('playlist')}
      </h2>
      <ol data-event-playlist role="list" className="mt-6 space-y-4">
        {cards.map((card, index) => {
          const chip = chips[index];
          const chipLabel = chip === undefined ? undefined : chipLabels[chip];
          const step = { card, step: index + 1, chip, chipLabel, locale, labels };
          return <AgendaStep key={card.slug} {...step} />;
        })}
      </ol>
    </section>
  );
}

/** Each Playlist entry's chip, read from its Episode's type and visibility. */
function chipsOf(slugs: readonly string[]): (PlaylistChip | undefined)[] {
  const { episodes } = contentStore();
  return slugs.map((slug) => {
    const episode = episodes.find((each) => each.slug === slug);
    return episode === undefined ? undefined : playlistChip(episode);
  });
}

/**
 * An Event's own page, in one column (design-ADR 0016, Event page behaviour): breadcrumb, title, the facts line, the
 * description, for a past Event the notice, a start button, then the Episodes its Playlist presents as a numbered
 * list of compact cards, each linking to its page under the Event.
 */
export async function EventPage({ slug, locale }: { slug: string; locale: Locale }) {
  const { events, playlists } = contentStore();
  const record = events.find((event) => event.slug === slug);
  const playlist = playlists.find((each) => each.id === record?.playlist);
  if (record === undefined || playlist === undefined) notFound();
  const t = await getTranslations({ locale, namespace: 'eventsPage' });
  const landing = await getTranslations({ locale, namespace: 'landing' });
  const card = (await eventCards(locale)).find((each) => each.slug === slug);
  if (card === undefined) notFound();
  const episodes = await playlistCards(locale, playlist.episodes, (episode) => eventEpisodeRoute(slug, episode));
  return (
    <main data-testid="event-page" className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <EventBreadcrumb
        locale={locale}
        labels={{ breadcrumb: t('breadcrumb'), events: t('title') }}
        event={{ label: card.title, route: eventRoute(slug) }}
      />
      <h1 className="mt-6 text-heading font-semibold text-foreground">{card.title}</h1>
      <Facts card={card} record={record} minutes={totalMinutes(episodes)} t={t} />
      <p className="mt-6 max-w-2xl text-body text-foreground">{card.description}</p>
      <PastNotice date={record.date} buildDay={BUILD_DAY} text={t('pastNotice')} className="mt-6" />
      <StartButton start={startOf(episodes)} locale={locale} t={t} />
      <Agenda cards={episodes} chips={chipsOf(playlist.episodes)} locale={locale} labels={cardLabels(landing)} t={t} />
    </main>
  );
}
