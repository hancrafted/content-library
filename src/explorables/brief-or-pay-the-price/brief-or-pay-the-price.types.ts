import type { Locale } from '@/shared/lib/locale.pure';
import type { ControlMap, Layer } from './controls.types';

export const DEFINITION_IDS = ['price', 'brief', 'brace'] as const;
export type DefinitionId = (typeof DEFINITION_IDS)[number];

export const TRAIT_IDS = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

export const MOVE_IDS = [
  'break-it-down',
  'requirements-first',
  'interview-yourself-with-ai',
  'evaluate-each-step',
  'fresh-start-for-each-piece',
] as const;
export type MoveId = (typeof MOVE_IDS)[number];

export const REQUIREMENT_IDS = [
  'backwards-from-the-goal',
  'resolve-dependencies-early',
  'autonomy-through-intent',
  'contracts-at-the-seams',
  'engineer-trust',
] as const;
export type RequirementId = (typeof REQUIREMENT_IDS)[number];

export const SCENES = ['grill', 'plan', 'parallel', 'check', 'harden', 'draft'] as const;
export type SceneId = (typeof SCENES)[number];

export type RowId = TraitId | MoveId | RequirementId;

export type ViewId = DefinitionId | 'stages';

export type SceneKey = RowId | SceneId;

export const ROW_IDS_OF: Readonly<Record<DefinitionId, readonly RowId[]>> = {
  price: TRAIT_IDS,
  brief: MOVE_IDS,
  brace: REQUIREMENT_IDS,
};

export interface RowStructure {
  readonly id: RowId;
  readonly letter: string;
  readonly beatMilliseconds: number;
}

export interface DefinitionStructure {
  readonly acronym: string;
  readonly wipe?: boolean;
  readonly rows: readonly RowStructure[];
}

export interface RowWords {
  readonly name: string;
  readonly gloss: string;
  readonly short: string;
  readonly freelancer: string;
  readonly ai: string;
}

export interface DefinitionWords {
  readonly title: string;
  readonly heads: {
    readonly freelancer: string;
    readonly middle: string;
    readonly ai: string;
  };
  readonly close: { readonly lead: string; readonly text: string };
  readonly rows: Readonly<Record<string, RowWords>>;
}

export interface HandbookWords {
  readonly first: string;
  readonly second: string;
  readonly last: string;
}

export interface StagesWords {
  readonly tab: string;
  readonly heads: DefinitionWords['heads'];
  readonly close: DefinitionWords['close'];
}

export interface MatrixWords {
  readonly title: string;
  readonly corner: string;
  readonly legend: string;
  readonly counters: string;
  readonly counterLink: string;
  readonly cellTitle: string;
  readonly cellName: string;
  readonly openCell: string;
  readonly problem: string;
  readonly fix: string;
  readonly evidence: string;
  readonly back: string;
  readonly backToMatrix: string;
  readonly previous: string;
  readonly next: string;
  readonly where: string;
  readonly caption: string;
  readonly cellCaption: string;
  readonly cellNameMarked: string;
  readonly cellNameContext: string;
  readonly nodeTitle: string;
  readonly nodeCorner: string;
  readonly ctxLabel: string;
  readonly stage: string;
  readonly inPlay: string;
  readonly backToWorkflow: string;
  readonly nodeCaption: string;
  readonly nodeCellCaption: string;
  readonly linkContext: string;
  readonly inNode: string;
  readonly freelancerSays: string;
  readonly aiSays: string;
  readonly evidenceOf: Readonly<Record<MoveId, string>>;
}

export interface WorkflowWords {
  readonly goal: string;
  readonly thenGoal: string;
  readonly zoomNode: string;
  readonly scenario: string;
  readonly braceSteps: string;
  readonly play: string;
  readonly pause: string;
  readonly previous: string;
  readonly next: string;
  readonly stepLines: Readonly<Record<string, string>>;
}

export const QUESTION_IDS = ['budget', 'signOff', 'lastTime', 'date', 'diet', 'lastYear'] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

export const BOARD_TEAM_IDS = ['activities', 'travel', 'venue', 'food'] as const;
export type BoardTeamId = (typeof BOARD_TEAM_IDS)[number];

export interface LayerWords {
  readonly thoughtExperiment: string;
  readonly freelancer: string;
  readonly habits: string;
  readonly tryIt: string;
}

export interface FreelancerLayerWords {
  readonly title: string;
  readonly text: string;
}

export interface AgentThoughtExperimentWords {
  readonly title: string;
  readonly hire: string;
  readonly day: string;
  readonly task: string;
  readonly questions: Readonly<Record<QuestionId, string>>;
  readonly caption: string;
}

export interface BoardThoughtExperimentWords {
  readonly title: string;
  readonly intro: string;
  readonly teams: Readonly<Record<BoardTeamId, { readonly name: string; readonly note: string }>>;
  readonly seam: string;
  readonly caption: string;
}

export interface ThoughtExperimentWords {
  readonly agent: AgentThoughtExperimentWords;
  readonly board: BoardThoughtExperimentWords;
}

export interface Words {
  readonly layers: LayerWords;
  readonly freelancerLayer: FreelancerLayerWords;
  readonly thoughtExperiment: ThoughtExperimentWords;
  readonly chrome: {
    readonly define: string;
    readonly views: string;
    readonly showAll: string;
    readonly dayOne: string;
    readonly reset: string;
    readonly caption: string;
    readonly turn: string;
    readonly zoom: string;
    readonly agent: string;
    readonly workflow: string;
  };
  readonly workflow: WorkflowWords;
  readonly matrix: MatrixWords;
  readonly backs: {
    readonly prompt: string;
    readonly handbook: string;
    readonly bill: string;
    readonly tokens: string;
    readonly fresh: string;
    readonly handbookWords: HandbookWords;
  };
  readonly stages: StagesWords;
  readonly definitions: Readonly<Record<DefinitionId, DefinitionWords>>;
}

export interface MoveCounters {
  readonly counters: readonly TraitId[];
  readonly source: string;
}

export type { Layer };

export const PRESET_IDS = ['play', 'drive'] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export const LEVEL_IDS = ['define', 'agent', 'workflow'] as const;

export interface Preset {
  readonly view: ViewId;
  readonly level: (typeof LEVEL_IDS)[number];
  readonly scenario: string;
  readonly controls: ControlMap;
  readonly layers: readonly Layer[];
}

export interface Config {
  readonly presets: Readonly<Record<PresetId, Preset>>;
  readonly definitions: Readonly<Record<DefinitionId, DefinitionStructure>>;
  readonly matrix: Readonly<Record<MoveId, MoveCounters>>;
  readonly i18n: Readonly<Record<Locale, Words>>;
}

export interface MirrorRow {
  readonly id: string;
  readonly scene: SceneKey;
  readonly letter: string;
  readonly beatMilliseconds: number;
  readonly words: RowWords;
}

export interface Definition {
  readonly id: ViewId;
  readonly acronym: string;
  readonly wipe: boolean;
  readonly words: DefinitionWords;
  readonly rows: readonly MirrorRow[];
}

export type WordsOverride = DeepPartial<Words>;

type DeepPartial<T> = { readonly [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };
