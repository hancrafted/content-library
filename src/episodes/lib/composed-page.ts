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
