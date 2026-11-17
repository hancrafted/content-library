// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-006 §4
export type Arrivals = 'steady' | 'random';

export interface Source {
  readonly id: string;
  readonly at: string;
  readonly rate: number;
  readonly arrivals?: Arrivals;
}

export interface OwnSet {
  readonly rate?: number;
  readonly arrivals?: Arrivals;
}

export const OWN_RATE_MAX = 50;

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
