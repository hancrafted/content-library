/* The compare words, keyed by the Explorable config pair's `compare:` (FE-012 §1). */

/** Compare mode in the toolbar and the compare stream on the stage. */
export interface CompareWords {
  readonly label: string;
  readonly button: string;
  readonly tip: string;
  readonly slots: string;
  readonly remove: string;
  readonly removeFrom: string;
  readonly show: string;
  readonly exit: string;
  /** The hints beside the widget, by `CompareNote`. */
  readonly pick: string;
  readonly max: string;
  readonly title: string;
  readonly titleOne: string;
  readonly exitStream: string;
  readonly strip: string;
  readonly gap: string;
  readonly gapOne: string;
  readonly gapLabel: string;
  readonly aWeek: string;
  readonly note: string;
}
