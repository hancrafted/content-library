import type { EpisodeRef, ToolingRef } from '@/content-store/catalogue/episode-id.pure';
import type { EpisodeId, ToolingSlug } from '@/content-store/catalogue/record-routes';
import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { EPISODES, TOOLING_PAGES } from './episode-registry.generated';

/** A page the registry composes, by the ref the store serves it with: an Episode with a page, or a tooling page. */
export type ComposedPage = EpisodeRef<EpisodeId> | ToolingRef<ToolingSlug>;

/**
 * The Slides a page renders and its own text (FE-002), from the generated registry: an Episode's, public or unlisted,
 * by its EpisodeRef, or a tooling page's (design-ADR 0016 decision 12), by its ref. The page metadata, the cards and the
 * Episode page all read it. A ref the registry does not hold is a bug, so it throws.
 */
export function compositionOf(page: ComposedPage): EpisodeComposition {
  const composition: EpisodeComposition | undefined =
    page.kind === 'tooling' ? TOOLING_PAGES[page.id] : EPISODES[page.id];
  if (composition === undefined) throw new Error(`No composition is registered for "${page.id}"`);
  return composition;
}
