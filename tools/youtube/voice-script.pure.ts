// decision: docs/adr/0002-reading-time-from-voice-script.md
import type { SpokenLanguage } from './transcript.pure.ts';

export interface Cue {
  readonly start: number;
  readonly text: string;
}

export const WORDS_PER_MINUTE: Readonly<Record<SpokenLanguage, number>> = { en: 140, de: 120 };

const TIMING = /^(\d+):(\d\d):(\d\d)\.(\d{3}) -->/;
const INLINE_TAG = /<[^>]*>/g;

export function parseCues(vtt: string): Cue[] {
  const cues: Cue[] = [];
  let start: number | undefined;
  for (const line of vtt.split('\n')) {
    const timing = TIMING.exec(line);
    if (timing) {
      start = Number(timing[1]) * 3600 + Number(timing[2]) * 60 + Number(timing[3]) + Number(timing[4]) / 1000;
    } else if (start !== undefined && /<\d+:\d\d:\d\d\.\d{3}>/.test(line)) {
      const text = line.replace(INLINE_TAG, '').replace(/\s+/g, ' ').trim();
      if (text !== '') cues.push({ start, text });
    }
  }
  return cues;
}

export function cutBySlide(
  cues: readonly Cue[],
  slides: readonly string[],
  starts: Readonly<Record<string, number>>,
): Record<string, string> {
  const matched = slides.filter((slug) => starts[slug] !== undefined);
  const windows = new Map(
    matched.map((slug, index) => [slug, [starts[slug] ?? 0, starts[matched[index + 1] ?? ''] ?? Infinity]]),
  );
  return Object.fromEntries(
    slides.map((slug) => {
      const [from = 0, to = 0] = windows.get(slug) ?? [];
      const text = cues
        .filter(({ start }) => windows.has(slug) && start >= from && start < to)
        .map(({ text: line }) => line)
        .join(' ');
      return [slug, text];
    }),
  );
}

const TAG = /<\/?[a-z][\w-]*>/gi;
const WORD = /[\p{L}\p{N}]/u;

export function spokenWords(texts: readonly string[]): number {
  return texts.reduce(
    (sum, text) =>
      sum +
      text
        .replace(TAG, '')
        .split(/\s+/)
        .filter((token) => WORD.test(token)).length,
    0,
  );
}

export function readingMinutes(texts: readonly string[], language: SpokenLanguage): number {
  return spokenWords(texts) / WORDS_PER_MINUTE[language];
}
