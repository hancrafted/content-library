export interface Settled {
  pending: readonly string[];
  external: boolean;
}

export function settleValue(pending: readonly string[], value: string): Settled {
  const index = pending.indexOf(value);
  if (index === -1) return { pending: [], external: true };
  return { pending: pending.slice(index + 1), external: false };
}
