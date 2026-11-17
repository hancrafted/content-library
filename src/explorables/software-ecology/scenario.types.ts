// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import type { BadChances } from './defect.types';
import type { Arrivals } from './own-work.types';

export type AiSet = 'off' | 'all' | readonly string[];

export interface CenterDials {
  readonly efficiency?: number;
  readonly effectiveness?: number;
  readonly fanout?: number;
  readonly ai?: boolean;
  readonly aiSpeed?: number;
  readonly aiExtra?: number;
}

export type Chances = Readonly<Record<string, number>>;

export interface CustomerPatch {
  readonly rate?: number;
  readonly arrivals?: Arrivals;
  readonly mix?: Chances;
  readonly good?: Chances;
  readonly bad?: BadChances;
}

export interface StepSet {
  readonly dials?: Readonly<Record<string, CenterDials>>;
  readonly customer?: CustomerPatch;
  readonly ai?: AiSet;
  readonly reality?: number;
}

export interface TourStep {
  readonly set?: StepSet;
  readonly run: number;
  readonly card?: string;
  readonly expect?: Readonly<Record<string, string>>;
  readonly claim?: string;
  readonly settles?: Readonly<Record<string, string>>;
}
