import { contentStore } from '@/components/episodes/content-store';
import { cardLabels, EpisodeCardView, type CardLabels } from '@/components/landing/episode-card';
import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { playlistCards } from '@/components/landing/episode-cards';
import type { EventCard } from '@/components/landing/event-card.pure';
import { eventCards } from '@/components/landing/event-cards';
import { startOf, totalMinutes } from '@/components/landing/event-playlist.pure';
import { Button } from '@/components/ui/button';
import { TRANSLATIONS } from '@/i18n/translations';
import type { EventSlug } from '@/lib/events.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { eventEpisodeRoute, ROUTES } from '@/lib/routes';
import { fillTemplate } from '@/lib/template.pure';
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Layers, MapPin, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

/** An Event page's title and description in one locale, for its metadata. */
export function eventPageCopy(slug: EventSlug, locale: Locale) {
  return TRANSLATIONS[locale].eventsPage.items[slug];
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

/** The when, where and how much: the date first, then the time and place when the Event has them, the Episode count, and the reading time when one is counted. */
function Facts({ card, minutes, t }: { card: EventCard; minutes: number | undefined; t: EventT }) {
  return (
    <ul data-event-facts className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-body text-muted-foreground">
      <Fact icon={CalendarDays}>
        <time data-event-date dateTime={card.date}>
          {card.dateLabel}
        </time>
        {card.time !== undefined && <span data-event-time> · {card.time}</span>}
      </Fact>
      {card.location !== undefined && (
        <Fact icon={MapPin}>
          <span data-event-location>{card.location}</span>
        </Fact>
      )}
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
  locale: Locale;
  labels: CardLabels;
  title: string;
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

/** The Episodes in the order the Event's Playlist presents them, the event-frame Episode first; the step number is text beside the card, the list itself says the order. */
function Agenda({ cards, locale, labels, title }: AgendaProps) {
  return (
    <section aria-labelledby="event-playlist" className="mt-14">
      <h2 id="event-playlist" className="text-subheading font-semibold text-foreground">
        {title}
      </h2>
      <ol data-event-playlist role="list" className="mt-6 space-y-4">
        {cards.map((card, index) => (
          <li key={card.slug} data-agenda-step className="flex items-start gap-4 sm:gap-6">
            <StepNumber step={index + 1} muted={card.route === null} />
            <EpisodeCardView
              card={card}
              variant="compact"
              headingLevel={3}
              locale={locale}
              labels={labels}
              showFormat={false}
              className="min-w-0 flex-1"
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * An Event's own page, in one column: back link, title, the facts, the description and a start button, then the
 * Episodes its Playlist presents as a numbered list of compact cards, each linking to its page under the Event.
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
      <Link
        href={localizePath(ROUTES.events, locale)}
        className="inline-flex items-center gap-2 rounded-sm text-caption font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t('back')}
      </Link>
      <h1 className="mt-6 text-heading font-semibold text-foreground">{card.title}</h1>
      <Facts card={card} minutes={totalMinutes(episodes)} t={t} />
      <p className="mt-6 max-w-2xl text-body text-foreground">{card.description}</p>
      <StartButton start={startOf(episodes)} locale={locale} t={t} />
      <Agenda cards={episodes} locale={locale} labels={cardLabels(landing)} title={t('playlist')} />
    </main>
  );
}
