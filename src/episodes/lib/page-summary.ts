import type { ComposedPage } from './composed-page';
import summaries from './page-summaries.generated.json';
import type { PageSummary } from './page-summary.pure';

type Summaries = Readonly<Record<string, PageSummary>>;

/** The generated summaries each kind of composed page is read from; an Episode's two kinds of ref share the Episodes'. */
const SUMMARIES_BY_KIND: Readonly<Record<ComposedPage['kind'], Summaries>> = {
  standalone: summaries.episodes,
  'event-copy': summaries.episodes,
  template: summaries.templates,
  'explorable-page': summaries.explorablePages,
  guide: summaries.guides,
};

/**
 * What a composed page says of itself, by its ref, without its Slides (FE-004 §4): the summary `npm run registry`
 * wrote from its composition to `page-summaries.generated.json`. Cards, overviews, an Event's navigation and the page
 * metadata read it, so a page never imports the Slides of a page it only lists. A ref the summaries do not hold is a
 * bug, so it throws.
 */
export function summaryOf(page: ComposedPage): PageSummary {
  const summary: PageSummary | undefined = SUMMARIES_BY_KIND[page.kind][page.id];
  if (summary === undefined) throw new Error(`No summary is registered for "${page.id}"`);
  return summary;
}
