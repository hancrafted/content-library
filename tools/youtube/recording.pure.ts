// The Recording model of the post-production tools (`npm run youtube:*`): the schemas of the files in an Episode's
// Recording folder and one validation entry point, `validateRecording`, which `verify` runs over every Recording
// folder. Pure: the shell (`recording.ts`) reads the folder from disk. New Recording files add their rules here.

/** An Episode's Slides in composition order: the Title slide, then each Section's Slides, as Slide slugs. */
export interface Composition {
  readonly slides: readonly string[];
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
}

const SLIDE_STARTS_FILE = /^slide-starts\.[a-z]{2}\.json$/;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function startProblems(starts: unknown): string[] {
  if (!isRecord(starts)) return ['starts must be an object of Slide slug → second'];
  return Object.entries(starts)
    .filter(([, second]) => typeof second !== 'number' || !Number.isFinite(second) || second < 0)
    .map(([slug]) => `start of "${slug}" must be a number of seconds, 0 or more`);
}

function shapeProblems(json: Record<string, unknown>): string[] {
  const { videoId, unmatched } = json;
  const problems = startProblems(json.starts);
  if (typeof videoId !== 'string' || !YOUTUBE_ID.test(videoId)) {
    problems.push('videoId must be an 11-character YouTube id');
  }
  if (!Array.isArray(unmatched) || unmatched.some((slug) => typeof slug !== 'string')) {
    problems.push('unmatched must be a list of Slide slugs');
  }
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

function unknownSlugs(composition: Composition, { starts, unmatched }: SlideStarts): string[] {
  const known = new Set(composition.slides);
  return [...Object.keys(starts), ...unmatched]
    .filter((slug) => !known.has(slug))
    .map((slug) => `"${slug}" is not a Slide of the Episode`);
}

function accountingProblems(composition: Composition, { starts, unmatched }: SlideStarts): string[] {
  return composition.slides.flatMap((slug) => {
    const started = starts[slug] !== undefined;
    const lost = unmatched.includes(slug);
    if (started && lost) return [`"${slug}" is both started and unmatched`];
    return started || lost ? [] : [`"${slug}" is neither started nor unmatched`];
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

/** Every rule the Recording folder of an Episode with this `composition` breaks, none when it is sound. */
export function validateRecording(composition: Composition, recording: RecordingFolder): Violation[] {
  return Object.entries(recording)
    .filter(([file]) => SLIDE_STARTS_FILE.test(file))
    .flatMap(([file, text]) => slideStartsViolations(composition, file, text));
}
