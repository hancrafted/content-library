import { parse } from 'yaml';
import configDe from './ai-capability.config.de.yml';
import configEn from './ai-capability.config.yml';
import type {
  AiCapabilityPreset,
  AiCapabilityPresetId,
  AiCapabilityWords,
  Ceiling,
  WordsOverride,
} from './ai-capability.types';
import type { Level } from './scene-frames.pure';

/*
 * The timeline's data at build time: the config pair of one locale, parsed. Runs on the server only (the config is
 * bundled as text); a Slide reaches it through the server entry.
 */

export interface AiCapabilityData {
  readonly presets: Readonly<Record<AiCapabilityPresetId, AiCapabilityPreset>>;
  readonly words: AiCapabilityWords;
  /** The numbers behind the Ceiling row, per Level: the same in both locales. */
  readonly ceilings: Readonly<Record<Level, Ceiling>>;
}

export type AiCapabilityLocale = 'en' | 'de';

const CONFIGS: Record<AiCapabilityLocale, string> = { en: configEn, de: configDe };

/** The config pair of a locale, German for `de`, English otherwise. */
export function aiCapabilityData(locale: string): AiCapabilityData {
  return parse(CONFIGS[locale === 'de' ? 'de' : 'en']) as AiCapabilityData;
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
export function mergeWords(base: AiCapabilityWords, override: WordsOverride = {}): AiCapabilityWords {
  return deepMerge(base, override) as AiCapabilityWords;
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (!isRecord(base) || !isRecord(override)) return override === undefined ? base : override;
  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
  return Object.fromEntries([...keys].map((key) => [key, deepMerge(base[key], override[key])]));
}
