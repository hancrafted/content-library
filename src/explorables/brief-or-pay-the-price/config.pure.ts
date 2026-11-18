import { parse } from 'yaml';
import {
  DEFINITION_IDS,
  LOCALES,
  TRAIT_IDS,
  type Config,
  type DefinitionId,
  type Locale,
  type Words,
  type WordsOverride,
} from './brief-or-pay-the-price.types';

export type ConfigResult = { readonly config: Config } | { readonly problems: readonly string[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function keyPaths(tree: unknown, prefix = ''): string[] {
  if (!isRecord(tree)) return [prefix];
  return Object.entries(tree)
    .flatMap(([key, value]) => keyPaths(value, prefix ? `${prefix}.${key}` : key))
    .sort();
}

function stringsAt(tree: unknown, prefix = ''): [string, unknown][] {
  if (!isRecord(tree)) return [[prefix, tree]];
  return Object.entries(tree).flatMap(([key, value]) => stringsAt(value, prefix ? `${prefix}.${key}` : key));
}

function valueProblems(row: Record<string, unknown>, at: string): string[] {
  const letter = typeof row.letter === 'string' && row.letter.length === 1;
  const beat = typeof row.beatMilliseconds === 'number' && row.beatMilliseconds > 0;
  return [
    ...(letter ? [] : [`${at}: letter is one character`]),
    ...(beat ? [] : [`${at}: beatMilliseconds is a positive number`]),
  ];
}

function oneRowProblems(row: unknown, at: string, seen: Set<string>): string[] {
  if (!isRecord(row)) return [`${at}: needs id, letter and beatMilliseconds`];
  const problems: string[] = [];
  const id = String(row.id);
  if (!(TRAIT_IDS as readonly string[]).includes(id))
    problems.push(`${at}: id "${id}" is not one of ${TRAIT_IDS.join(', ')}`);
  else if (seen.has(id)) problems.push(`${at}: id "${id}" appears twice`);
  seen.add(id);
  return [...problems, ...valueProblems(row, at)];
}

function rowProblems(definition: unknown, id: string): string[] {
  if (!isRecord(definition) || typeof definition.acronym !== 'string' || !Array.isArray(definition.rows))
    return [`definitions.${id}: needs an acronym and a list of rows`];
  const seen = new Set<string>();
  return definition.rows.flatMap((row: unknown, index) =>
    oneRowProblems(row, `definitions.${id}.rows[${index}]`, seen),
  );
}

function structureProblems(definitions: unknown): string[] {
  if (!isRecord(definitions)) return ['definitions: missing'];
  const ids = Object.keys(definitions);
  const unknown = ids.filter((id) => !(DEFINITION_IDS as readonly string[]).includes(id));
  const missing = DEFINITION_IDS.filter((id) => !ids.includes(id));
  return [
    ...unknown.map((id) => `definitions.${id}: not a definition of this Explorable`),
    ...missing.map((id) => `definitions.${id}: missing`),
    ...ids.flatMap((id) => rowProblems(definitions[id], id)),
  ];
}

function rowWordsProblems(config: Record<string, unknown>, locale: Locale): string[] {
  const { definitions, i18n } = config;
  if (!isRecord(definitions) || !isRecord(i18n) || !isRecord(i18n[locale])) return [];
  const words = i18n[locale].definitions;
  return DEFINITION_IDS.flatMap((id: DefinitionId) => {
    const definition = definitions[id];
    const own = isRecord(words) && isRecord(words[id]) ? words[id] : null;
    const rows = isRecord(definition) && Array.isArray(definition.rows) ? definition.rows : [];
    if (own === null) return [`i18n.${locale}.definitions.${id}: missing`];
    const described = isRecord(own.rows) ? Object.keys(own.rows) : [];
    const ids = rows.flatMap((row: unknown) => (isRecord(row) && typeof row.id === 'string' ? [row.id] : []));
    return [
      ...ids
        .filter((row) => !described.includes(row))
        .map((row) => `i18n.${locale}.definitions.${id}.rows.${row}: missing`),
      ...described
        .filter((row) => !ids.includes(row))
        .map((row) => `i18n.${locale}.definitions.${id}.rows.${row}: names no row`),
    ];
  });
}

function localeProblems(i18n: unknown): string[] {
  if (!isRecord(i18n)) return ['i18n: missing'];
  const missing = LOCALES.filter((locale) => !isRecord(i18n[locale]));
  const extra = Object.keys(i18n).filter((locale) => !(LOCALES as readonly string[]).includes(locale));
  if (missing.length > 0 || extra.length > 0)
    return [
      ...missing.map((locale) => `i18n.${locale}: missing`),
      ...extra.map((locale) => `i18n.${locale}: not a locale`),
    ];
  const [first, second] = LOCALES.map((locale) => keyPaths(i18n[locale]));
  const only = (from: string[], other: string[]) => from.filter((path) => !other.includes(path));
  return [
    ...only(first, second).map((path) => `i18n.de.${path}: missing, English has it`),
    ...only(second, first).map((path) => `i18n.en.${path}: missing, German has it`),
  ];
}

function emptyOutsideEnglishGlossProblems(i18n: unknown): string[] {
  if (!isRecord(i18n)) return [];
  return LOCALES.flatMap((locale) =>
    stringsAt(i18n[locale])
      .filter(
        ([path, value]) => typeof value !== 'string' || (value === '' && !(locale === 'en' && path.endsWith('.gloss'))),
      )
      .map(([path]) => `i18n.${locale}.${path}: needs words`),
  );
}

export function loadConfig(source: string): ConfigResult {
  let doc: unknown;
  try {
    doc = parse(source);
  } catch (error) {
    return { problems: [`the file is not valid YAML: ${error instanceof Error ? error.message : String(error)}`] };
  }
  if (!isRecord(doc)) return { problems: ['the file is not a mapping'] };
  const problems = [
    ...structureProblems(doc.definitions),
    ...localeProblems(doc.i18n),
    ...emptyOutsideEnglishGlossProblems(doc.i18n),
    ...LOCALES.flatMap((locale) => rowWordsProblems(doc, locale)),
  ];
  return problems.length > 0 ? { problems } : { config: doc as unknown as Config };
}

export function parseConfig(source: string): Config {
  const result = loadConfig(source);
  if ('problems' in result) throw new Error(`brief-or-pay-the-price config:\n${result.problems.join('\n')}`);
  return result.config;
}

export function mergeWords(base: Words, override: WordsOverride = {}): Words {
  return deepMerge(base, override) as Words;
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (!isRecord(base) || !isRecord(override)) return override === undefined ? base : override;
  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
  return Object.fromEntries([...keys].map((key) => [key, deepMerge(base[key], override[key])]));
}
