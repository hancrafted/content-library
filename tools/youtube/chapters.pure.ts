// `npm run youtube:chapters`: derives YouTube chapters from the Slide starts and formats them as the description's
// chapter block. Pure; the file the block lives in is `youtube-file.pure.ts`, the shell is `chapters.ts`.
// (The glossary says Section, never "Chapter"; "YouTube chapter" is the line YouTube shows on the timeline.)

/** One YouTube chapter: the second it starts and its title. */
export interface Chapter {
  readonly start: number;
  readonly title: string;
}

/** What the derivation reads: the Episode's composition in one language, and the stored Slide starts. */
export interface ChapterSource {
  /** The Title slide's slug, which precedes the first Section; undefined when the Episode has none. */
  readonly titleSlide?: string;
  /** Each Section's Slide slugs in order; the first is the Section slide. */
  readonly sections: readonly (readonly string[])[];
  /** Slide slug → its title in the recorded language. */
  readonly titles: Readonly<Record<string, string>>;
  /** Slide slug → the second it starts. */
  readonly starts: Readonly<Record<string, number>>;
  /** Chapters Han adds inside a Section, such as a turn mid-Slide; merged with the Section chapters in time order. */
  readonly extraChapters?: readonly Chapter[];
}

/** YouTube shows chapters only from this many on (YouTube Help 9884579). */
export const MIN_CHAPTERS = 3;

export const CHAPTER_START_MARKER = '<!-- chapters:start -->';
export const CHAPTER_END_MARKER = '<!-- chapters:end -->';

/** `M:SS`, or `H:MM:SS` from an hour on, padded the way YouTube's own examples are (`00:00`). */
export function formatTimestamp(seconds: number): string {
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = String(Math.floor((whole % 3600) / 60)).padStart(2, '0');
  const rest = String(whole % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${minutes}:${rest}` : `${minutes}:${rest}`;
}

/** The seconds in a `MM:SS` or `H:MM:SS` timestamp, or undefined when `text` is none. */
export function parseTimestamp(text: string): number | undefined {
  const match = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(text);
  if (!match) return undefined;
  const [, hours = '0', minutes = '0', seconds = '0'] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

/**
 * One chapter per Section, at its first Slide's start, titled with that Slide's title. A Section whose first Slide was
 * not found starts at its first found Slide; one with none has no chapter (`unstartedSections` names it). The first
 * Section also covers the Title slide, so the first chapter starts where the video does. Extra chapters merge in by
 * start.
 */
export function deriveChapters(source: ChapterSource): Chapter[] {
  const extra = (source.extraChapters ?? []).map(({ start, title }) => ({ start: Math.floor(start), title }));
  return [...sectionChapters(source), ...extra].sort((a, b) => a.start - b.start);
}

function isChapter(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const { start, title } = value as Record<string, unknown>;
  const timed = typeof start === 'number' && Number.isFinite(start) && start >= 0;
  return timed && typeof title === 'string' && title.trim() !== '';
}

/** Why `extraChapters` of a Slide starts file is no list of chapters; none when it is one, or absent. */
export function extraChapterProblems(value: unknown): string[] {
  if (value === undefined || (Array.isArray(value) && value.every(isChapter))) return [];
  return ['extraChapters must be a list of {start, title}: a second, 0 or more, and a title'];
}

/** The refusal YouTube would give silently: under `MIN_CHAPTERS` it shows no chapters. Undefined when enough. */
export function tooFewChaptersMessage(chapters: readonly Chapter[]): string | undefined {
  return chapters.length < MIN_CHAPTERS
    ? `needs at least ${MIN_CHAPTERS} YouTube chapters, has ${chapters.length}`
    : undefined;
}

function sectionChapters(source: ChapterSource): Chapter[] {
  const { titleSlide, sections, titles, starts } = source;
  const titleStart = titleSlide === undefined ? undefined : starts[titleSlide];
  return sections.flatMap((slides, index) => {
    const found = slides.find((slug) => starts[slug] !== undefined);
    const first = slides[0];
    if (first === undefined || found === undefined) return [];
    const start = index === 0 ? (titleStart ?? starts[found]) : starts[found];
    return [{ start: Math.floor(start ?? 0), title: titles[first] ?? first }];
  });
}

/** Each Section none of whose Slides has a start, as its number from 1 and its first Slide: it gets no chapter. */
export function unstartedSections(source: ChapterSource): { section: number; slide: string }[] {
  return source.sections.flatMap((slides, index) => {
    const slide = slides[0];
    const started = slides.some((slug) => source.starts[slug] !== undefined);
    return slide === undefined || started ? [] : [{ section: index + 1, slide }];
  });
}

/** The refusal for Sections without a start, undefined when there are none. */
export function unstartedMessage(source: ChapterSource): string | undefined {
  const missing = unstartedSections(source);
  if (missing.length === 0) return undefined;
  const list = missing.map(({ section, slide }) => `Section ${section} ("${slide}")`).join(', ');
  return `${list} has no Slide start, so it would get no YouTube chapter; fix its Slide starts first`;
}

/** The chapter lines, one `timestamp title` per chapter. */
export function chapterLines(chapters: readonly Chapter[]): string[] {
  return chapters.map(({ start, title }) => `${formatTimestamp(start)} ${title}`);
}

/** The chapters as the block between the markers, markers included; the blank line keeps Prettier from rewriting it. */
export function chapterBlock(chapters: readonly Chapter[]): string {
  return [CHAPTER_START_MARKER, '', ...chapterLines(chapters), CHAPTER_END_MARKER].join('\n');
}

/** The chapters in a block's lines, or the lines that are no `timestamp title`. */
export function parseChapterLines(lines: readonly string[]): { chapters: Chapter[]; bad: string[] } {
  const chapters: Chapter[] = [];
  const bad: string[] = [];
  for (const line of lines.filter((candidate) => candidate.trim() !== '')) {
    const match = /^(\S+) (.+)$/.exec(line.trim());
    const start = match?.[1] === undefined ? undefined : parseTimestamp(match[1]);
    if (match?.[2] === undefined || start === undefined) bad.push(line);
    else chapters.push({ start, title: match[2] });
  }
  return { chapters, bad };
}
