import type { Locale } from '@/shared/lib/locale.pure';
import type { TocSection } from '@/shared/lib/table-of-contents.pure';

// decision: FE-004 §4
export interface LocaleSummary {
  readonly title: string;
  readonly caption: string;
  readonly description: string;
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
