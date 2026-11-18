import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/lib/locale.pure';
import configSource from './brief-or-pay-the-price.config.yml';
import {
  DEFINITION_IDS,
  type Definition,
  type DefinitionId,
  type RowWords,
  type Words,
  type WordsOverride,
} from './brief-or-pay-the-price.types';
import { CONFIG_FILE, mergeWords, parseConfig } from './config.pure';

export interface ExplorableData {
  readonly locale: Locale;
  readonly words: Words;
  readonly definitions: Readonly<Record<DefinitionId, Definition>>;
}

const config = parseConfig(configSource);

function rowWords(words: Words, id: DefinitionId, row: string): RowWords {
  const found = words.definitions[id].rows[row];
  if (found === undefined) throw new Error(`${CONFIG_FILE}: no words for ${id} row ${row}`);
  return found;
}

export function explorableData(locale: string, override?: WordsOverride): ExplorableData {
  const chosen = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const words = mergeWords(config.i18n[chosen], override);
  const definitionOf = (id: DefinitionId): Definition => ({
    id,
    acronym: config.definitions[id].acronym,
    wipe: config.definitions[id].wipe === true,
    words: words.definitions[id],
    rows: config.definitions[id].rows.map((row) => ({
      ...row,
      words: rowWords(words, id, row.id),
    })),
  });
  const definitions = Object.fromEntries(DEFINITION_IDS.map((id) => [id, definitionOf(id)])) as Record<
    DefinitionId,
    Definition
  >;
  return { locale: chosen, words, definitions };
}
