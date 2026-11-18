import configSource from './brief-or-pay-the-price.config.yml';
import type { Definition, DefinitionId, Locale, Words, WordsOverride } from './brief-or-pay-the-price.types';
import { mergeWords, parseConfig } from './config.pure';

export interface ExplorableData {
  readonly locale: Locale;
  readonly words: Words;
  readonly definitions: Readonly<Record<DefinitionId, Definition>>;
}

const config = parseConfig(configSource);

export const localeOf = (locale: string): Locale => (locale === 'de' ? 'de' : 'en');

export function explorableData(locale: string, override?: WordsOverride): ExplorableData {
  const chosen = localeOf(locale);
  const words = mergeWords(config.i18n[chosen], override);
  const definitionOf = (id: DefinitionId): Definition => ({
    id,
    acronym: config.definitions[id].acronym,
    words: words.definitions[id],
    rows: config.definitions[id].rows.map((row) => ({ ...row, words: words.definitions[id].rows[row.id] })),
  });
  return { locale: chosen, words, definitions: { price: definitionOf('price') } };
}

export const configOf = () => config;
