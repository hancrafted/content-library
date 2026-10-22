import { WorkshopCardView } from '@/components/landing/workshop-card';
import { workshopCards } from '@/components/landing/workshop-cards';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/** The /workshops page: a title with a one-line intro, then one card per Workshop. */
export async function WorkshopsIndexPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'workshopsPage' });
  const cards = await workshopCards(locale);
  return (
    <main data-testid="workshops-index-page" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <h1 className="text-heading font-semibold text-foreground">{t('title')}</h1>
      <p className="mt-3 max-w-2xl text-body text-muted-foreground">{t('intro')}</p>
      <ul data-workshop-list className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.slug} className="flex">
            <WorkshopCardView card={card} locale={locale} />
          </li>
        ))}
      </ul>
    </main>
  );
}
