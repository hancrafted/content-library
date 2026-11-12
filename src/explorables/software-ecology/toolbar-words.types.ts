/* The toolbar's words, keyed by the Explorable config pair's `toolbar:` (FE-012 §1). */

export interface ToolbarWords {
  readonly label: string;
  readonly states: string;
  readonly useCase: string;
  readonly fromFile: string;
  readonly speed: string;
  readonly pause: string;
  readonly speedN: string;
  /** The speed menu's button, "Speed: {n}×", and its tooltip. */
  readonly speedMenu: string;
  readonly speedMenuTip: string;
  /** Pause's name while paused. */
  readonly play: string;
  readonly speedTips: Readonly<Record<string, string>>;
  readonly clear: string;
  readonly clearTip: string;
  readonly day: string;
  readonly week: string;
  readonly warming: string;
  readonly clockTip: string;
  readonly mechs: Readonly<Record<'rework' | 'churn' | 'complaints', { readonly label: string; readonly tip: string }>>;
  /** The Scenarios menu: its button, its name, and each entry's "{n}-step tour". */
  readonly scenarios: string;
  readonly scenariosLabel: string;
  readonly tourSteps: string;
  readonly tour: string;
  readonly tourTip: string;
  /** The dot on the active state once a dial was turned after picking it. */
  readonly modified: string;
  readonly modifiedTip: string;
}

/** The Settings popover: its button, its three columns and the file at its foot (feature guide, Interaction 3). */
export interface SettingsWords {
  readonly button: string;
  readonly tip: string;
  readonly label: string;
  readonly model: string;
  readonly mechanics: string;
  readonly mechanicsNote: string;
  readonly display: string;
  readonly file: string;
}
