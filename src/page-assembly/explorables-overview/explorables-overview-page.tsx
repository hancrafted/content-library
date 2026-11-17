import { routeOf } from '@/content-store/catalogue/record-routes';
import { listedExplorablePages } from '@/content-store/store';
import { summaryOf } from '@/episodes/lib/page-summary';
import { EXPLORABLE_CARD_ARTWORK } from '@/page-assembly/lib/explorable-card-artwork';
import { PAGE_WORDS } from '@/page-assembly/lib/page-words';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import { CARD_GRID } from '@/shared/components/ui/card-grid';
import type { Locale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { getTranslations } from 'next-intl/server';
import { ExplorableCardView, type ExplorableCard } from './explorable-card';

function explorableCards(locale: Locale, typeLabel: string): ExplorableCard[] {
  const tagWords = PAGE_WORDS[locale].tags;
  return listedExplorablePages().map(({ page, tags }) => {
    const { title, description } = summaryOf(page.explorablePage)[locale];
    return {
      slug: page.explorablePage.slug,
      route: routeOf(page),
      typeLabel,
      artwork: EXPLORABLE_CARD_ARTWORK[page.explorablePage.slug],
      title,
      description,
      leadTag: tags[0],
      tags: tags.map((id) => ({ id, label: tagWords[id].name, tooltip: tagWords[id].tooltip })),
    };
  });
}

export async function ExplorablesOverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'explorablesOverview' });
  const cards = explorableCards(locale, t('typeLabel'));
  return (
    <main data-testid="explorables-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={t('title')} intro={<p>{t('intro')}</p>} />
      {cards.length === 0 ? (
        <p>{t('none')}</p>
      ) : (
        <ul className={cn(CARD_GRID, 'list-none p-0')}>
          {cards.map((card) => (
            <li key={card.slug} className="flex">
              <ExplorableCardView card={card} locale={locale} open={t('open')} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
