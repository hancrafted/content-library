import { routeOf, type PageOf } from '@/content-store/catalogue/record-routes';
import type { TemplateType } from '@/content-store/schemas/fields';
import { templatePageAt, treatmentOf, type RouteParams, type TemplateParams } from '@/content-store/store';
import { EpisodePageContainer } from '@/episodes/components/episode-page/episode-page-container';
import { compositionOf } from '@/episodes/lib/registry';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { notFound } from 'next/navigation';

/** A Template's page (design-ADR 0019): the page reference carrying its type and its composition's ref. */
export type TemplatePageRef = PageOf<'template'>;

/** The page the page catalogue builds at `/<type plural>/<template>/`, else the 404: a slug of another type has none. */
export function templatePageOf(type: TemplateType, params: RouteParams<TemplateParams>): TemplatePageRef {
  return templatePageAt(type, params) ?? notFound();
}

/**
 * A Template page (FE-007 §1): an `episode()` composition rendered through the one Episode container, so it has the
 * table of contents and the Context drawer, but it is no Episode: no video, no structured data, never in an Episode
 * list. Its route comes from its type, so the page hands it to the container.
 */
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

/** A Template page's title, description and treatment for `pageMetadata` (FE-008): its words are its composition's. */
export function templatePageCopy(page: TemplatePageRef, locale: Locale): PageCopy {
  const { title, description } = compositionOf(page.template).messages[locale];
  return { title, description, treatment: treatmentOf(page) };
}
