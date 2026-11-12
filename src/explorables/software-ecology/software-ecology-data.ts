/*
 * The Explorable's data at build time (FE-012 §1): its own words and the role catalog's words in the path locale,
 * picked through static imports, and the shipped use cases. Runs on the server; the client gets plain data.
 */
import rolesDe from './roles.words.de.yml';
import rolesEn from './roles.words.yml';
import type { Words, WordsOverride } from './software-ecology-words.types';
import configDe from './software-ecology.config.de.yml';
import configEn from './software-ecology.config.yml';
import type { CatalogWords, Locale } from './software-ecology.types';
import { BUILTIN, builtinBundle } from './use-case-data.ts';
import { readConfig } from './use-case-file.ts';

const CONFIG = { en: configEn, de: configDe } as const;
const CATALOG_WORDS = { en: rolesEn, de: rolesDe } as const;

export const localeOf = (locale: string): Locale => (locale === 'de' ? 'de' : 'en');

const isMap = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** `base` with every key `over` names replaced, map by map. */
const merged = (base: unknown, over: unknown): unknown =>
  isMap(base) && isMap(over)
    ? Object.fromEntries(Object.entries(base).map(([k, v]) => [k, k in over ? merged(v, over[k]) : v]))
    : (over ?? base);

/** The Explorable's words in a locale, English for any other, with a Slide's overrides on top. */
export const wordsFor = (locale: string, override?: WordsOverride): Words =>
  merged(readConfig<Words>(CONFIG[localeOf(locale)]), override) as Words;

export const catalogWordsFor = (locale: string): CatalogWords =>
  readConfig<CatalogWords>(CATALOG_WORDS[localeOf(locale)]);

/** Every shipped use case, in picker order. */
export const builtinBundles = () => BUILTIN.map((id) => builtinBundle(id));
