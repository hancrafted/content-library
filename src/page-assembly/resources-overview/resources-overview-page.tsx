import { routeOf } from '@/content-store/catalogue/record-routes';
import { TAG_IDS, TEMPLATE_TYPES } from '@/content-store/schemas/fields';
import { listedTemplates } from '@/content-store/store';
import { compositionOf } from '@/episodes/lib/registry';
import { PAGE_WORDS } from '@/page-assembly/lib/page-words';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import type { Locale } from '@/shared/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { ResourceBrowser, type ResourceBrowserLabels } from './resource-browser.client';
import type { ResourceCard } from './resource-card';

type OverviewT = Awaited<ReturnType<typeof getTranslations<'resourcesOverview'>>>;

/** Every public Resource as a card: its words from its composition, its Tags' names from page assembly. */
function resourceCards(locale: Locale, t: OverviewT): ResourceCard[] {
  const tagWords = PAGE_WORDS[locale].tags;
  return listedTemplates().map(({ page, tags }) => {
    const { title, description } = compositionOf(page.template).messages[locale];
    return {
      slug: page.template.slug,
      route: routeOf(page),
      type: page.type,
      typeLabel: t(`types.${page.type}`),
      title,
      description,
      leadTag: tags[0],
      tags: tags.map((id) => ({ id, label: tagWords[id].name, tooltip: tagWords[id].tooltip })),
    };
  });
}

function browserLabels(t: OverviewT): ResourceBrowserLabels {
  return {
    none: t('none'),
    noMatch: t('noMatch'),
    search: t('search'),
    searchPlaceholder: t('searchPlaceholder'),
    tagFilter: t('tagFilter'),
    typeFilter: t('typeFilter'),
    view: t('view'),
    grid: t('grid'),
    list: t('list'),
    reset: t('reset'),
    typeNames: {
      'episode-template': t('typePlurals.episode-template'),
      'master-slide': t('typePlurals.master-slide'),
    },
  };
}

/**
 * The Resources overview, the page at /resources (design-ADR 0019): a title with a one-line intro, then every public
 * Resource as a card, filterable by search, type and Tag, as a grid or a list. This template reads the records and
 * hands the client leaf plain strings.
 */
export async function ResourcesOverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'resourcesOverview' });
  return (
    <main data-testid="resources-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={t('title')} intro={<p>{t('intro')}</p>} />
      <ResourceBrowser
        cards={resourceCards(locale, t)}
        vocabulary={TAG_IDS}
        types={TEMPLATE_TYPES}
        locale={locale}
        labels={browserLabels(t)}
      />
    </main>
  );
}
