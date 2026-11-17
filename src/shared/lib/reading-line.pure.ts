/*
 * The reading line: the horizontal line a reader's eye rests on, a share of the
 * viewport height from its top. The table of contents and the Context drawer
 * both call the element spanning it "current", so they cannot disagree. No DOM,
 * no React.
 */

export const READING_LINE = 0.35;

export function readingLineMargin(): string {
  return `-${READING_LINE * 100}% 0px -${(1 - READING_LINE) * 100}% 0px`;
}

/**
 * The id crossing the reading line, earliest in page order when several do.
 * While the line sits in a gap between ids, the previous one stays current;
 * before anything has crossed it, the first id is.
 */
export function activeId(
  intersecting: ReadonlySet<string>,
  order: readonly string[],
  previous: string | null,
): string | null {
  const crossing = order.find((id) => intersecting.has(id));
  return crossing ?? previous ?? order[0] ?? null;
}

export interface SlideBox {
  readonly top: number;
  readonly height: number;
}

/**
 * How far to scroll after page chrome changes the Slides' width, so the reading line (`line`, px from the
 * viewport top) stays as far into the active Slide as before: the Slides narrow or widen, so they and everything above
 * them reflow. Anchoring at the reading line keeps that Slide the one under it, so the active Slide does not change. A
 * Slide that starts below the line keeps its top where it was.
 */
export function keepReadingScroll(before: SlideBox, after: SlideBox, line: number): number {
  if (before.height <= 0) return after.top - before.top;
  const anchor = Math.min(before.top + before.height, Math.max(before.top, line));
  const progress = (anchor - before.top) / before.height;
  return after.top + progress * after.height - anchor;
}

export interface PageBox {
  readonly top: number;
  readonly height: number;
}

/** The scroll state a frame reads without forcing layout. */
export interface ReadingView {
  readonly scrollY: number;
  readonly viewportHeight: number;
  readonly documentHeight: number;
}

/**
 * How far the reading line has travelled through a box measured earlier, so a scroll frame needs no layout read:
 * 1 once the page is scrolled to its end, 0 with no box or one of no height.
 */
export function readingFraction(box: PageBox | null, view: ReadingView): number {
  if (view.scrollY + view.viewportHeight >= view.documentHeight - 1) return 1;
  if (!box || box.height <= 0) return 0;
  return (view.scrollY + view.viewportHeight * READING_LINE - box.top) / box.height;
}
