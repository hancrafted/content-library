/*
 * The Explorable's own words, as `software-ecology.config.yml` and its German twin hold them (FE-012 §1), and the
 * slices each part receives. A Slide overrides any of them through the server entry's `words` prop.
 */

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
}

export interface StatusWords {
  readonly warming: string;
  readonly calm: string;
  readonly bottleneck: string;
  readonly busiest: string;
  readonly waiting: string;
  readonly growing: string;
  readonly clearsWeek: string;
  readonly clearsWeeks: string;
  readonly also: string;
  readonly coping: string;
  readonly sentBack: string;
  readonly behind: string;
}

export interface LegendWords {
  readonly label: string;
  readonly good: string;
  readonly bad: string;
  readonly warn: string;
  readonly ai: string;
  readonly pile: string;
  readonly merged: string;
  readonly handoff: string;
}

export interface StageWords {
  readonly label: string;
  readonly note: string;
  readonly warming: string;
  readonly blocked: string;
  readonly aWeek: string;
  readonly sentBack: string;
  readonly back: string;
  readonly status: StatusWords;
  readonly legend: LegendWords;
}

export interface CardWords {
  readonly waiting: string;
  readonly onBugs: string;
  readonly openDashboard: string;
  readonly openSettings: string;
  readonly inspection: string;
  readonly signs: Readonly<Record<'rework' | 'churn' | 'unread' | 'complaint', string>>;
}

export interface CustomerWords {
  readonly lastReleases: string;
  readonly ofIdeal: string;
  readonly outputTip: string;
  readonly satisfied: string;
  readonly satTip: string;
  readonly leadTime: string;
  readonly leadTip: string;
  readonly couldServe: string;
  readonly headroomTip: string;
  readonly bugs: string;
  readonly bugsTip: string;
  readonly own: string;
  readonly ownTip: string;
  readonly rateTip: string;
  readonly aWeek: string;
  readonly days: string;
  readonly demand: string;
  readonly steady: string;
  readonly random: string;
}

export interface DockWords {
  readonly label: string;
  readonly eyebrow: string;
  readonly grid: string;
  readonly output: string;
  readonly sub: string;
  readonly same: string;
  readonly half: string;
  readonly third: string;
  readonly times: string;
  readonly satisfaction: string;
  readonly satNote: string;
  readonly verdicts: Readonly<Record<'moreUnhappier' | 'unhappy' | 'fewer' | 'asked', string>>;
  readonly note: string;
  readonly complaints: string;
}

export interface Words {
  readonly toolbar: ToolbarWords;
  readonly stage: StageWords;
  readonly card: CardWords;
  readonly customer: CustomerWords;
  readonly dock: DockWords;
}

/** Any word of the Explorable, key by key: what a Slide says differently. */
export type WordsOverride = { readonly [K in keyof Words]?: DeepPartial<Words[K]> };
type DeepPartial<T> = { readonly [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };
