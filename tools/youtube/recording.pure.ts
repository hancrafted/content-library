// The Recording model of the post-production tools (`npm run youtube:*`): the schemas of the files in an Episode's
// Recording folder and one validation entry point, `validateRecording`, which `verify` runs over every Recording
// folder. Pure: the shell (`recording.ts`) reads the folder from disk. New Recording files add their rules here.
import {
  chapterLines,
  deriveChapters,
  extraChapterProblems,
  parseChapterLines,
  tooFewChaptersMessage,
  unstartedMessage,
  type Chapter,
} from './chapters.pure.ts';
import { lastChapterProblems, VIDEO_FILE, videoViolations } from './recording-video.pure.ts';
import { chapterBlockLines, parseYoutubeFile, publishedDescription, YOUTUBE_FILE } from './youtube-file.pure.ts';

/** An Episode's Slides in composition order: the Title slide, then each Section's Slides, as Slide slugs. */
export interface Composition {
  readonly slides: readonly string[];
  /** The Title slide's slug, when the Episode has one. */
  readonly titleSlide?: string;
  /** Each Section's Slide slugs in order. */
  readonly sections: readonly (readonly string[])[];
  /** Language → Slide slug → the Slide's title, for the YouTube chapter titles. */
  readonly titles: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

/** The files of a Recording folder: file name (inside `recording/`) → its text. */
export type RecordingFolder = Readonly<Record<string, string>>;

export interface Violation {
  /** The Recording folder file the violation sits in. */
  readonly file: string;
  readonly message: string;
}

/** The content of `slide-starts.<lang>.json`; the Section starts are derived from it, never stored. */
interface SlideStarts {
  readonly videoId: string;
  /** Slide slug → the second it starts. */
  readonly starts: Readonly<Record<string, number>>;
  /** The Slides not found in the recording. */
  readonly unmatched: readonly string[];
  /** The Slides in `starts` whose title was not heard: the start is inferred and Han reviews it. Absent means none. */
  readonly guessed?: readonly string[];
  /** YouTube chapters inside a Section, merged into the Section chapters. Absent means none. */
  readonly extraChapters?: readonly Chapter[];
}

/** YouTube's rules for chapters (YouTube Help 9884579) and descriptions (12948449). */
const MIN_CHAPTER_SECONDS = 10;
const MAX_DESCRIPTION_CHARACTERS = 5000;

const SLIDE_STARTS_FILE = /^slide-starts\.[a-z]{2}\.json$/;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSlugList(value: unknown): boolean {
  return Array.isArray(value) && value.every((slug) => typeof slug === 'string');
}

function startProblems(starts: unknown): string[] {
  if (!isRecord(starts)) return ['starts must be an object of Slide slug → second'];
  return Object.entries(starts)
    .filter(([, second]) => typeof second !== 'number' || !Number.isFinite(second) || second < 0)
    .map(([slug]) => `start of "${slug}" must be a number of seconds, 0 or more`);
}

function shapeProblems(json: Record<string, unknown>): string[] {
  const { videoId, unmatched, guessed, extraChapters } = json;
  const problems = startProblems(json.starts);
  if (typeof videoId !== 'string' || !YOUTUBE_ID.test(videoId)) {
    problems.push('videoId must be an 11-character YouTube id');
  }
  if (!isSlugList(unmatched)) problems.push('unmatched must be a list of Slide slugs');
  if (guessed !== undefined && !isSlugList(guessed)) problems.push('guessed must be a list of Slide slugs');
  problems.push(...extraChapterProblems(extraChapters));
  return problems;
}

/** The Slide starts in `text`, or the reasons it is no Slide starts file. */
function parseSlideStarts(text: string): { value: SlideStarts } | { problems: string[] } {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { problems: ['is not valid JSON'] };
  }
  if (!isRecord(json)) return { problems: ['must be a JSON object {videoId, starts, unmatched}'] };
  const problems = shapeProblems(json);
  return problems.length > 0 ? { problems } : { value: json as unknown as SlideStarts };
}

function unknownSlugs(composition: Composition, { starts, unmatched, guessed = [] }: SlideStarts): string[] {
  const known = new Set(composition.slides);
  return [...Object.keys(starts), ...unmatched, ...guessed]
    .filter((slug) => !known.has(slug))
    .map((slug) => `"${slug}" is not a Slide of the Episode`);
}

function guessProblems(slug: string, { starts, unmatched, guessed = [] }: SlideStarts): string[] {
  if (!guessed.includes(slug)) return [];
  if (unmatched.includes(slug)) return [`"${slug}" is both guessed and unmatched`];
  return starts[slug] === undefined ? [`"${slug}" is guessed but has no start`] : [];
}

function accountingProblems(composition: Composition, slideStarts: SlideStarts): string[] {
  const { starts, unmatched } = slideStarts;
  return composition.slides.flatMap((slug) => {
    const started = starts[slug] !== undefined;
    const lost = unmatched.includes(slug);
    const own = started && lost ? [`"${slug}" is both started and unmatched`] : [];
    return [
      ...guessProblems(slug, slideStarts),
      ...own,
      ...(started || lost ? [] : [`"${slug}" is neither started nor unmatched`]),
    ];
  });
}

function orderProblems(composition: Composition, { starts }: SlideStarts): string[] {
  const started = composition.slides.filter((slug) => starts[slug] !== undefined);
  return started.flatMap((slug, index) => {
    const before = started[index - 1];
    const second = starts[slug] ?? 0;
    const beforeSecond = before === undefined ? undefined : starts[before];
    if (before === undefined || beforeSecond === undefined || second > beforeSecond) return [];
    return [`"${slug}" starts at ${second}s, which must ascend past "${before}" at ${beforeSecond}s`];
  });
}

function slideStartsViolations(composition: Composition, file: string, text: string): Violation[] {
  const parsed = parseSlideStarts(text);
  const messages =
    'problems' in parsed
      ? parsed.problems
      : [
          ...unknownSlugs(composition, parsed.value),
          ...accountingProblems(composition, parsed.value),
          ...orderProblems(composition, parsed.value),
        ];
  return messages.map((message) => ({ file, message }));
}

function chapterRuleProblems(chapters: readonly Chapter[]): string[] {
  const tooFew = tooFewChaptersMessage(chapters);
  const problems: string[] = tooFew === undefined ? [] : [tooFew];
  if (chapters[0] !== undefined && chapters[0].start !== 0) problems.push('the first YouTube chapter must be at 00:00');
  chapters.forEach((chapter, index) => {
    const next = chapters[index + 1];
    if (next === undefined) return;
    if (next.start <= chapter.start) {
      problems.push(`chapter "${next.title}" must ascend past "${chapter.title}"`);
    } else if (next.start - chapter.start < MIN_CHAPTER_SECONDS) {
      problems.push(`chapter "${chapter.title}" must be at least ${MIN_CHAPTER_SECONDS}s long`);
    }
  });
  return problems;
}

function derivedChapters(composition: Composition, language: string, starts: SlideStarts): Chapter[] {
  return deriveChapters({
    ...(composition.titleSlide === undefined ? {} : { titleSlide: composition.titleSlide }),
    sections: composition.sections,
    titles: composition.titles[language] ?? {},
    starts: starts.starts,
    ...(starts.extraChapters === undefined ? {} : { extraChapters: starts.extraChapters }),
  });
}

function sectionProblems(composition: Composition, language: string, recording: RecordingFolder): string[] {
  const startsText = recording[`slide-starts.${language}.json`];
  const parsed = startsText === undefined ? undefined : parseSlideStarts(startsText);
  if (parsed === undefined || 'problems' in parsed) return [];
  const message = unstartedMessage({
    sections: composition.sections,
    titles: {},
    starts: parsed.value.starts,
  });
  return message === undefined ? [] : [message];
}

function stepProblems(
  context: { composition: Composition; language: string; recording: RecordingFolder },
  lines: string[],
): string[] {
  const { composition, language, recording } = context;
  const startsText = recording[`slide-starts.${language}.json`];
  const parsed = startsText === undefined ? undefined : parseSlideStarts(startsText);
  if (parsed === undefined || 'problems' in parsed) {
    return [`needs a valid slide-starts.${language}.json to check its chapter block against`];
  }
  const expected = chapterLines(derivedChapters(composition, language, parsed.value));
  const found = lines.filter((line) => line.trim() !== '');
  return found.join('\n') === expected.join('\n')
    ? []
    : ['the chapter block is out of step with the Slide starts; run `npm run youtube:chapters`'];
}

function youtubeViolations(composition: Composition, recording: RecordingFolder, file: string): Violation[] {
  const language = YOUTUBE_FILE.exec(file)?.[1] ?? '';
  const parsed = parseYoutubeFile(recording[file] ?? '');
  if ('problems' in parsed) return parsed.problems.map((message) => ({ file, message }));
  const description = publishedDescription(parsed.value);
  const lines = chapterBlockLines(parsed.value.description);
  const messages =
    lines === undefined
      ? ['the description has no chapters:start / chapters:end block; run `npm run youtube:chapters`']
      : [
          ...(() => {
            const { chapters, bad } = parseChapterLines(lines);
            return [
              ...bad.map((line) => `chapter line "${line}" is no "MM:SS title"`),
              ...chapterRuleProblems(chapters),
            ];
          })(),
          ...stepProblems({ composition, language, recording }, lines),
          ...lastChapterProblems(parseChapterLines(lines).chapters, recording[`video.${language}.json`]),
          ...sectionProblems(composition, language, recording),
        ];
  if (description.length > MAX_DESCRIPTION_CHARACTERS) {
    messages.push(`the description is ${description.length} characters, YouTube allows ${MAX_DESCRIPTION_CHARACTERS}`);
  }
  return messages.map((message) => ({ file, message }));
}

/** Every rule the Recording folder of an Episode with this `composition` breaks, none when it is sound. */
export function validateRecording(composition: Composition, recording: RecordingFolder): Violation[] {
  const files = Object.keys(recording);
  return [
    ...files
      .filter((file) => SLIDE_STARTS_FILE.test(file))
      .flatMap((file) => slideStartsViolations(composition, file, recording[file] ?? '')),
    ...files.filter((file) => VIDEO_FILE.test(file)).flatMap((file) => videoViolations(file, recording[file] ?? '')),
    ...files
      .filter((file) => YOUTUBE_FILE.test(file))
      .flatMap((file) => youtubeViolations(composition, recording, file)),
  ];
}
