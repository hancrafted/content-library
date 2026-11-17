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
  readonly sections: readonly TocSection[];
}

export type PageSummary = Readonly<Record<Locale, LocaleSummary>>;

export function anchorTitleAt(summary: LocaleSummary, anchor: string): string | undefined {
  for (const section of summary.sections) {
    if (section.id === anchor) return section.title;
    const item = [section, ...section.items].find(
      ({ id, unlisted }) => id === anchor || unlisted?.some((slide) => slide.id === anchor),
    );
    if (item !== undefined) return item.title;
  }
  return undefined;
}
