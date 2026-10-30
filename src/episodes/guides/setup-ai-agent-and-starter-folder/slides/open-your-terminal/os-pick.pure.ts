/*
 * Which page picks this Slide knows. The picks are
 * the page-wide toolbar's values (`usePagePick`, names 'os' and 'agent'), the same strings every step Slide reads.
 */

export const OS_PICKS = ['mac', 'windows', 'linux'] as const;
export type OsPick = (typeof OS_PICKS)[number];

/** The pick the toolbar shows until the viewer picks: Mac, as the Spec's mock has it. */
export const DEFAULT_OS: OsPick = 'mac';

const known = <T extends string>(picks: readonly T[], value: string, fallback: T): T =>
  (picks as readonly string[]).includes(value) ? (value as T) : fallback;

/** The page's operating-system pick, or the default for a value no toolbar offers. */
export const osOf = (value: string): OsPick => known(OS_PICKS, value, DEFAULT_OS);
