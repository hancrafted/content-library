import type { EpisodeRef, ExplorablePageRef, TemplateRef } from '@/content-store/catalogue/episode-id.pure';
import type { EpisodeId, ExplorablePageSlug, TemplateSlug } from '@/content-store/catalogue/record-routes';
import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { EPISODES, EXPLORABLE_PAGES, TEMPLATE_PAGES } from './episode-registry.generated';

/** A page the registry composes, by the ref the store serves it with: an Episode with a page, a Template or an Explorable page. */
export type ComposedPage = EpisodeRef<EpisodeId> | TemplateRef<TemplateSlug> | ExplorablePageRef<ExplorablePageSlug>;

/** The generated registry each kind of page is composed in: the one place a new kind of composed page is added; an Episode's two kinds of ref share the Episodes' registry. */
const REGISTRY_BY_KIND: Readonly<Record<ComposedPage['kind'], Readonly<Record<string, EpisodeComposition>>>> = {
  standalone: EPISODES,
  'event-copy': EPISODES,
  template: TEMPLATE_PAGES,
  'explorable-page': EXPLORABLE_PAGES,
};

/**
 * The Slides a page renders and its own text (FE-002), from the generated registry: an Episode's, public or unlisted,
 * by its EpisodeRef, or a Template's (design-ADR 0019), by its ref. The page metadata, the cards and the
 * Episode page all read it. A ref the registry does not hold is a bug, so it throws.
 */
export function compositionOf(page: ComposedPage): EpisodeComposition {
  const composition: EpisodeComposition | undefined = REGISTRY_BY_KIND[page.kind][page.id];
  if (composition === undefined) throw new Error(`No composition is registered for "${page.id}"`);
  return composition;
}
