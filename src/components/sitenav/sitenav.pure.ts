/**
 * Pure logic behind the sitenav: which entry is active, which section is
 * open, how far through the page the reader is. No DOM, no React.
 */

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

/** One link in the sitenav; `id` equals the target's data-attribute value and URL fragment. */
export interface SitenavItem {
  id: string;
  title: string;
}

/** A section heading with the items it collapses over; `items` may be empty. */
export interface SitenavSection extends SitenavItem {
  items: readonly SitenavItem[];
}

/** The section that is the active entry or owns it; `null` when none does. */
export function expandedSectionId(sections: readonly SitenavSection[], active: string | null): string | null {
  const owner = sections.find((section) => section.id === active || section.items.some((item) => item.id === active));
  return owner?.id ?? null;
}

export interface ScrollState {
  scrollY: number;
  scrollHeight: number;
  viewportHeight: number;
}

/** Whole percent of the page scrolled, 0 to 100; a page with nothing to scroll is fully read. */
export function scrollProgress({ scrollY, scrollHeight, viewportHeight }: ScrollState): number {
  const scrollable = scrollHeight - viewportHeight;
  if (scrollable <= 0) return 100;
  return Math.round(Math.min(Math.max(scrollY / scrollable, 0), 1) * 100);
}
