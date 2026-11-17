import { tocSectionsOf } from '@/episodes/components/episode-page/episode-page-container.pure';
import { episodeMinutes } from '@/episodes/components/slide-master/localized-slide';
import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { localizeSlideOutline } from '@/episodes/components/slide-master/slide-outline';
import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import { EPISODES, EXPLORABLE_PAGES, GUIDES, TEMPLATE_PAGES } from './episode-registry.generated';
import { placeSections } from './episode.pure';
import type { LocaleSummary, PageSummary } from './page-summary.pure';

// decision: FE-004 §4
function localeSummary(composition: EpisodeComposition, locale: Locale): LocaleSummary {
  const { title, caption, description } = composition.messages[locale];
  const sections = tocSectionsOf(
    placeSections(composition.sections)
      .flat()
      .map((slide) => localizeSlideOutline(slide, locale)),
  );
  return { title, caption, description, minutes: episodeMinutes(composition, locale), sections };
}

function summaryOfComposition(composition: EpisodeComposition): PageSummary {
  return Object.fromEntries(LOCALES.map((locale) => [locale, localeSummary(composition, locale)])) as PageSummary;
}

function summariesOf(registry: Readonly<Record<string, EpisodeComposition>>): Record<string, PageSummary> {
  return Object.fromEntries(
    Object.entries(registry).map(([id, composition]) => [id, summaryOfComposition(composition)]),
  );
}

export interface CompositionSummaries {
  readonly episodes: Record<string, PageSummary>;
  readonly templates: Record<string, PageSummary>;
  readonly explorablePages: Record<string, PageSummary>;
  readonly guides: Record<string, PageSummary>;
}

export function compositionSummaries(): CompositionSummaries {
  return {
    episodes: summariesOf(EPISODES),
    templates: summariesOf(TEMPLATE_PAGES),
    explorablePages: summariesOf(EXPLORABLE_PAGES),
    guides: summariesOf(GUIDES),
  };
}
