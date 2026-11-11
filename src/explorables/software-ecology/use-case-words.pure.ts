/*
 * A use case's words in one locale, with the role catalog's as the fallback: a center's title, a belt's label and its
 * sent-back words, the Customer, a preset's name. As the reference build's `W` and `roleWords`, without a global locale.
 */
import type { Bundle, CatalogWords, CenterDef, Locale, RoleWords, UseCaseWords } from './software-ecology.types';

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

/** A belt's label and what comes back on its rework lane; `fallback` is the words' "sent back". */
export const beltWords = (x: WordsIn, key: string, fallback: string): { label: string; back: string } => {
  const w = own(x).belts?.[key] ?? {};
  return { label: w.label ?? '', back: w.back ?? fallback };
};

export const presetName = (x: WordsIn, id: string): string => own(x).presets?.[id] ?? x.catalog.presets[id] ?? id;

/** Every node's title by id: the Customer and each center. */
export const titlesOf = (x: WordsIn): Record<string, string> => ({
  customer: customerTitle(x),
  ...Object.fromEntries(x.B.data.centers.map((c) => [c.id, centerTitle(x, c)])),
});
