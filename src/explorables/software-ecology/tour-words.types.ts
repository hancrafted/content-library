// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
export interface TourCheckWords {
  readonly check: string;
  readonly customer: Readonly<Record<string, string>>;
  readonly center: Readonly<Record<string, string>>;
  readonly trend: string;
  readonly customerTrend: Readonly<Record<string, string>>;
  readonly centerTrend: Readonly<Record<string, string>>;
  readonly test: Readonly<Record<'gt' | 'lt' | 'gte' | 'lte' | 'range' | 'rises' | 'falls', string>>;
}

export interface TourWords {
  readonly label: string;
  readonly step: string;
  readonly settling: string;
  readonly running: string;
  readonly checksLabel: string;
  readonly holds: string;
  readonly fails: string;
  readonly close: string;
  readonly back: string;
  readonly next: string;
  readonly finish: string;
  readonly checks: TourCheckWords;
}
