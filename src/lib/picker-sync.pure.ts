// Keeps the token editor's colour picker from fighting the value it just wrote.
// A drag emits several colours before React hands the newest edit back, so a
// value arriving at the picker may be one it emitted a moment ago. Taking that
// stale value as an outside change would move the handle back, which emits again,
// and so on until React gives up. No DOM, no React.

export interface Settled {
  /** Emissions not yet seen come back as the value. */
  pending: readonly string[];
  /** The value did not come from the picker, so the picker must show it. */
  external: boolean;
}

/** Matches an arriving `value` against what the picker emitted, oldest first. */
export function settleValue(pending: readonly string[], value: string): Settled {
  const index = pending.indexOf(value);
  if (index === -1) return { pending: [], external: true };
  return { pending: pending.slice(index + 1), external: false };
}
