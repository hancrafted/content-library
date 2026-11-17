/** A row's vertical extent in one coordinate space. */
export interface Box {
  readonly top: number;
  readonly height: number;
}

/**
 * The vertical band the "Lost in the middle" bracket spans: the rows the attention list marks as middle, or, when it
 * marks none, the middle third of all its rows (at least one).
 */
export function middleBand(all: readonly Box[], marked: readonly Box[]): Box | null {
  const rows = marked.length > 0 ? marked : middleThird(all);
  const first = rows[0];
  const last = rows.at(-1);
  if (!first || !last) return null;
  return { top: first.top, height: last.top + last.height - first.top };
}

function middleThird(all: readonly Box[]): readonly Box[] {
  if (all.length === 0) return [];
  const from = Math.floor(all.length / 3);
  const to = Math.max(from + 1, Math.ceil((all.length * 2) / 3));
  return all.slice(from, to);
}
