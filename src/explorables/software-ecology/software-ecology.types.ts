// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-006 §4
import type { BadChances, Catch, Defect, KindChances } from './defect.types';
import type { Arrivals, OwnSet, Source } from './own-work.types';
import type { AiSet, CenterDials, Chances, CustomerPatch, TourStep } from './scenario.types';

export type { BadChances, Catch, Defect, KindChances } from './defect.types';
export type { Arrivals, OwnSet, Source } from './own-work.types';
export type { AiSet, CenterDials, Chances, CustomerPatch, StepSet, TourStep } from './scenario.types';
export type XY = readonly [number, number];
export type Locale = 'en' | 'de';
export type ViewId = 'roles' | 'factory';
export type Company = 'service' | 'product';
export type AiQuality = 'worse' | 'same' | 'better';
export type PileStyle = 'heap' | 'stack' | 'drift';
export type Mechanic = 'rework' | 'churn' | 'complaints';
export type Strength = 'rework' | 'churn';
export type Constant = 'inspect' | 'redo' | 'keepExtra' | 'maxBounces' | 'pressure';
export type MechKey = Strength | Constant;

export interface Spawn {
  readonly to?: string;
  readonly n?: number;
  readonly p?: number;
  readonly choose?: readonly { readonly to: string; readonly w?: number }[];
}

export interface CenterDef {
  readonly id: string;
  readonly role: string;
  readonly at: XY;
  readonly realistic?: readonly [number, number];
  readonly spawns: readonly Spawn[];
  readonly inspection?: boolean;
  readonly stampUnderPressure?: number;
  readonly person?: string;
  readonly service?: 'normal' | 'exponential';
  readonly buffer?: number;
  readonly dials?: CenterDials;
  readonly enabled?: readonly string[];
  readonly catch?: Catch;
  readonly origin?: Defect;
  readonly stall?: { readonly at: number; readonly slow: number };
  readonly escalate?: { readonly to: string; readonly underPressure: number };
}

export interface CustomerDef {
  readonly at: XY;
  readonly rate: number;
  readonly arrivals?: Arrivals;
  readonly mix: Chances;
  readonly good?: Chances;
  readonly bad?: BadChances;
  readonly releases?: readonly string[];
}

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
  readonly menu?: boolean;
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

export interface RoleDef {
  readonly icon?: string;
  readonly fan: number;
  readonly aiSize?: number;
  readonly origin?: Defect;
  readonly aiCatch?: number;
}

export interface UseCaseData {
  readonly schema?: string;
  readonly id: string;
  readonly panels?: boolean;
  readonly layout: { readonly width: number; readonly height: number; readonly top?: number };
  readonly mechanics?: Partial<Record<MechKey, number>>;
  readonly customer: CustomerDef;
  readonly company?: Company;
  readonly sources?: readonly Source[];
  readonly bottleneck?: string;
  readonly backlog?: Readonly<Record<string, number>>;
  readonly display?: Display;
  readonly centers: readonly CenterDef[];
  readonly routes?: Readonly<Record<string, Route>>;
  readonly presets: readonly Preset[];
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
  readonly claims?: Readonly<Record<string, string>>;
}

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

export interface Bundle {
  readonly data: UseCaseData;
  readonly roles: Readonly<Record<string, RoleDef>>;
  readonly words: Readonly<Record<Locale, UseCaseWords>>;
  readonly source: string;
}

export interface Over {
  eff?: number;
  effv?: number;
  fan?: number;
  ai?: boolean;
  aiSpeed?: number;
  aiExtra?: number;
}

export interface Cust {
  rate: number;
  mode: Arrivals;
  mix: Record<string, number>;
  good: Record<string, number>;
  bad: KindChances;
}

export interface Settings {
  preset: string;
  reality: number;
  ai: AiSet;
  aiq: AiQuality;
  company: Company;
  over: Record<string, Over>;
  own: Record<string, OwnSet>;
  cust: Cust | null;
  mech: Record<Mechanic, boolean>;
  strength: Partial<Record<Strength, number>>;
  consts: Partial<Record<Constant, number>>;
}

export interface CatalogWords {
  readonly roles: Readonly<Record<string, RoleWords>>;
  readonly presets: Readonly<Record<string, string>>;
  readonly scenarios?: Readonly<Record<string, ScenarioWords>>;
}

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
