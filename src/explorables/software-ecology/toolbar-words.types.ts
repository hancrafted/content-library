/* The toolbar's words, keyed by the Explorable config pair's `toolbar:` (FE-012 §1). */

export interface ToolbarWords {
  readonly label: string;
  readonly states: string;
  readonly useCase: string;
  readonly fromFile: string;
  readonly speed: string;
  readonly pause: string;
  readonly speedN: string;
  readonly speedTips: Readonly<Record<string, string>>;
  readonly clear: string;
  readonly clearTip: string;
  readonly day: string;
  readonly week: string;
  readonly warming: string;
  readonly clockTip: string;
  readonly mechanics: string;
  readonly mechs: Readonly<Record<'rework' | 'churn' | 'complaints', { readonly label: string; readonly tip: string }>>;
  readonly model: string;
  readonly modelTip: string;
  readonly more: string;
  readonly moreTip: string;
  /** The Scenarios menu: its button, its name, and each entry's "{n}-step tour". */
  readonly scenarios: string;
  readonly scenariosLabel: string;
  readonly tourSteps: string;
  readonly tour: string;
  readonly tourTip: string;
  /** The muted lead of the state's "what to watch" line. */
  readonly watch: string;
  /** Beside the state row once a dial was turned after picking a state. */
  readonly modified: string;
  readonly modifiedTip: string;
}
