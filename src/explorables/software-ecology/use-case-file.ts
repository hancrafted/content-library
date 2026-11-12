/*
 * The only module that reads YAML for the software ecology Explorable (design-ADR 0024 §11): the shipped use-case files
 * and their words, the role catalog, and the exchange file a visitor uploads. It returns typed data or its refusals; the
 * zod schemas carry the schema /5 checks as issues, one line each.
 */
import { parse } from 'yaml';
import { z } from 'zod';
import type { Locale, RoleDef, UseCaseData, UseCaseWords } from './software-ecology.types';
import { isMap } from './use-case-checks.pure.ts';
import { dataProblems } from './use-case-network-checks.pure.ts';
import { presetProblems, stateProblems } from './use-case-preset-checks.pure.ts';

type Doc = Record<string, unknown>;

const problemsOf = (doc: unknown, x: { catalog: readonly string[]; exchange: boolean }): string[] => {
  if (!isMap(doc)) return ['The file is not a YAML map.'];
  const out: string[] = [],
    E = (p: string) => void out.push(p);
  const ids = dataProblems(doc, { E, catalog: x.catalog });
  presetProblems(doc.presets, { E, ids });
  if (!x.exchange) return out;
  stateProblems(doc.state, { E, ids });
  const en = isMap(doc.i18n) && isMap(doc.i18n.en) ? doc.i18n.en : {};
  if (typeof en.name !== 'string') E('i18n.en.name: the use case name in English');
  return out;
};

const schemaOf = (x: { catalog: readonly string[]; exchange: boolean }) =>
  z.unknown().superRefine((doc, ctx) => {
    for (const message of problemsOf(doc, x)) ctx.addIssue({ code: 'custom', message });
  });

/** The schema of a shipped use-case file, given the role catalog's role names. */
export const useCaseSchema = (catalog: readonly string[]) => schemaOf({ catalog, exchange: false });
/** The schema of an exchange file: a use case with its words at `i18n` and the saved `state`. */
export const exchangeSchema = (catalog: readonly string[]) => schemaOf({ catalog, exchange: true });

const read = (text: string): unknown => parse(text) as unknown;

/** Swing and Roles merged into the roles state (feedback 08): the retired `swing` id or view reads as `roles`. */
const RETIRED = 'swing';
const ROLES_STATE = 'roles';
const unretired = (v: unknown): unknown => (v === RETIRED ? ROLES_STATE : v);

/** A preset or saved state with `swing` in its id or view, as the roles state. */
const renamed = (x: Doc): Doc => ({
  ...x,
  ...('id' in x ? { id: unretired(x.id) } : {}),
  ...('preset' in x ? { preset: unretired(x.preset) } : {}),
  ...('view' in x ? { view: unretired(x.view) } : {}),
});

/** The presets with `swing` read as `roles`, the first of the same id kept. */
const presetsOf = (presets: unknown): unknown => {
  if (!Array.isArray(presets)) return presets;
  const seen = new Set<unknown>();
  return presets
    .map((x) => (isMap(x) ? renamed(x) : x))
    .filter((x) => !isMap(x) || (seen.has(x.id) ? false : (seen.add(x.id), true)));
};

/** A document of schema /5 with every retired name read as today's. */
const current = (doc: unknown): unknown =>
  isMap(doc)
    ? {
        ...doc,
        ...('presets' in doc ? { presets: presetsOf(doc.presets) } : {}),
        ...(isMap(doc.state) ? { state: renamed(doc.state) } : {}),
      }
    : doc;

/** A shipped use-case file; a broken one throws, naming every problem, so the build fails. */
export const readUseCase = (text: string, catalog: readonly string[]): UseCaseData => {
  const doc = current(read(text)),
    r = useCaseSchema(catalog).safeParse(doc);
  if (!r.success)
    throw new Error(`A shipped use-case file is broken:\n${r.error.issues.map((i) => i.message).join('\n')}`);
  return doc as UseCaseData;
};
/** A shipped words file of a use case. */
export const readWords = (text: string): UseCaseWords => (read(text) ?? {}) as UseCaseWords;
/** The role catalog's master data. */
export const readCatalog = (text: string): Readonly<Record<string, RoleDef>> =>
  (read(text) as { roles: Record<string, RoleDef> }).roles;

export interface Exchange {
  readonly data: UseCaseData;
  readonly words: Readonly<Record<Locale, UseCaseWords>>;
  readonly state: Doc;
}

/** An exchange file, split into its use case, its words per locale and its saved state; its problems; or why it is no YAML. */
export const readExchange = (
  text: string,
  catalog: readonly string[],
): { readonly ok: Exchange } | { readonly problems: readonly string[] } | { readonly unread: string } => {
  let doc: unknown;
  try {
    doc = current(read(text));
  } catch (e) {
    return { unread: (e as Error).message.split('\n')[0] ?? '' };
  }
  const r = exchangeSchema(catalog).safeParse(doc);
  if (!r.success) return { problems: r.error.issues.map((i) => i.message) };
  const { i18n, state, ...data } = doc as Doc;
  const words = i18n as Record<string, UseCaseWords>;
  return {
    ok: {
      data: data as unknown as UseCaseData,
      words: { en: words.en, de: words.de ?? {} },
      state: (state ?? {}) as Doc,
    },
  };
};

/** The Explorable's own words in one locale (`software-ecology.config.yml` or its German twin). */
export const readConfig = <T>(text: string): T => read(text) as T;
