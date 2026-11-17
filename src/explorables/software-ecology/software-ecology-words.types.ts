// decision: FE-012 §1
import type { CompareWords } from './compare-words.types';
import type { ExchangeWords } from './exchange-words.types';
import type { OwnWorkWords } from './own-work.types';
import type { SettingsWords, ToolbarWords } from './toolbar-words.types';
import type { TourWords } from './tour-words.types';

export type { CompareWords } from './compare-words.types';
export type { ExchangeWords } from './exchange-words.types';
export type { SettingsWords, ToolbarWords } from './toolbar-words.types';
export type { TourCheckWords, TourWords } from './tour-words.types';

export interface ModelWords {
  readonly reality: string;
  readonly ideal: string;
  readonly realistic: string;
  readonly realityText: string;
  readonly ai: string;
  readonly off: string;
  readonly everywhere: string;
  readonly company: string;
  readonly service: string;
  readonly product: string;
  readonly aiq: string;
  readonly worse: string;
  readonly same: string;
  readonly better: string;
  readonly note: string;
  readonly reset: string;
  readonly tips: Readonly<Record<'reality' | 'ai' | 'company' | 'aiq' | 'reset', string>>;
}

export interface DisplayWords {
  readonly beltMotion: string;
  readonly beltMotionNote: string;
  readonly pile: string;
  readonly pileTip: string;
  readonly piles: Readonly<Record<'heap' | 'stack' | 'drift', { readonly name: string; readonly note: string }>>;
}

interface TrendWords {
  readonly title: string;
  readonly unit: string;
  readonly help: string;
}

interface RowWords {
  readonly label: string;
  readonly sub: string;
  readonly help: string;
}

export interface DashWords {
  readonly own: OwnWorkWords;
  readonly help: string;
  readonly close: string;
  readonly closeTip: string;
  readonly ai: string;
  readonly aiTip: string;
  readonly lightTip: string;
  readonly status: string;
  readonly levels: Readonly<Record<'red' | 'amber' | 'green', string>>;
  readonly signals: Readonly<
    Record<'backing' | 'bottleneck' | 'overloaded' | 'rework' | 'unread' | 'starved' | 'ok', string>
  >;
  readonly grows: string;
  readonly clearsWeek: string;
  readonly clearsWeeks: string;
  readonly trends: Readonly<Record<'out' | 'good' | 'wait', TrendWords>>;
  readonly settings: string;
  readonly withAi: string;
  readonly rows: Readonly<Record<'eff' | 'effv' | 'fan' | 'aiSpeed' | 'aiExtra', RowWords>>;
  readonly flows: string;
  readonly flowsSub: string;
  readonly busy: string;
  readonly blocked: string;
  readonly starved: string;
  readonly util: string;
  readonly throughput: string;
  readonly throughputNote: string;
  readonly arriving: string;
  readonly arrivingNote: string;
  readonly capacity: string;
  readonly capacityNote: string;
  readonly backlog: string;
  readonly backlogNote: string;
  readonly lead: string;
  readonly leadWeeks: string;
  readonly leadPending: string;
  readonly leadNote: string;
  readonly artefacts: string;
  readonly tasks: string;
  readonly withAiHere: string;
}

export interface CustDashWords {
  readonly requests: string;
  readonly arrivals: string;
  readonly modeTip: string;
  readonly steady: string;
  readonly random: string;
  readonly mix: string;
  readonly mixTip: string;
  readonly follow: string;
  readonly followTip: string;
  readonly good: string;
  readonly spec: string;
  readonly code: string;
  readonly complaint: string;
  readonly sizedFor: string;
  readonly times: string;
  readonly gain: string;
  readonly off: string;
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

export interface CartoonWords {
  readonly captions: Readonly<Record<string, string>>;
  readonly blank: string;
  readonly notHere: string;
  readonly artefacts: string;
  readonly jobs: Readonly<Record<string, string>>;
}

export interface Words {
  readonly toolbar: ToolbarWords;
  readonly settings: SettingsWords;
  readonly tour: TourWords;
  readonly stage: StageWords;
  readonly card: CardWords;
  readonly customer: CustomerWords;
  readonly dock: DockWords;
  readonly cartoon: CartoonWords;
  readonly model: ModelWords;
  readonly display: DisplayWords;
  readonly dash: DashWords;
  readonly custDash: CustDashWords;
  readonly compare: CompareWords;
  readonly exchange: ExchangeWords;
}

export type WordsOverride = { readonly [K in keyof Words]?: DeepPartial<Words[K]> };
type DeepPartial<T> = { readonly [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };
