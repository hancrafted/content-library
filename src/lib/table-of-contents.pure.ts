/**
 * Pure logic behind the table of contents: which entry is active, which
 * sections are open, how much reading time is left. No DOM, no React.
 */

/** One link; `id` equals the target's data-attribute value and URL fragment. */
export interface TocItem {
  id: string;
  title: string;
  /** Reading time of the target slide, in minutes. */
  minutes: number;
}

/** A section heading with the items it collapses over; `items` may be empty. */
export interface TocSection extends TocItem {
  items: readonly TocItem[];
}

/**
 * The entry crossing the reading line, earliest in page order when several
 * do. While the line sits in a gap between entries, the previous one stays
 * active; before anything has crossed it, the first entry is.
 */
export function activeId(
  intersecting: ReadonlySet<string>,
  order: readonly string[],
  previous: string | null,
): string | null {
  const crossing = order.find((id) => intersecting.has(id));
  return crossing ?? previous ?? order[0] ?? null;
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
