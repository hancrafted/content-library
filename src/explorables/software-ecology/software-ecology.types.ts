/*
 * The software ecology Explorable's data shapes (design-ADR 0024 §8–§11): a use-case file (schema
 * `software-ecology-factory/5`), its words per locale, the role catalog, and the settings every control writes. Plain
 * data only, so a Server Component hands a bundle to the client as it is (FE-006 §4).
 */

export type XY = readonly [number, number];
export type Locale = 'en' | 'de';
/** The roles state (Swing and Roles merged in feedback 08) or the factory. */
export type ViewId = 'roles' | 'factory';
export type Company = 'service' | 'product';
export type Arrivals = 'steady' | 'random';
export type AiQuality = 'worse' | 'same' | 'better';
/** Where AI works: nowhere, everywhere, or at the listed work centers. */
export type AiSet = 'off' | 'all' | readonly string[];
/** How a pile-up looks past the rack: a tumbling heap, a leaning stack or scattered drift. */
export type PileStyle = 'heap' | 'stack' | 'drift';
export type Mechanic = 'rework' | 'churn' | 'complaints';
export type Strength = 'rework' | 'churn';

/** What a finished job creates downstream: `{ to, n }`, `{ to, p }` or `{ choose: [{ to, w }] }`. */
export interface Spawn {
  readonly to?: string;
  readonly n?: number;
  readonly p?: number;
  readonly choose?: readonly { readonly to: string; readonly w?: number }[];
}

/** A work center's dial defaults in the file, or a preset's overrides of them. */
export interface CenterDials {
  readonly efficiency?: number;
  readonly effectiveness?: number;
  readonly fanout?: number;
  readonly ai?: boolean;
  readonly aiSpeed?: number;
  readonly aiExtra?: number;
}

export interface CenterDef {
  readonly id: string;
  readonly role: string;
  readonly at: XY;
  /** [efficiency, effectiveness] at Realistic. */
  readonly realistic?: readonly [number, number];
  readonly spawns: readonly Spawn[];
  readonly inspection?: boolean;
  readonly stampUnderPressure?: number;
  readonly person?: string;
  readonly service?: 'normal' | 'exponential';
  readonly buffer?: number;
  readonly dials?: CenterDials;
  readonly enabled?: readonly string[];
}

export type Chances = Readonly<Record<string, number>>;

export interface CustomerDef {
  readonly at: XY;
  readonly rate: number;
  readonly arrivals?: Arrivals;
  readonly mix: Chances;
  readonly good?: Chances;
  readonly bad?: Chances;
  readonly releases?: readonly string[];
}

/** A preset's or a tour step's changes to the Customer. */
export interface CustomerPatch {
  readonly rate?: number;
  readonly arrivals?: Arrivals;
  readonly mix?: Chances;
  readonly good?: Chances;
  readonly bad?: Chances;
}

/** A tour step's `set`: dials per center, the Customer, where AI works, the reality. */
export interface StepSet {
  readonly dials?: Readonly<Record<string, CenterDials>>;
  readonly customer?: CustomerPatch;
  readonly ai?: AiSet;
  readonly reality?: number;
}

/** One step of a tour, or a check: settings, the week it runs to, the card its caption points at, its claims. */
export interface TourStep {
  readonly set?: StepSet;
  readonly run: number;
  readonly card?: string;
  readonly expect?: Readonly<Record<string, string>>;
}

/** What a state shows by default: the pile-up style and whether the belts move. */
export interface Display {
  readonly pile?: PileStyle;
  readonly beltMotion?: boolean;
}

export interface Preset {
  readonly id: string;
  readonly view?: ViewId;
  readonly reality?: number;
  readonly ai?: AiSet;
  readonly dials?: Readonly<Record<string, CenterDials>>;
  readonly compare?: readonly string[];
  readonly customer?: CustomerPatch;
  readonly start?: 'clear' | 'warm';
  readonly speed?: number;
  /** Weeks of work waiting per work center when the state loads, over the file's `backlog`. */
  readonly backlog?: Readonly<Record<string, number>>;
  readonly display?: Display;
  readonly tour?: readonly TourStep[];
  readonly check?: TourStep;
}

export interface Route {
  readonly out?: 'left' | 'right' | 'top' | 'bottom';
  readonly in?: 'left' | 'right' | 'top' | 'bottom';
  readonly via?: readonly XY[];
  readonly xm?: number;
  readonly ym?: number;
  readonly over?: boolean;
}

export interface Source {
  readonly id: string;
  readonly at: string;
  readonly rate: number;
}

/** A role's master data in the catalog: its glyph, documents handed on per job, how much longer an AI-made one reads. */
export interface RoleDef {
  readonly icon?: string;
  readonly fan: number;
  readonly aiSize?: number;
}

/** The master data of one use case. */
export interface UseCaseData {
  readonly schema?: string;
  readonly id: string;
  readonly panels?: boolean;
  readonly layout: { readonly width: number; readonly height: number; readonly top?: number };
  readonly mechanics?: Partial<Record<Strength, number>>;
  readonly customer: CustomerDef;
  readonly company?: Company;
  readonly sources?: readonly Source[];
  readonly bottleneck?: string;
  /** Weeks of work waiting per work center when a state loads at Realistic (scaled by its reality). */
  readonly backlog?: Readonly<Record<string, number>>;
  /** The pile-up style and belt motion states start with. */
  readonly display?: Display;
  readonly centers: readonly CenterDef[];
  readonly routes?: Readonly<Record<string, Route>>;
  readonly presets: readonly Preset[];
  /** Role master data this use case says differently from the catalog (its AI profile, say). */
  readonly roles?: Readonly<Record<string, Partial<RoleDef>>>;
}

export interface RoleWords {
  readonly title?: string;
  readonly job?: string;
  readonly artefacts?: readonly string[];
  readonly tasks?: readonly string[];
  readonly ai?: readonly string[];
}

export interface ScenarioWords {
  readonly watch?: string;
  readonly steps?: readonly string[];
}

/** A use case's words in one locale: names, belt labels, scenario captions, and any role words it says differently. */
export interface UseCaseWords {
  readonly name?: string;
  readonly sub?: string;
  readonly centers?: Readonly<Record<string, { readonly title?: string }>>;
  readonly belts?: Readonly<Record<string, { readonly label?: string; readonly back?: string }>>;
  readonly customer?: { readonly title?: string; readonly job?: string };
  readonly scenarios?: Readonly<Record<string, ScenarioWords>>;
  readonly presets?: Readonly<Record<string, string>>;
  readonly roles?: Readonly<Record<string, RoleWords>>;
}

/** Everything one use case needs: its master data, the roles it overrides, and its words in both locales. */
export interface Bundle {
  readonly data: UseCaseData;
  /** The role catalog with this use case's overrides on top. */
  readonly roles: Readonly<Record<string, RoleDef>>;
  readonly words: Readonly<Record<Locale, UseCaseWords>>;
  /** `built in`, or the name of the file a visitor uploaded. */
  readonly source: string;
}

/** A work center's dial overrides, as the controls write them. */
export interface Over {
  eff?: number;
  effv?: number;
  fan?: number;
  ai?: boolean;
  aiSpeed?: number;
  aiExtra?: number;
}

/** The Customer at the current settings. */
export interface Cust {
  rate: number;
  mode: Arrivals;
  mix: Record<string, number>;
  good: Record<string, number>;
  bad: Record<string, number>;
}

/** Everything the model reads from the controls: the prototype's settings `S`, without the page's own state. */
export interface Settings {
  preset: string;
  reality: number;
  ai: AiSet;
  aiq: AiQuality;
  company: Company;
  over: Record<string, Over>;
  cust: Cust | null;
  mech: Record<Mechanic, boolean>;
  strength: Partial<Record<Strength, number>>;
}

/** The role catalog's words in one locale: per role, and the names of the presets and scenarios every use case shares. */
export interface CatalogWords {
  readonly roles: Readonly<Record<string, RoleWords>>;
  readonly presets: Readonly<Record<string, string>>;
  readonly scenarios?: Readonly<Record<string, ScenarioWords>>;
}

/** A work center's dials at the current settings. */
export interface Dials {
  readonly eff: number;
  readonly effv: number;
  readonly base: number;
  readonly ai: boolean;
  readonly fan: number;
  readonly aiSpeed: number;
  readonly aiExtra: number;
  readonly fanEff: number;
  readonly effEff: number;
  readonly en: readonly string[];
}
