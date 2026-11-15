import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import type { ComposedPage } from './composed-page';
import { EPISODES, EXPLORABLE_PAGES, GUIDES, TEMPLATE_PAGES } from './episode-registry.generated';

export type { ComposedPage } from './composed-page';

/** The generated registry each kind of page is composed in: the one place a new kind of composed page is added; an Episode's two kinds of ref share the Episodes' registry. */
const REGISTRY_BY_KIND: Readonly<Record<ComposedPage['kind'], Readonly<Record<string, EpisodeComposition>>>> = {
  standalone: EPISODES,
  'event-copy': EPISODES,
  template: TEMPLATE_PAGES,
  'explorable-page': EXPLORABLE_PAGES,
  guide: GUIDES,
};

/**
 * The Slides a page renders and its own text (FE-002), from the generated registry: an Episode's, public or unlisted,
 * by its EpisodeRef, or a Template's (design-ADR 0019), by its ref. It imports every composition, so no Episode page,
 * landing or listing page reaches it: an Episode's route hands in its own composition, and a listing reads `summaryOf`
 * (FE-004 §4). The Template, Explorable page and Guide pages, the summaries and the tests read it. A ref the registry
 * does not hold is a bug, so it throws.
 */
export function compositionOf(page: ComposedPage): EpisodeComposition {
  const composition: EpisodeComposition | undefined = REGISTRY_BY_KIND[page.kind][page.id];
  if (composition === undefined) throw new Error(`No composition is registered for "${page.id}"`);
  return composition;
}
