import { EpisodeBrowse, type BrowseLabels } from '@/components/landing/episode-browse.client';
import { episodeCards } from '@/components/landing/episode-cards';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

type LandingT = Awaited<ReturnType<typeof getTranslations<'landing'>>>;

function browseLabels(t: LandingT): BrowseLabels {
  return {
    open: t('episodeOverview.open'),
    comingSoon: t('episodeOverview.comingSoon'),
    minutesUnit: t('episodeOverview.minutesUnit'),
    topicFilter: t('episodeOverview.topicFilter'),
    formatFilter: t('episodeOverview.formatFilter'),
    all: t('episodeOverview.all'),
    showAll: t.raw('episodeOverview.showAll') as string,
    showFewer: t('episodeOverview.showFewer'),
    results: {
      none: t('episodeOverview.results.none'),
      one: t('episodeOverview.results.one'),
      other: t.raw('episodeOverview.results.other') as string,
    },
    empty: t('episodeOverview.empty'),
    reset: t('episodeOverview.reset'),
  };
}

/**
 * The /episodes index page (FE-007 §1): lists every published Episode, and in dev mode
 * also lists in-progress staging Episodes as a GUI entry point (#85).
 */
export async function EpisodesIndexPage({ locale }: { locale: Locale }) {
  const isDev = process.env.NODE_ENV === 'development';
  const tLanding = await getTranslations({ locale, namespace: 'landing' });
  const tPage = await getTranslations({ locale, namespace: 'episodesPage' });
  const cards = await episodeCards(locale, {
    includeDrafts: isDev,
    linkDrafts: isDev,
  });

  return (
    <main data-testid="episodes-index-page" className="mx-auto max-w-6xl space-y-12 px-6 py-16 sm:py-24">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-heading font-semibold tracking-tight text-foreground">{tPage('title')}</h1>
        <p className="text-subheading text-muted-foreground">{tPage('subtitle')}</p>
      </div>
      <div>
        <EpisodeBrowse cards={cards} locale={locale} labels={browseLabels(tLanding)} />
      </div>
    </main>
  );
}
