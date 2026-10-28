import { parse } from 'yaml';
import configDe from './ai-disciplines.config.de.yml';
import configEn from './ai-disciplines.config.yml';
import type {
  AiDisciplinesPreset,
  AiDisciplinesPresetId,
  AiDisciplinesWords,
  WordsOverride,
} from './ai-disciplines.types';

/*
 * The timeline's data at build time: the config pair of one locale, parsed. Runs on the server only (the config is
 * bundled as text); a Slide reaches it through the server entry.
 */

export interface AiDisciplinesData {
  readonly presets: Readonly<Record<AiDisciplinesPresetId, AiDisciplinesPreset>>;
  readonly words: AiDisciplinesWords;
}

export type AiDisciplinesLocale = 'en' | 'de';

const CONFIGS: Record<AiDisciplinesLocale, string> = { en: configEn, de: configDe };

/** The config pair of a locale, German for `de`, English otherwise. */
export function aiDisciplinesData(locale: string): AiDisciplinesData {
  return parse(CONFIGS[locale === 'de' ? 'de' : 'en']) as AiDisciplinesData;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Every key path of a words tree, sorted, so the two locales can be compared key for key. */
export function keyPaths(tree: unknown, prefix = ''): string[] {
  if (!isRecord(tree)) return [prefix];
  return Object.entries(tree)
    .flatMap(([key, value]) => keyPaths(value, prefix ? `${prefix}.${key}` : key))
    .sort();
}

/** The default words with a Slide's override laid over them, key by key at every depth. */
export function mergeWords(base: AiDisciplinesWords, override: WordsOverride = {}): AiDisciplinesWords {
  return deepMerge(base, override) as AiDisciplinesWords;
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (!isRecord(base) || !isRecord(override)) return override === undefined ? base : override;
  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
  return Object.fromEntries([...keys].map((key) => [key, deepMerge(base[key], override[key])]));
}
