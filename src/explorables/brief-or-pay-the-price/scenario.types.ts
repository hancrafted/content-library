import type { MoveId, SceneId, TraitId } from './brief-or-pay-the-price.types';

export const LETTERS = ['B', 'R', 'A', 'C', 'E'] as const;
export type Letter = (typeof LETTERS)[number];

export const MARK_KINDS = ['intent', 'chunks', 'check'] as const;
export type MarkKind = (typeof MARK_KINDS)[number];

export const SCENARIO_LOCALES = ['en', 'de'] as const;
export type ScenarioLocale = (typeof SCENARIO_LOCALES)[number];

export interface Cell {
  readonly id: string;
  readonly move: MoveId;
  readonly trait: TraitId;
}

export interface Stage {
  readonly id: string;
  readonly scene: SceneId;
}

export interface ScenarioNode {
  readonly id: string;
  readonly stage: string;
  readonly cells: readonly Cell[];
}

export interface Edge {
  readonly from: string;
  readonly to: string;
}

export type Annotation =
  | {
      readonly type: 'highlight';
      readonly nodes?: readonly string[];
      readonly edges?: readonly string[];
      readonly stages?: readonly string[];
      readonly goal?: boolean;
    }
  | {
      readonly type: 'arrow';
      readonly from: string;
      readonly to: string;
      readonly route: 'under' | 'over';
      readonly text: string;
    }
  | {
      readonly type: 'group';
      readonly nodes: readonly string[];
      readonly text: string;
    }
  | { readonly type: 'tag'; readonly node: string; readonly text: string }
  | { readonly type: 'chip'; readonly edge: string; readonly text: string }
  | {
      readonly type: 'mark';
      readonly nodes: readonly string[];
      readonly kind: MarkKind;
    };

export interface StageWords {
  readonly name: string;
  readonly short: string;
  readonly analogy: string;
  readonly ai: string;
}

export interface ScenarioWords {
  readonly title: string;
  readonly stages: Readonly<Record<string, StageWords>>;
  readonly nodes: Readonly<Record<string, { readonly label: string; readonly role: string }>>;
  readonly cells: Readonly<Record<string, { readonly freelancer: string; readonly ai: string }>>;
  readonly annotations: Readonly<Record<string, string>>;
}

export interface ScenarioFile {
  readonly id: string;
  readonly acronym?: string;
  readonly stages: readonly Stage[];
  readonly nodes: readonly ScenarioNode[];
  readonly edges: readonly Edge[];
  readonly annotations?: Readonly<Partial<Record<Letter, readonly Annotation[]>>>;
  readonly i18n: Readonly<Record<ScenarioLocale, ScenarioWords>>;
}

export type Orientation = 'horizontal' | 'vertical';

export interface Box {
  readonly cx: number;
  readonly cy: number;
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

export interface StageBand {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly lx: number;
  readonly ly: number;
  readonly anchor: 'middle' | 'start';
}

export interface NodeRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly cx: number;
  readonly cy: number;
}

export interface GoalCircle {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}

export interface EdgeMid {
  readonly x: number;
  readonly y: number;
  readonly room: number;
}

export interface LaidOutEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly d: string;
  readonly mid: EdgeMid;
  readonly arrow: boolean;
}

export interface Layout {
  readonly orient: Orientation;
  readonly w: number;
  readonly h: number;
  readonly stages: readonly StageBand[];
  readonly nodes: Readonly<Record<string, NodeRect>>;
  readonly goal: GoalCircle;
  readonly edges: readonly LaidOutEdge[];
  readonly box: (id: string) => Box;
  readonly lanes: { readonly under: number; readonly over: number };
}

export interface Scenario extends ScenarioFile {
  readonly file: string;
  readonly layouts: Readonly<Record<Orientation, Layout>>;
}

export type ScenarioResult = { readonly scenario: Scenario } | { readonly problems: readonly string[] };
