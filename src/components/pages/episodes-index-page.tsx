import { EpisodeBrowse, type BrowseLabels } from '@/components/landing/episode-browse.client';
import { newestFirst } from '@/components/landing/episode-browse.pure';
import { cardLabels } from '@/components/landing/episode-card';
import { episodeCards } from '@/components/landing/episode-cards';
import { PAGE_CONTAINER, PageHeader } from '@/components/page-header';
import { localizePath, type Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';
import { GalleryHorizontalEnd, Layers, LayoutTemplate } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type LandingT = Awaited<ReturnType<typeof getTranslations<'landing'>>>;

function browseLabels(t: LandingT): BrowseLabels {
  return {
    ...cardLabels(t),
    search: t('episodeOverview.search'),
    searchPlaceholder: t('episodeOverview.searchPlaceholder'),
    conceptFilter: t('episodeOverview.conceptFilter'),
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

type PageT = Awaited<ReturnType<typeof getTranslations<'episodesPage'>>>;

const REFERENCE_LINK =
  'inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary';

/** The layout references are not content, so they sit under the browse grid: the page template, the Slide master, the Slides gallery. */
function ReferenceLinks({ locale, t }: { locale: Locale; t: PageT }) {
  const links = [
    { route: episodeRoute('page-template'), icon: Layers, label: t('references.pageTemplate') },
    { route: episodeRoute('slide-master'), icon: LayoutTemplate, label: t('references.slideMaster') },
    { route: episodeRoute('slides'), icon: GalleryHorizontalEnd, label: t('references.slides') },
  ];
  return (
    <nav
      aria-label={t('references.label')}
      data-reference-links
      className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/40 pt-6"
    >
      {links.map(({ route, icon: Icon, label }) => (
        <Link key={label} href={localizePath(route, locale)} className={REFERENCE_LINK}>
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

/**
 * The /episodes index page (FE-007 §1): lists every published Episode, and in dev mode
 * also lists in-progress staging Episodes as a GUI entry point (#85). The layout references close the page.
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
    <main data-testid="episodes-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={tPage('title')} intro={<p data-episodes-intro>{tPage('intro')}</p>} />
      <EpisodeBrowse cards={newestFirst(cards)} locale={locale} labels={browseLabels(tLanding)} headingLevel={2} />
      <ReferenceLinks locale={locale} t={tPage} />
    </main>
  );
}
