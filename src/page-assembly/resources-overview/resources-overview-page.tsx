import type { ExplorablePageSlug } from '@/content-store/catalogue/record-routes';
import { TAG_IDS } from '@/content-store/schemas/fields';
import { STORY_OF } from '@/page-assembly/lib/explorable-story';
import { PAGE_WORDS } from '@/page-assembly/lib/page-words';
import { PAGE_CONTAINER, PageHeader } from '@/shared/components/page-header';
import type { Locale } from '@/shared/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { ResourceBrowser, type ResourceBrowserLabels } from './resource-browser.client';
import type { ResourceCard } from './resource-card';
import { resourceIndex } from './resource-index';
import { RESOURCE_KINDS } from './resource-index.pure';

type OverviewT = Awaited<ReturnType<typeof getTranslations<'resourcesOverview'>>>;

/** Every Resource the index holds in this locale as a card: the Tags' names come from page assembly. */
function resourceCards(locale: Locale, t: OverviewT): ResourceCard[] {
  const tagWords = PAGE_WORDS[locale].tags;
  return resourceIndex()
    .filter((entry) => entry.locale === locale)
    .map(({ kind, slug, route, title, description, tags }) => ({
      slug: `${kind}:${slug}`,
      route,
      kind,
      kindLabel: t(`kinds.${kind}`),
      story: kind === 'explorable-page' ? STORY_OF[slug as ExplorablePageSlug] : undefined,
      title,
      description,
      leadTag: tags[0],
      tags: tags.map((id) => ({ id, label: tagWords[id].name, tooltip: tagWords[id].tooltip })),
    }));
}

function browserLabels(t: OverviewT): ResourceBrowserLabels {
  return {
    none: t('none'),
    noMatch: t('noMatch'),
    search: t('search'),
    searchPlaceholder: t('searchPlaceholder'),
    tagFilter: t('tagFilter'),
    kindFilter: t('kindFilter'),
    view: t('view'),
    grid: t('grid'),
    list: t('list'),
    reset: t('reset'),
    kindNames: {
      episode: t('kindPlurals.episode'),
      event: t('kindPlurals.event'),
      'explorable-page': t('kindPlurals.explorable-page'),
      'episode-template': t('kindPlurals.episode-template'),
      'master-slide': t('kindPlurals.master-slide'),
    },
  };
}

/**
 * The Resources overview, the page at /resources (design-ADR 0019, `docs/features/resources.md`): a title with a
 * one-line intro, then every Resource the Resource index holds as a card, filterable by search, kind and Tag, as a
 * grid or a list. This template reads the index and hands the client leaf plain strings.
 */
export async function ResourcesOverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'resourcesOverview' });
  return (
    <main data-testid="resources-index-page" className={PAGE_CONTAINER}>
      <PageHeader title={t('title')} intro={<p>{t('intro')}</p>} />
      <ResourceBrowser
        cards={resourceCards(locale, t)}
        vocabulary={TAG_IDS}
        kinds={RESOURCE_KINDS}
        locale={locale}
        labels={browserLabels(t)}
      />
    </main>
  );
}
