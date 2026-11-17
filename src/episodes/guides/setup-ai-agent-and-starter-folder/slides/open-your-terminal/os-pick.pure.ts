export const OS_PICKS = ['mac', 'windows', 'linux'] as const;
export type OsPick = (typeof OS_PICKS)[number];

export const DEFAULT_OS: OsPick = 'mac';

const known = <T extends string>(picks: readonly T[], value: string, fallback: T): T =>
  (picks as readonly string[]).includes(value) ? (value as T) : fallback;

export const osOf = (value: string): OsPick => known(OS_PICKS, value, DEFAULT_OS);
