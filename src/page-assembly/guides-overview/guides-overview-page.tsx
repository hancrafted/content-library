import { routeOf } from '@/content-store/catalogue/record-routes';
import { TAG_ICONS, tagToken } from '@/content-store/schemas/tag-looks';
import { listedGuides } from '@/content-store/store';
import { compositionOf } from '@/episodes/lib/registry';
import { PAGE_WORDS } from '@/page-assembly/lib/page-words';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import { BadgeList } from '@/shared/components/ui/badge-list';
import { CardArrow, CardCaption, CardShell, CardTitle } from '@/shared/components/ui/card-shell';
import { NAMED_ICONS } from '@/shared/components/ui/named-icons';
import type { Locale } from '@/shared/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/** One public Guide as its card draws it: its words from its composition, its Tags' names from page assembly. */
function guideCards(locale: Locale) {
  const tagWords = PAGE_WORDS[locale].tags;
  return listedGuides().map(({ page, tags }) => {
    const { title, description } = compositionOf(page.guide).messages[locale];
    return {
      slug: page.guide.slug,
      route: routeOf(page),
      title,
      description,
      leadTag: tags[0],
      tags: tags.map((id) => ({ id, label: tagWords[id].name, tooltip: tagWords[id].tooltip })),
    };
  });
}

type GuideCard = ReturnType<typeof guideCards>[number];

/** One Guide as a card, laid out as an Explorable card is: lead Tag icon and accent, kind, title as the one link, description, Tags. */
function GuideCardView({ card, kindLabel, locale }: { card: GuideCard; kindLabel: string; locale: Locale }) {
  return (
    <CardShell
      variant="compact"
      linked
      accent={tagToken(card.leadTag)}
      icon={NAMED_ICONS[TAG_ICONS[card.leadTag]]}
      className="w-full"
      data={{ 'data-guide-card': card.slug, 'data-lead-tag': card.leadTag }}
    >
      <p className="text-caption font-medium tracking-widest text-muted-foreground uppercase">{kindLabel}</p>
      <CardTitle variant="compact" title={card.title} route={card.route} locale={locale} level={2} />
      <CardCaption variant="compact">{card.description}</CardCaption>
      <BadgeList items={card.tags} data={{ 'data-guide-tags': '' }} />
      <div className="mt-auto flex min-h-11 items-center justify-end pt-2">
        <CardArrow variant="compact" />
      </div>
    </CardShell>
  );
}

/**
 * The Guides overview, the page at /guides (design-ADR 0019 as amended by #450): a title with a one-line intro, then a
 * card linking each public Guide, as the Explorables overview draws its cards.
 */
export async function GuidesOverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'guidesOverview' });
  const cards = guideCards(locale);
  return (
    <main data-testid="guides-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={t('title')} intro={<p>{t('intro')}</p>} />
      {cards.length === 0 ? (
        <p>{t('none')}</p>
      ) : (
        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.slug} className="flex">
              <GuideCardView card={card} kindLabel={t('typeLabel')} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
