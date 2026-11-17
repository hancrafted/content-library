export const OPERATING_SYSTEMS = ['mac', 'windows', 'linux'] as const;

export type Os = (typeof OPERATING_SYSTEMS)[number];

function isOneOf<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}

export function osOf(pick: string): Os {
  return isOneOf(OPERATING_SYSTEMS, pick) ? pick : 'mac';
}
