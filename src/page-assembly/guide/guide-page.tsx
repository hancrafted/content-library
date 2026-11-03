import { routeOf, type PageOf } from '@/content-store/catalogue/record-routes';
import { guideAt, guideVideo, treatmentOf, type GuideParams, type RouteParams } from '@/content-store/store';
import { EpisodePageContainer } from '@/episodes/components/episode-page/episode-page-container';
import { compositionOf } from '@/episodes/lib/registry';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { ROUTES } from '@/shared/lib/static-routes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

/** A Guide: the page reference carrying its composition's ref. */
export type BuiltGuide = PageOf<'guide'>;

/** The page the page catalogue builds at `/guides/<slug>/`, else the 404. */
export function guideOf(params: RouteParams<GuideParams>): BuiltGuide {
  return guideAt(params) ?? notFound();
}

/**
 * A Guide (design-ADR 0019 as amended by #450): an `episode()` composition rendered through the one Episode container,
 * so it has the table of contents, the Context drawer, the page-wide toolbar picks and, from its record's `youtube`,
 * the Video its Title slide plays.
 */
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

/** A Guide's title, description and treatment for `pageMetadata` (FE-008): its words are its composition's. */
export function guideCopy(page: BuiltGuide, locale: Locale): PageCopy {
  const { title, description } = compositionOf(page.guide).messages[locale];
  return { title, description, treatment: treatmentOf(page) };
}
