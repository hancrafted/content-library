import type { Locale } from './locale.pure';
import { fillTemplate } from './template.pure';

// decision: FE-010 §3
const WORDS_PER_MINUTE: Readonly<Record<Locale, number>> = { en: 140, de: 120 };

const TAG = /<\/?[a-z][\w-]*>/gi;
const WORD = /[\p{L}\p{N}]/u;

export function wordsIn(text: string): number {
  return text
    .replace(TAG, '')
    .split(/\s+/)
    .filter((token) => WORD.test(token)).length;
}

export interface SpokenSegment {
  readonly script: string;
  readonly bridge?: string;
}

export interface Span {
  readonly from: number;
  readonly to: number;
}

export function segmentSpans(segments: readonly SpokenSegment[], locale: Locale): Span[] {
  const spans: Span[] = [];
  for (const { script, bridge = '' } of segments) {
    const from = spans.at(-1)?.to ?? 0;
    spans.push({ from, to: from + (wordsIn(script) + wordsIn(bridge)) / WORDS_PER_MINUTE[locale] });
  }
  return spans;
}

const FLOAT_NOISE_STEPS = 1e6;

export function wholeMinutes(minutes: number): number {
  return Math.ceil(Math.round(minutes * FLOAT_NOISE_STEPS) / FLOAT_NOISE_STEPS);
}

export function hasReadingTime(totalMinutes: number): boolean {
  return totalMinutes > 0;
}

export type RemainingTemplates = Readonly<Record<'one' | 'other', string>>;

export function remainingLabel(templates: RemainingTemplates, locale: Locale, minutes: number): string {
  const count = wholeMinutes(minutes);
  const category = new Intl.PluralRules(locale).select(count) === 'one' ? 'one' : 'other';
  return fillTemplate(templates[category], { count });
}
