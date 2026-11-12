/* The guided tour's words (design-ADR 0024 §10), keyed by the Explorable config pair's `tour:`. */

/** A tour's checks in plain words: one label per measure, one per test, joined by `check`. */
export interface TourCheckWords {
  /** "{measure}: {test} — {value}" */
  readonly check: string;
  readonly customer: Readonly<Record<string, string>>;
  /** Each with `{title}`, the work center's. */
  readonly center: Readonly<Record<string, string>>;
  readonly test: Readonly<Record<'gt' | 'lt' | 'gte' | 'lte' | 'range' | 'rises' | 'falls', string>>;
}

/** The guided tour's caption box. */
export interface TourWords {
  readonly label: string;
  /** "· step {i} of {n} · week {w}" */
  readonly step: string;
  readonly settling: string;
  /** "Running to week {w}… week {n}" */
  readonly running: string;
  readonly checksLabel: string;
  /** Read out before a check that holds or fails: its ✓ and ✗ are only marks. */
  readonly holds: string;
  readonly fails: string;
  readonly close: string;
  readonly back: string;
  readonly next: string;
  readonly finish: string;
  readonly checks: TourCheckWords;
}
