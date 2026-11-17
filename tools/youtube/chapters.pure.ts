export interface Chapter {
  readonly start: number;
  readonly title: string;
}

export interface ChapterSource {
  readonly titleSlide?: string;
  readonly sections: readonly (readonly string[])[];
  readonly titles: Readonly<Record<string, string>>;
  readonly starts: Readonly<Record<string, number>>;
  readonly extraChapters?: readonly Chapter[];
}

export const MIN_CHAPTERS = 3;

export const CHAPTER_START_MARKER = '<!-- chapters:start -->';
export const CHAPTER_END_MARKER = '<!-- chapters:end -->';

export function formatTimestamp(seconds: number): string {
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = String(Math.floor((whole % 3600) / 60)).padStart(2, '0');
  const rest = String(whole % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${minutes}:${rest}` : `${minutes}:${rest}`;
}

export function parseTimestamp(text: string): number | undefined {
  const match = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(text);
  if (!match) return undefined;
  const [, hours = '0', minutes = '0', seconds = '0'] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

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

export function extraChapterProblems(value: unknown): string[] {
  if (value === undefined || (Array.isArray(value) && value.every(isChapter))) return [];
  return ['extraChapters must be a list of {start, title}: a second, 0 or more, and a title'];
}

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

export function unstartedSections(source: ChapterSource): { section: number; slide: string }[] {
  return source.sections.flatMap((slides, index) => {
    const slide = slides[0];
    const started = slides.some((slug) => source.starts[slug] !== undefined);
    return slide === undefined || started ? [] : [{ section: index + 1, slide }];
  });
}

export function unstartedMessage(source: ChapterSource): string | undefined {
  const missing = unstartedSections(source);
  if (missing.length === 0) return undefined;
  const list = missing.map(({ section, slide }) => `Section ${section} ("${slide}")`).join(', ');
  return `${list} has no Slide start, so it would get no YouTube chapter; fix its Slide starts first`;
}

export function chapterLines(chapters: readonly Chapter[]): string[] {
  return chapters.map(({ start, title }) => `${formatTimestamp(start)} ${title}`);
}

export function chapterBlock(chapters: readonly Chapter[]): string {
  return [CHAPTER_START_MARKER, '', ...chapterLines(chapters), CHAPTER_END_MARKER].join('\n');
}

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
