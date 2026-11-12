/*
 * Own work's shapes (design-ADR 0024 §2, §17): a source in a use-case file, one source's setting from its work
 * center's dashboard, and the words of that dashboard's section. Plain data only (FE-006 §4).
 */
/** How tickets arrive: one every 1/rate (Steady) or at random with the same average (Random). */
export type Arrivals = 'steady' | 'random';

/** A source of own tickets (Product company): the work center that writes them and how many a week. */
export interface Source {
  readonly id: string;
  readonly at: string;
  readonly rate: number;
  /** Steady or Random; by default the state's own (steady in Ideal, random otherwise). */
  readonly arrivals?: Arrivals;
}

/** One source's own-work setting from its dashboard: tickets a week and Steady or Random; unset means the file's. */
export interface OwnSet {
  readonly rate?: number;
  readonly arrivals?: Arrivals;
}

/** The most tickets a week a source may write; the file's validation and the dashboard's slider share it. */
export const OWN_RATE_MAX = 50;

/** A work center's own-work section. */
export interface OwnWorkWords {
  readonly title: string;
  readonly tip: string;
  readonly help: string;
  readonly rate: string;
  readonly rateTip: string;
  readonly perWeek: string;
  readonly arrivals: string;
  readonly arrivalsTip: string;
  readonly steady: string;
  readonly random: string;
  readonly emit: string;
  readonly emitTip: string;
}
