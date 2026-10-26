import { EventCardView } from '@/events/components/event-card';
import { eventCards } from '@/events/components/event-cards';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import type { Locale } from '@/shared/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/** The Events overview, the page at /events: a title with a one-line intro, then one card per Event whose Playlist is public. */
export async function EventsOverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'eventsPage' });
  const cards = await eventCards(locale, { listedOnly: true });
  return (
    <main data-testid="events-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={t('title')} intro={<p>{t('intro')}</p>} />
      <ul data-event-list className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.slug} className="flex">
            <EventCardView card={card} locale={locale} headingLevel={2} />
          </li>
        ))}
      </ul>
    </main>
  );
}
