import { WorkshopCardView } from '@/components/landing/workshop-card';
import { workshopCards } from '@/components/landing/workshop-cards';
import { PAGE_CONTAINER, PageHeader } from '@/components/page-header';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/** The /workshops page: a title with a one-line intro, then one card per Workshop. */
export async function WorkshopsIndexPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'workshopsPage' });
  const cards = await workshopCards(locale);
  return (
    <main data-testid="workshops-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={t('title')} intro={<p>{t('intro')}</p>} />
      <ul data-workshop-list className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.slug} className="flex">
            <WorkshopCardView card={card} locale={locale} headingLevel={2} />
          </li>
        ))}
      </ul>
    </main>
  );
}
