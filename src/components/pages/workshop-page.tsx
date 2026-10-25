import { contentStore } from '@/components/episodes/content-store';
import { cardLabels, EpisodeCardView, type CardLabels } from '@/components/landing/episode-card';
import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { episodeCards } from '@/components/landing/episode-cards';
import { agendaOf, startOf, totalMinutes } from '@/components/landing/workshop-agenda.pure';
import type { WorkshopCard } from '@/components/landing/workshop-card.pure';
import { workshopCards } from '@/components/landing/workshop-cards';
import { Button } from '@/components/ui/button';
import { TRANSLATIONS } from '@/i18n/translations';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { ROUTES } from '@/lib/routes';
import { fillTemplate } from '@/lib/template.pure';
import { type WorkshopSlug } from '@/lib/workshops.pure';
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Layers, MapPin, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

/** A Workshop page's title and description in one locale, for its metadata. */
export function workshopPageCopy(slug: WorkshopSlug, locale: Locale) {
  return TRANSLATIONS[locale].workshopsPage.items[slug];
}

type WorkshopT = Awaited<ReturnType<typeof getTranslations<'workshopsPage'>>>;
function Fact({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2">
      <Icon aria-hidden className="size-4 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

/** The when, where and how much: the date first, then the time and place when the Workshop has them, the Episode count, and the reading time when one is counted. */
function Facts({ card, minutes, t }: { card: WorkshopCard; minutes: number | undefined; t: WorkshopT }) {
  return (
    <ul data-workshop-facts className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-body text-muted-foreground">
      <Fact icon={CalendarDays}>
        <time data-workshop-date dateTime={card.date}>
          {card.dateLabel}
        </time>
        {card.time !== undefined && <span data-workshop-time> · {card.time}</span>}
      </Fact>
      {card.location !== undefined && (
        <Fact icon={MapPin}>
          <span data-workshop-location>{card.location}</span>
        </Fact>
      )}
      <Fact icon={Layers}>
        <span data-workshop-episode-count>{card.episodeCountLabel}</span>
      </Fact>
      {minutes !== undefined && (
        <Fact icon={Clock}>
          <span data-workshop-reading-time>{fillTemplate(t.raw('readingTime') as string, { minutes })}</span>
        </Fact>
      )}
    </ul>
  );
}

/** The primary button, to the first Episode a visitor can open; absent while every Episode is still upcoming. */
function StartButton({ start, locale, t }: { start: ReturnType<typeof startOf>; locale: Locale; t: WorkshopT }) {
  if (start === undefined || start.card.route === null) return null;
  return (
    <Button asChild className="mt-8 h-11 rounded-full px-6 font-semibold">
      <Link data-workshop-start href={localizePath(start.card.route, locale)}>
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

/** The Episodes in the order the Workshop teaches them; the step number is text beside the card, the list itself says the order. */
function Agenda({ cards, locale, labels, title }: AgendaProps) {
  return (
    <section aria-labelledby="workshop-agenda" className="mt-14">
      <h2 id="workshop-agenda" className="text-subheading font-semibold text-foreground">
        {title}
      </h2>
      <ol data-workshop-agenda role="list" className="mt-6 space-y-4">
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
 * A Workshop's own page, a simple event overview in one column: back link, title, the facts, the
 * description and a start button, then the Workshop's Episodes as a numbered list of compact cards.
 */
export async function WorkshopPage({ slug, locale }: { slug: string; locale: Locale }) {
  const record = contentStore().workshops.find((workshop) => workshop.slug === slug);
  if (record === undefined) notFound();
  const t = await getTranslations({ locale, namespace: 'workshopsPage' });
  const landing = await getTranslations({ locale, namespace: 'landing' });
  const card = (await workshopCards(locale)).find((each) => each.slug === slug);
  if (card === undefined) notFound();
  const episodes = agendaOf(record.episodes, await episodeCards(locale));
  return (
    <main data-testid="workshop-page" className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <Link
        href={localizePath(ROUTES.workshops, locale)}
        className="inline-flex items-center gap-2 rounded-sm text-caption font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:outline-none"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t('back')}
      </Link>
      <h1 className="mt-6 text-heading font-semibold text-foreground">{card.title}</h1>
      <Facts card={card} minutes={totalMinutes(episodes)} t={t} />
      <p className="mt-6 max-w-2xl text-body text-foreground">{card.description}</p>
      <StartButton start={startOf(episodes)} locale={locale} t={t} />
      <Agenda cards={episodes} locale={locale} labels={cardLabels(landing)} title={t('agenda')} />
    </main>
  );
}
