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
}

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
 * not found starts at its first found Slide; one with none is left out. The first Section also covers the Title slide,
 * so the first chapter starts where the video does.
 */
export function deriveChapters(source: ChapterSource): Chapter[] {
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
