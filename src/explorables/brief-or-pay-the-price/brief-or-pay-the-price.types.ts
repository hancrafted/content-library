import type { Locale } from '@/shared/lib/locale.pure';

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

export interface Words {
  readonly chrome: {
    readonly define: string;
    readonly views: string;
    readonly showAll: string;
    readonly dayOne: string;
    readonly caption: string;
    readonly turn: string;
  };
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

export interface Config {
  readonly definitions: Readonly<Record<DefinitionId, DefinitionStructure>>;
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

type DeepPartial<T> = {
  readonly [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]>;
};
