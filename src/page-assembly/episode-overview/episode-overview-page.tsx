import { EpisodeBrowser, type BrowseLabels } from '@/episodes/components/episode-browser/episode-browser.client';
import { newestFirst } from '@/episodes/components/episode-browser/episode-browser.pure';
import { cardLabels } from '@/episodes/components/episode-card/episode-card';
import { episodeCards } from '@/episodes/components/episode-card/episode-cards';
import { upcomingListed } from '@/page-assembly/lib/upcoming-listing.pure';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import { Layers } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type BrowserT = Awaited<ReturnType<typeof getTranslations<'episodeBrowser'>>>;

function browseLabels(t: BrowserT): BrowseLabels {
  return {
    ...cardLabels(t),
    search: t('search'),
    searchPlaceholder: t('searchPlaceholder'),
    tagFilter: t('tagFilter'),
    showAll: t.raw('showAll') as string,
    showFewer: t('showFewer'),
    results: { none: t('results.none'), one: t('results.one'), other: t.raw('results.other') as string },
    empty: t('empty'),
    reset: t('reset'),
  };
}

type PageT = Awaited<ReturnType<typeof getTranslations<'episodesPage'>>>;

const REFERENCE_LINK =
  'inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary';

function ReferenceLinks({ locale, t }: { locale: Locale; t: PageT }) {
  return (
    <nav
      aria-label={t('references.label')}
      data-reference-links
      className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/40 pt-6"
    >
      <Link href={localizePath(ROUTES.resources, locale)} className={REFERENCE_LINK}>
        <Layers className="h-3.5 w-3.5" />
        <span>{t('references.resources')}</span>
      </Link>
    </nav>
  );
}

// decision: FE-007 §1
export async function EpisodeOverviewPage({ locale }: { locale: Locale }) {
  const listUpcoming = upcomingListed(process.env);
  const tBrowser = await getTranslations({ locale, namespace: 'episodeBrowser' });
  const tPage = await getTranslations({ locale, namespace: 'episodesPage' });
  const cards = await episodeCards(locale, { includeDrafts: listUpcoming, linkDrafts: listUpcoming });

  return (
    <main data-testid="episodes-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={tPage('title')} intro={<p data-episodes-intro>{tPage('intro')}</p>} />
      <EpisodeBrowser cards={newestFirst(cards)} locale={locale} labels={browseLabels(tBrowser)} headingLevel={2} />
      <ReferenceLinks locale={locale} t={tPage} />
    </main>
  );
}
