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

export interface Composition {
  readonly slides: readonly string[];
  readonly titleSlide?: string;
  readonly sections: readonly (readonly string[])[];
  readonly titles: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

export type RecordingFolder = Readonly<Record<string, string>>;

export interface Violation {
  readonly file: string;
  readonly message: string;
}

interface SlideStarts {
  readonly videoId: string;
  readonly starts: Readonly<Record<string, number>>;
  readonly unmatched: readonly string[];
  readonly guessed?: readonly string[];
  readonly extraChapters?: readonly Chapter[];
}

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
