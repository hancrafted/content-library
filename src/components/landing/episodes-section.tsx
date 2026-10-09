import { LiquidInkTransition } from '@/components/animations/liquid-ink-transition.client';
import { EpisodeBrowse, type BrowseLabels } from '@/components/landing/episode-browse.client';
import { episodeCards } from '@/components/landing/episode-cards';
import type { CardLabels } from '@/components/landing/episode-grid-card';
import { EpisodeSpotlight } from '@/components/landing/episode-spotlight';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';
import { Layers } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type LandingT = Awaited<ReturnType<typeof getTranslations<'landing'>>>;

function cardLabels(t: LandingT): CardLabels {
  return {
    open: t('episodeIndex.open'),
    comingSoon: t('episodeIndex.comingSoon'),
    minutesUnit: t('episodeIndex.minutesUnit'),
  };
}

/** `{count}` stays in the raw message: the leaf fills it as the match count changes. */
function browseLabels(t: LandingT): BrowseLabels {
  return {
    ...cardLabels(t),
    topicFilter: t('episodeIndex.topicFilter'),
    formatFilter: t('episodeIndex.formatFilter'),
    all: t('episodeIndex.all'),
    showAll: t.raw('episodeIndex.showAll') as string,
    showFewer: t('episodeIndex.showFewer'),
    results: {
      none: t('episodeIndex.results.none'),
      one: t('episodeIndex.results.one'),
      other: t.raw('episodeIndex.results.other') as string,
    },
    empty: t('episodeIndex.empty'),
    reset: t('episodeIndex.reset'),
  };
}

function EpisodesHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h2>
      <p className="text-base text-muted-foreground sm:text-lg">{subtitle}</p>
    </div>
  );
}

/** A small mono heading with a hairline running out to the edge: names a part of the section without competing with its h2. */
function PartHeading({ children }: { children: string }) {
  return (
    <h3 className="mb-6 flex items-center gap-4 font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
      <span>{children}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </h3>
  );
}

/** The layout reference is not content, so it sits outside the index: a plain link under the cards. */
function TemplateLink({ locale, t }: { locale: Locale; t: LandingT }) {
  return (
    <Link
      href={localizePath(episodeRoute('page-template'), locale)}
      data-testid="landing-page-link"
      className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
    >
      <Layers className="h-3.5 w-3.5" />
      <span>{t('templateTitle')}</span>
    </Link>
  );
}

/**
 * The landing's Episodes section in two parts: a Spotlight of the hottest
 * published Episodes to click straight into, then Browse, every Episode behind
 * Topic and Format filters.
 */
export async function EpisodesSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing' });
  const cards = await episodeCards(locale);
  return (
    <section id="episodes" className="relative">
      <div className="mx-auto max-w-6xl space-y-16 px-6 py-24 sm:py-32">
        <EpisodesHeader title={t('episodesSectionTitle')} subtitle={t('episodesSectionSubtitle')} />
        <div>
          <PartHeading>{t('episodeIndex.spotlightTitle')}</PartHeading>
          <EpisodeSpotlight cards={cards} locale={locale} labels={cardLabels(t)} />
        </div>
        <div>
          <PartHeading>{t('episodeIndex.browseTitle')}</PartHeading>
          <EpisodeBrowse cards={cards} locale={locale} labels={browseLabels(t)} />
        </div>
        <TemplateLink locale={locale} t={t} />
      </div>
      <LiquidInkTransition targetId="services" />
    </section>
  );
}
