/*
 * A scenario's shapes in a use-case file (design-ADR 0024 §10): a tour step, its `set`, and the Customer it changes.
 * Plain data; software-ecology.types.ts re-exports them.
 */
import type { BadChances } from './defect.types';
import type { Arrivals } from './own-work.types';

/** Where AI works: nowhere, everywhere, or at the listed work centers. */
export type AiSet = 'off' | 'all' | readonly string[];

/** A work center's dial defaults in the file, or a preset's overrides of them. */
export interface CenterDials {
  readonly efficiency?: number;
  readonly effectiveness?: number;
  readonly fanout?: number;
  readonly ai?: boolean;
  readonly aiSpeed?: number;
  readonly aiExtra?: number;
}

export type Chances = Readonly<Record<string, number>>;

/** A preset's or a tour step's changes to the Customer. */
export interface CustomerPatch {
  readonly rate?: number;
  readonly arrivals?: Arrivals;
  readonly mix?: Chances;
  readonly good?: Chances;
  readonly bad?: BadChances;
}

/** A tour step's `set`: dials per center, the Customer, where AI works, the reality. */
export interface StepSet {
  readonly dials?: Readonly<Record<string, CenterDials>>;
  readonly customer?: CustomerPatch;
  readonly ai?: AiSet;
  readonly reality?: number;
}

/** One step of a tour, or a check: settings, the week it runs to, the card its caption points at, its claims. */
export interface TourStep {
  readonly set?: StepSet;
  readonly run: number;
  readonly card?: string;
  readonly expect?: Readonly<Record<string, string>>;
  /** Han's claim for this beat: a key of the scenario's `claims` in the words. */
  readonly claim?: string;
  /** Checked headless only, after the beat's settings run SETTLE_WEEKS more. */
  readonly settles?: Readonly<Record<string, string>>;
}
