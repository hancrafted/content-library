import { entryOf, type ComposedPage } from './composed-page';
import summaries from './page-summaries.generated.json';
import type { PageSummary } from './page-summary.pure';

type Summaries = Readonly<Record<string, PageSummary>>;

const SUMMARIES_BY_KIND: Readonly<Record<ComposedPage['kind'], Summaries>> = {
  standalone: summaries.episodes,
  'event-copy': summaries.episodes,
  template: summaries.templates,
  'explorable-page': summaries.explorablePages,
  guide: summaries.guides,
};

// decision: FE-004 §4
export function summaryOf(page: ComposedPage): PageSummary {
  return entryOf(SUMMARIES_BY_KIND, page, 'summary');
}
