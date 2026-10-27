import { routeOf, type PageOf } from '@/content-store/catalogue/record-routes';
import type { ResourceType } from '@/content-store/schemas/fields';
import { resourcePageAt, treatmentOf, type ResourceParams, type RouteParams } from '@/content-store/store';
import { EpisodePageContainer } from '@/episodes/components/episode-page/episode-page-container';
import { compositionOf } from '@/episodes/lib/registry';
import type { PageCopy } from '@/page-assembly/lib/page-metadata.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { notFound } from 'next/navigation';

/** A Resource's page (design-ADR 0019): the page reference carrying its type and its composition's ref. */
export type ResourcePageRef = PageOf<'resource'>;

/** The page the page catalogue builds at `/<type plural>/<resource>/`, else the 404: a slug of another type has none. */
export function resourcePageOf(type: ResourceType, params: RouteParams<ResourceParams>): ResourcePageRef {
  return resourcePageAt(type, params) ?? notFound();
}

/**
 * A Resource page (FE-007 §1): an `episode()` composition rendered through the one Episode container, so it has the
 * table of contents and the Context drawer, but it is no Episode: no video, no structured data, never in an Episode
 * list. Its route comes from its type, so the page hands it to the container.
 */
export function ResourcePage({ page, locale }: { page: ResourcePageRef; locale: Locale }) {
  const { resource } = page;
  return (
    <EpisodePageContainer
      locale={locale}
      page={resource}
      episode={compositionOf(resource)}
      frame={{ route: routeOf(page) }}
    />
  );
}

/** A Resource page's title, description and treatment for `pageMetadata` (FE-008): its words are its composition's. */
export function resourcePageCopy(page: ResourcePageRef, locale: Locale): PageCopy {
  const { title, description } = compositionOf(page.resource).messages[locale];
  return { title, description, treatment: treatmentOf(page) };
}
