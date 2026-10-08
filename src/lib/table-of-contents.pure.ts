/**
 * Pure logic behind the table of contents: which
 * sections are open, how much reading time is left. No DOM, no React.
 */

/** One link; `id` equals the target's data-attribute value and URL fragment. */
export interface TocItem {
  id: string;
  title: string;
  /** Reading time of the target slide, in minutes. */
  /** Total reading time this entry stands for: its own Slide plus every Slide in `unlisted`. */
  minutes: number;
  /** Untitled Slides folded into this entry, in page order: listed nowhere, but this entry stays current while they are. */
  unlisted?: readonly UnlistedSlide[];
}

/** An untitled Slide: its id and its own reading time. */
export interface UnlistedSlide {
  id: string;
  minutes: number;
}

/** A section heading with the items it collapses over; `items` may be empty. */
export interface TocSection extends TocItem {
  items: readonly TocItem[];
}

/**
 * Every Slide in page order with its own minutes (an entry's total minus what
 * it owns for its unlisted Slides), plus which entry each unlisted Slide
 * belongs to. One honest sequence for reading time, one lookup for highlights.
 */
export function readingOrder(sections: readonly TocSection[]): {
  ids: string[];
  minutes: number[];
  owners: Record<string, string>;
} {
  const order = { ids: [] as string[], minutes: [] as number[], owners: {} as Record<string, string> };
  for (const entry of sections.flatMap((section) => [section, ...section.items])) {
    const unlisted = entry.unlisted ?? [];
    order.ids.push(entry.id);
    order.minutes.push(entry.minutes - unlisted.reduce((sum, slide) => sum + slide.minutes, 0));
    for (const slide of unlisted) {
      order.ids.push(slide.id);
      order.minutes.push(slide.minutes);
      order.owners[slide.id] = entry.id;
    }
  }
  return order;
}

/**
 * The entry to highlight for the active Slide. None on the Title slide (`top`)
 * and while the Slide is unknown (`null`, before the client has read the URL);
 * an untitled Slide has no entry of its own, so its owning entry stays current.
 */
export function activeEntry(
  owners: Readonly<Record<string, string>>,
  slide: string | null,
  top: string,
): string | null {
  if (slide === null || slide === top) return null;
  return owners[slide] ?? slide;
}

/** The id of the section that is the active entry or holds it. */
export function ownerOf(sections: readonly TocSection[], active: string | null): string | undefined {
  return sections.find((section) => section.id === active || section.items.some((item) => item.id === active))?.id;
}

/**
 * Open sections, in page order: the one owning the active entry, flipped for
 * every section whose chevron the reader toggled.
 */
export function openSectionIds(
  sections: readonly TocSection[],
  active: string | null,
  toggled: ReadonlySet<string>,
): ReadonlySet<string> {
  const owner = ownerOf(sections, active);
  return new Set(sections.filter((section) => (section.id === owner) !== toggled.has(section.id)).map((s) => s.id));
}

export interface ReadingTime {
  total: number;
  remaining: number;
  /** Elapsed share of `total`, 0 to 1, weighted by time rather than scroll distance. */
  progress: number;
}

/**
 * Reading time over slides in page order. The active slide counts as read up
 * to `fraction` (clamped to 0–1); `activeIndex` -1 means nothing is read yet.
 * An outline with no time at all is fully read.
 */
export function readingTime(minutes: readonly number[], activeIndex: number, fraction: number): ReadingTime {
  const total = minutes.reduce((sum, value) => sum + value, 0);
  const before = minutes.slice(0, Math.max(activeIndex, 0)).reduce((sum, value) => sum + value, 0);
  const current = activeIndex < 0 ? 0 : (minutes[activeIndex] ?? 0) * Math.min(Math.max(fraction, 0), 1);
  const elapsed = before + current;
  return { total, remaining: total - elapsed, progress: total === 0 ? 1 : elapsed / total };
}
