export const LOCALES = ['en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFINITION_IDS = ['price'] as const;
export type DefinitionId = (typeof DEFINITION_IDS)[number];

export const TRAIT_IDS = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

export interface RowStructure {
  readonly id: TraitId;
  readonly letter: string;
  readonly beatMilliseconds: number;
}

export interface DefinitionStructure {
  readonly acronym: string;
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
  readonly heads: { readonly freelancer: string; readonly traits: string; readonly ai: string };
  readonly close: { readonly lead: string; readonly text: string };
  readonly rows: Readonly<Record<TraitId, RowWords>>;
}

export interface HandbookWords {
  readonly first: string;
  readonly second: string;
  readonly last: string;
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
    readonly handbookWords: HandbookWords;
  };
  readonly definitions: Readonly<Record<DefinitionId, DefinitionWords>>;
}

export interface Config {
  readonly definitions: Readonly<Record<DefinitionId, DefinitionStructure>>;
  readonly i18n: Readonly<Record<Locale, Words>>;
}

export interface Definition {
  readonly id: DefinitionId;
  readonly acronym: string;
  readonly words: DefinitionWords;
  readonly rows: readonly (RowStructure & { readonly words: RowWords })[];
}

export type WordsOverride = DeepPartial<Words>;

type DeepPartial<T> = { readonly [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };
