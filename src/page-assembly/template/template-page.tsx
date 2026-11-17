import { routeOf, type PageOf } from '@/content-store/catalogue/record-routes';
import type { TemplateType } from '@/content-store/schemas/fields';
import { templatePageAt, treatmentOf, type RouteParams, type TemplateParams } from '@/content-store/store';
import { EpisodePageContainer } from '@/episodes/components/episode-page/episode-page-container';
import { compositionOf } from '@/episodes/lib/registry';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { notFound } from 'next/navigation';

// decision: docs/decision-records/0019-resources-overview.md
export type TemplatePageRef = PageOf<'template'>;

export function templatePageOf(type: TemplateType, params: RouteParams<TemplateParams>): TemplatePageRef {
  return templatePageAt(type, params) ?? notFound();
}

// decision: FE-007 §1
export function TemplatePage({ page, locale }: { page: TemplatePageRef; locale: Locale }) {
  const { template } = page;
  return (
    <EpisodePageContainer
      locale={locale}
      page={template}
      episode={compositionOf(template)}
      frame={{ route: routeOf(page) }}
    />
  );
}

// decision: FE-008 §1
export function templatePageCopy(page: TemplatePageRef, locale: Locale): PageCopy {
  const { title, description } = compositionOf(page.template).messages[locale];
  return { title, description, treatment: treatmentOf(page) };
}
