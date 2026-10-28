// `npm run youtube:voice-script`: the pure half — the transcript read as timed lines, cut into a window per Slide,
// and the reading time of a Voice script. The shell (`voice-script.ts`) reads the disk; the judgment (the rewrite)
// is `/episode-transcript-to-voice-script`.
import type { SpokenLanguage } from './transcript.pure.ts';

export interface Cue {
  /** Seconds into the video at which the line first appears. */
  readonly start: number;
  readonly text: string;
}

/** Spoken words per minute (design-ADR 0002). `src/shared/lib/speaking-time.pure.ts` holds the site's copy; tools cannot import it under plain node, so change both together. */
const WORDS_PER_MINUTE: Readonly<Record<SpokenLanguage, number>> = { en: 140, de: 120 };

const TIMING = /^(\d+):(\d\d):(\d\d)\.(\d{3}) -->/;
const INLINE_TAG = /<[^>]*>/g;

/**
 * The lines of YouTube's rolling auto-captions, each once. A cue repeats the previous line and adds a new one with
 * inline word timings (`<00:00:01.959>`); only the line with those tags is new, so the repeats drop out.
 */
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

/**
 * The transcript text of each Slide: the lines from its start up to the next matched start. A Slide with no start
 * (unmatched) gets no speech, and the Slide before it runs on to the next matched start.
 */
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

/** The spoken words of Voice script texts, rich-text tags stripped, counted as the site counts them. */
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

/** Minutes the Voice script texts take to read at the language's pace, unrounded. */
export function readingMinutes(texts: readonly string[], language: SpokenLanguage): number {
  return spokenWords(texts) / WORDS_PER_MINUTE[language];
}
