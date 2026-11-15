import type { Locale } from '@/shared/lib/locale.pure';
import type { TocSection } from '@/shared/lib/table-of-contents.pure';

/**
 * What a composed page says of itself in one locale, read without its Slides: its own title, caption and description,
 * its whole reading time, and its table of contents. Cards, overviews, an Event's navigation and the page metadata read
 * it, so a page that lists another never imports that page's Slides, and with them its JS and CSS (FE-004 §4).
 */
export interface LocaleSummary {
  readonly title: string;
  readonly caption: string;
  readonly description: string;
  /** Every Slide's minutes, the Title slide's included: what the card and the table of contents quote. */
  readonly minutes: number;
  /** The table of contents: every section slide with its page Slides, by anchor. */
  readonly sections: readonly TocSection[];
}

/** A composed page's summary in every locale. */
export type PageSummary = Readonly<Record<Locale, LocaleSummary>>;

/** The title of the Section an anchor sits in: a section slide's own, or a page Slide's or an untitled Slide's Section. */
export function sectionTitleAt(summary: LocaleSummary, anchor: string): string | undefined {
  const holds = (section: TocSection) =>
    section.id === anchor ||
    [section, ...section.items].some(
      ({ id, unlisted }) => id === anchor || unlisted?.some((slide) => slide.id === anchor),
    );
  return summary.sections.find(holds)?.title;
}
