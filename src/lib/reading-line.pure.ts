/*
 * The reading line: the horizontal line a reader's eye rests on, a share of the
 * viewport height from its top. The table of contents and the Context drawer
 * both call the element spanning it "current", so they cannot disagree. No DOM,
 * no React.
 */

export const READING_LINE = 0.35;

/** An IntersectionObserver `rootMargin` that shrinks the viewport to the reading line. */
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
