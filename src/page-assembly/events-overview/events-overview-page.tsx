import { TAG_IDS } from '@/content-store/schemas/fields';
import { EventBrowser } from '@/events/components/event-browser.client';
import { eventCards } from '@/events/components/event-cards';
import { BUILD_DAY } from '@/page-assembly/lib/build-day';
import { PAGE_WORDS } from '@/page-assembly/lib/page-words';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import type { Locale } from '@/shared/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

// decision: docs/adr/0018-events-overview.md
export async function EventsOverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'eventsOverview' });
  const cards = eventCards(locale, PAGE_WORDS[locale].tags, { listedOnly: true });
  const labels = {
    upcoming: t('upcoming'),
    past: t('past'),
    noUpcoming: t('noUpcoming'),
    noPast: t('noPast'),
    noMatch: t('noMatch'),
    search: t('search'),
    searchPlaceholder: t('searchPlaceholder'),
    tagFilter: t('tagFilter'),
    view: t('view'),
    grid: t('grid'),
    list: t('list'),
    reset: t('reset'),
    open: t('open'),
  };
  return (
    <main data-testid="events-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={t('title')} intro={<p>{t('intro')}</p>} />
      <EventBrowser cards={cards} vocabulary={TAG_IDS} buildDay={BUILD_DAY} locale={locale} labels={labels} />
    </main>
  );
}
