export const READING_LINE = 0.35;

export function readingLineMargin(): string {
  return `-${READING_LINE * 100}% 0px -${(1 - READING_LINE) * 100}% 0px`;
}

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

export interface ReadingView {
  readonly scrollY: number;
  readonly viewportHeight: number;
  readonly documentHeight: number;
}

export function readingFraction(box: PageBox | null, view: ReadingView): number {
  if (view.scrollY + view.viewportHeight >= view.documentHeight - 1) return 1;
  if (!box || box.height <= 0) return 0;
  return (view.scrollY + view.viewportHeight * READING_LINE - box.top) / box.height;
}
