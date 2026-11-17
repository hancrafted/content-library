import { routeOf, type PageOf } from '@/content-store/catalogue/record-routes';
import { guideAt, guideVideo, treatmentOf, type GuideParams, type RouteParams } from '@/content-store/store';
import { EpisodePageContainer } from '@/episodes/components/episode-page/episode-page-container';
import { compositionOf } from '@/episodes/lib/registry';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export type BuiltGuide = PageOf<'guide'>;

export function guideOf(params: RouteParams<GuideParams>): BuiltGuide {
  return guideAt(params) ?? notFound();
}

// decision: docs/adr/0019-resources-overview.md
export async function GuidePage({ page, locale }: { page: BuiltGuide; locale: Locale }) {
  const { guide } = page;
  const composition = compositionOf(guide);
  const t = await getTranslations({ locale, namespace: 'nav' });
  return (
    <EpisodePageContainer
      locale={locale}
      page={guide}
      episode={composition}
      video={guideVideo(guide.slug, locale)}
      frame={{ route: routeOf(page) }}
      tocPage={{
        title: composition.messages[locale].title,
        route: routeOf(page),
        back: { label: t('guides'), route: ROUTES.guides },
      }}
    />
  );
}

// decision: FE-008 §1
export function guideCopy(page: BuiltGuide, locale: Locale): PageCopy {
  const { title, description } = compositionOf(page.guide).messages[locale];
  return { title, description, treatment: treatmentOf(page) };
}
