import type { Locale } from './locale.pure';
import { fillTemplate } from './template.pure';

/*
 * Spoken time, counted from the Voice script (FE-010): a Slide's minutes and
 * each segment's span come from the words a speaker reads, never from a number
 * written beside them. Times stay exact fractions of a minute; only a count
 * shown to the reader is rounded, up, by `wholeMinutes`.
 */

/** Speaking pace per locale: German words run longer, so fewer fit in a minute. */
const WORDS_PER_MINUTE: Readonly<Record<Locale, number>> = { en: 140, de: 120 };

const TAG = /<\/?[a-z][\w-]*>/gi;
/** A word holds at least one letter or digit, so a lone dash or ellipsis is not one. */
const WORD = /[\p{L}\p{N}]/u;

export function wordsIn(text: string): number {
  return text
    .replace(TAG, '')
    .split(/\s+/)
    .filter((token) => WORD.test(token)).length;
}

export interface SpokenSegment {
  readonly script: string;
  /** Read at the segment's close, so it counts toward its span. */
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

/** Minutes as the reader sees them: whole, rounded up so the last minute never reads as zero too early. */
export function wholeMinutes(minutes: number): number {
  // Trim float noise first, so 12.000000001 never reads as 13.
  return Math.ceil(Math.round(minutes * FLOAT_NOISE_STEPS) / FLOAT_NOISE_STEPS);
}

/** Whether an Episode shows a reading time at all: one without a Voice script totals 0 and shows none. */
export function hasReadingTime(totalMinutes: number): boolean {
  return totalMinutes > 0;
}

export type RemainingTemplates = Readonly<Record<'one' | 'other', string>>;

/** "12 min left" in the reader's locale, rounded up so the last minute never reads as zero too early. */
export function remainingLabel(templates: RemainingTemplates, locale: Locale, minutes: number): string {
  // Plurals are resolved here, not by ICU: the count changes on the client, and functions cannot cross
  // the server/client boundary.
  const count = wholeMinutes(minutes);
  const category = new Intl.PluralRules(locale).select(count) === 'one' ? 'one' : 'other';
  return fillTemplate(templates[category], { count });
}
