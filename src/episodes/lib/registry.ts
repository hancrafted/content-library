import type { EpisodeRef, ExplorablePageRef, TemplateRef } from '@/content-store/catalogue/episode-id.pure';
import type { EpisodeId, ExplorablePageSlug, TemplateSlug } from '@/content-store/catalogue/record-routes';
import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { EPISODES, EXPLORABLE_PAGES, TEMPLATE_PAGES } from './episode-registry.generated';

/** A page the registry composes, by the ref the store serves it with: an Episode with a page, a Template or an Explorable page. */
export type ComposedPage = EpisodeRef<EpisodeId> | TemplateRef<TemplateSlug> | ExplorablePageRef<ExplorablePageSlug>;

/**
 * The Slides a page renders and its own text (FE-002), from the generated registry: an Episode's, public or unlisted,
 * by its EpisodeRef, or a Template's (design-ADR 0019), by its ref. The page metadata, the cards and the
 * Episode page all read it. A ref the registry does not hold is a bug, so it throws.
 */
export function compositionOf(page: ComposedPage): EpisodeComposition {
  const composition: EpisodeComposition | undefined =
    page.kind === 'template'
      ? TEMPLATE_PAGES[page.id]
      : page.kind === 'explorable-page'
        ? EXPLORABLE_PAGES[page.id]
        : EPISODES[page.id];
  if (composition === undefined) throw new Error(`No composition is registered for "${page.id}"`);
  return composition;
}
