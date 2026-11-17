// decision: FE-012 §1
// spec: docs/features/explorables/software-ecology.md#interaction
export interface ToolbarWords {
  readonly label: string;
  readonly states: string;
  readonly useCase: string;
  readonly fromFile: string;
  readonly speed: string;
  readonly pause: string;
  readonly speedMenu: string;
  readonly speedMenuTip: string;
  readonly play: string;
  readonly speedTips: Readonly<Record<string, string>>;
  readonly clear: string;
  readonly clearTip: string;
  readonly day: string;
  readonly week: string;
  readonly warming: string;
  readonly mechs: Readonly<Record<'rework' | 'churn' | 'complaints', { readonly label: string; readonly tip: string }>>;
  readonly scenarios: string;
  readonly scenariosLabel: string;
  readonly tourSteps: string;
  readonly tour: string;
  readonly tourTip: string;
  readonly modified: string;
  readonly modifiedTip: string;
}

export interface SettingsWords {
  readonly button: string;
  readonly tip: string;
  readonly label: string;
  readonly model: string;
  readonly mechanics: string;
  readonly mechanicsNote: string;
  readonly display: string;
  readonly close: string;
  readonly help: string;
}
