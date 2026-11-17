import type { EpisodeRef, ExplorablePageRef, GuideRef, TemplateRef } from '@/content-store/catalogue/episode-id.pure';
import type { EpisodeId, ExplorablePageSlug, GuideSlug, TemplateSlug } from '@/content-store/catalogue/record-routes';

// decision: FE-004 §4
export type ComposedPage =
  | EpisodeRef<EpisodeId>
  | TemplateRef<TemplateSlug>
  | ExplorablePageRef<ExplorablePageSlug>
  | GuideRef<GuideSlug>;

export function entryOf<T>(
  byKind: Readonly<Record<ComposedPage['kind'], Readonly<Record<string, T>>>>,
  page: ComposedPage,
  what: string,
): T {
  const entry: T | undefined = byKind[page.kind][page.id];
  if (entry === undefined) throw new Error(`No ${what} is registered for "${page.id}"`);
  return entry;
}
