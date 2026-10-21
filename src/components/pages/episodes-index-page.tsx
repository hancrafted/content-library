import { EpisodeBrowse, type BrowseLabels } from '@/components/landing/episode-browse.client';
import { episodeCards } from '@/components/landing/episode-cards';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';
import { Layers, LayoutTemplate } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type LandingT = Awaited<ReturnType<typeof getTranslations<'landing'>>>;

function browseLabels(t: LandingT): BrowseLabels {
  return {
    open: t('episodeOverview.open'),
    comingSoon: t('episodeOverview.comingSoon'),
    watchVideo: t('episodeOverview.watchVideo'),
    newTab: t('episodeOverview.newTab'),
    search: t('episodeOverview.search'),
    searchPlaceholder: t('episodeOverview.searchPlaceholder'),
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

const REFERENCE_LINK =
  'inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary';

/** The layout references are not content, so they sit outside the Episode browse: plain links at the page's foot. */
function ReferenceLinks({ locale, t }: { locale: Locale; t: LandingT }) {
  return (
    <nav className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/40 pt-6">
      <Link
        href={localizePath(episodeRoute('page-template'), locale)}
        data-testid="episodes-page-link"
        className={REFERENCE_LINK}
      >
        <Layers className="h-3.5 w-3.5" />
        <span>{t('templateTitle')}</span>
      </Link>
      <Link
        href={localizePath(episodeRoute('slide-master'), locale)}
        data-testid="episodes-slide-master-link"
        className={REFERENCE_LINK}
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
        <span>{t('slideMasterTitle')}</span>
      </Link>
    </nav>
  );
}

/** Dev only: the Shared visuals' Presets, for the Section jobs that place them. `next build` drops the import. */
async function DevSharedVisuals({ locale }: { locale: Locale }) {
  if (process.env.NODE_ENV !== 'development') return null;
  const { ContextGallery } = await import('@/components/slide-shared/context/context-gallery');
  return <ContextGallery locale={locale} />;
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
    <main data-testid="episodes-index-page" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <h1 className="sr-only">{tPage('title')}</h1>
      <EpisodeBrowse cards={cards} locale={locale} labels={browseLabels(tLanding)} />
      <ReferenceLinks locale={locale} t={tLanding} />
      <DevSharedVisuals locale={locale} />
    </main>
  );
}
