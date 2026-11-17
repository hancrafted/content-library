import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { entryOf, type ComposedPage } from './composed-page';
import { EPISODES, EXPLORABLE_PAGES, GUIDES, TEMPLATE_PAGES } from './episode-registry.generated';

export type { ComposedPage } from './composed-page';

const REGISTRY_BY_KIND: Readonly<Record<ComposedPage['kind'], Readonly<Record<string, EpisodeComposition>>>> = {
  standalone: EPISODES,
  'event-copy': EPISODES,
  template: TEMPLATE_PAGES,
  'explorable-page': EXPLORABLE_PAGES,
  guide: GUIDES,
};

// decision: FE-004 §4
// decision: docs/decision-records/0019-resources-overview.md
export function compositionOf(page: ComposedPage): EpisodeComposition {
  return entryOf(REGISTRY_BY_KIND, page, 'composition');
}
