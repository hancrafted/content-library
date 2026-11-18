import { mergeOverride } from '@/shared/lib/override-merge.pure';
import { parse } from 'yaml';
import configDe from './ai-capability.config.de.yml';
import configEn from './ai-capability.config.yml';
import type {
  AiCapabilityPreset,
  AiCapabilityPresetId,
  AiCapabilityWords,
  LayerRow,
  LayerSpan,
  Productivity,
  WordsOverride,
} from './ai-capability.types';
import type { Level } from './scene-frames.pure';

export interface AiCapabilityData {
  readonly presets: Readonly<Record<AiCapabilityPresetId, AiCapabilityPreset>>;
  readonly words: AiCapabilityWords;
  readonly productivity: Readonly<Record<Level, Productivity>>;
  readonly layers: Readonly<Record<LayerRow, readonly LayerSpan[]>>;
}

export type AiCapabilityLocale = 'en' | 'de';

const CONFIGS: Record<AiCapabilityLocale, string> = { en: configEn, de: configDe };

export function aiCapabilityData(locale: string): AiCapabilityData {
  return parse(CONFIGS[locale === 'de' ? 'de' : 'en']) as AiCapabilityData;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function keyPaths(tree: unknown, prefix = ''): string[] {
  if (!isRecord(tree)) return [prefix];
  return Object.entries(tree)
    .flatMap(([key, value]) => keyPaths(value, prefix ? `${prefix}.${key}` : key))
    .sort();
}

export function mergeWords(base: AiCapabilityWords, override: WordsOverride = {}): AiCapabilityWords {
  return mergeOverride(base, override);
}
