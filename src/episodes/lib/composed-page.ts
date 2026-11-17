import type { EpisodeRef, ExplorablePageRef, GuideRef, TemplateRef } from '@/content-store/catalogue/episode-id.pure';
import type { EpisodeId, ExplorablePageSlug, GuideSlug, TemplateSlug } from '@/content-store/catalogue/record-routes';

/**
 * A page the registry composes, by the ref the store serves it with: an Episode with a page, a Template, an Explorable
 * page or a Guide. Its own module, so naming one never reaches the registry, which imports every composition (FE-004 §4).
 */
export type ComposedPage =
  | EpisodeRef<EpisodeId>
  | TemplateRef<TemplateSlug>
  | ExplorablePageRef<ExplorablePageSlug>
  | GuideRef<GuideSlug>;

/**
 * The entry a by-kind table holds for a page, as the composition registry and the summaries both look one up; an
 * Episode's two kinds of ref share the Episodes' table. A ref the table does not hold is a bug, so it throws, naming the
 * page and what it lacks.
 */
export function entryOf<T>(
  byKind: Readonly<Record<ComposedPage['kind'], Readonly<Record<string, T>>>>,
  page: ComposedPage,
  what: string,
): T {
  const entry: T | undefined = byKind[page.kind][page.id];
  if (entry === undefined) throw new Error(`No ${what} is registered for "${page.id}"`);
  return entry;
}
