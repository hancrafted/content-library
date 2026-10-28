import { routeOf } from '@/content-store/catalogue/record-routes';
import { listedExplorablePages } from '@/content-store/store';
import { compositionOf } from '@/episodes/lib/registry';
import { PAGE_WORDS } from '@/page-assembly/lib/page-words';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import type { Locale } from '@/shared/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { ExplorableCardView, type ExplorableCard } from './explorable-card';

/** Every public Explorable page as a card: its words from its composition, its Tags' names from page assembly. */
function explorableCards(locale: Locale, typeLabel: string): ExplorableCard[] {
  const tagWords = PAGE_WORDS[locale].tags;
  return listedExplorablePages().map(({ page, tags }) => {
    const { title, description } = compositionOf(page.explorablePage).messages[locale];
    return {
      slug: page.explorablePage.slug,
      route: routeOf(page),
      typeLabel,
      title,
      description,
      leadTag: tags[0],
      tags: tags.map((id) => ({ id, label: tagWords[id].name, tooltip: tagWords[id].tooltip })),
    };
  });
}

/**
 * The Explorables overview, the page at /explorables (spec #404): a title with a one-line intro, then a card linking
 * each public Explorable page, as the Resources overview's first cut draws its cards.
 */
export async function ExplorablesOverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'explorablesOverview' });
  const cards = explorableCards(locale, t('typeLabel'));
  return (
    <main data-testid="explorables-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={t('title')} intro={<p>{t('intro')}</p>} />
      {cards.length === 0 ? (
        <p>{t('none')}</p>
      ) : (
        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.slug} className="flex">
              <ExplorableCardView card={card} locale={locale} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
