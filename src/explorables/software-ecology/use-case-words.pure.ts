import type {
  Bundle,
  CatalogWords,
  CenterDef,
  Locale,
  Preset,
  RoleWords,
  ScenarioWords,
  UseCaseWords,
} from './software-ecology.types';

export interface WordsIn {
  readonly B: Bundle;
  readonly locale: Locale;
  readonly catalog: CatalogWords;
}

const own = (x: WordsIn): UseCaseWords => x.B.words[x.locale] ?? {};

export const roleWords = (x: WordsIn, role: string): RoleWords => ({
  ...(x.catalog.roles[role] ?? {}),
  ...(own(x).roles?.[role] ?? {}),
});

export const useCaseName = (x: WordsIn): string => own(x).name ?? x.B.data.id;
export const useCaseSub = (x: WordsIn): string => own(x).sub ?? '';

export const centerTitle = (x: WordsIn, c: Pick<CenterDef, 'id' | 'role'>): string =>
  own(x).centers?.[c.id]?.title ?? roleWords(x, c.role).title ?? c.id;

export const customerTitle = (x: WordsIn): string =>
  own(x).customer?.title ?? roleWords(x, 'customer').title ?? 'Customer';

export const beltWords = (x: WordsIn, key: string, fallback: string): { label: string; back: string } => {
  const w = own(x).belts?.[key] ?? {};
  return { label: w.label ?? '', back: w.back ?? fallback };
};

export const presetName = (x: WordsIn, id: string): string => own(x).presets?.[id] ?? x.catalog.presets[id] ?? id;

export const titlesOf = (x: WordsIn): Record<string, string> => ({
  customer: customerTitle(x),
  ...Object.fromEntries(x.B.data.centers.map((c) => [c.id, centerTitle(x, c)])),
});

export const customerJob = (x: WordsIn): string => own(x).customer?.job ?? roleWords(x, 'customer').job ?? '';

export const scenarioWords = (x: WordsIn, id: string): ScenarioWords =>
  own(x).scenarios?.[id] ?? x.catalog.scenarios?.[id] ?? {};

const claimOf = (p: Preset, i: number): string => p.tour?.[i]?.claim ?? '';
export const beatCaption = (x: WordsIn, p: Preset, i: number): string => {
  const w = scenarioWords(x, p.id),
    line = w.steps?.[i];
  return line ?? w.claims?.[claimOf(p, i)] ?? '';
};
