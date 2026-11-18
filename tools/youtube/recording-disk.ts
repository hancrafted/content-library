import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { episodeFolders, EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { episodeOutline, type OutlineSlide } from '../../src/episodes/lib/episode-outline.ts';
import { validateRecording, type Composition, type RecordingFolder, type Violation } from './recording.pure.ts';
import { RECORDING_FOLDER, SPOKEN_LANGUAGES, type SpokenLanguage } from './transcript.pure.ts';

export function readRecordingFolder(episodeDir: string): RecordingFolder {
  const dir = path.join(episodeDir, RECORDING_FOLDER);
  if (!existsSync(dir)) return {};
  return Object.fromEntries(readdirSync(dir).map((name) => [name, readFileSync(path.join(dir, name), 'utf8')]));
}

function outlineOf(root: string, episodeDir: string) {
  return episodeOutline(path.relative(path.join(root, EPISODES_DIR), episodeDir));
}

export function compositionOf(root: string, episodeDir: string): Composition {
  const outline = outlineOf(root, episodeDir);
  const titleOf = (language: SpokenLanguage) =>
    Object.fromEntries(slideRows(root, episodeDir, language).map(({ slug, title }) => [slug, title]));
  return {
    slides: [...(outline.title === undefined ? [] : [outline.title.slug]), ...outline.sections.flat().map(slugOf)],
    ...(outline.title === undefined ? {} : { titleSlide: outline.title.slug }),
    sections: outline.sections.map((section) => section.map(slugOf)),
    titles: Object.fromEntries(SPOKEN_LANGUAGES.map((language) => [language, titleOf(language)])),
  };
}

export interface SlideRow {
  readonly slug: string;
  readonly section: number;
  readonly title: string;
}

const slugOf = ({ slug }: { slug: string }): string => slug;

function slideI18nFile(
  root: string,
  slide: OutlineSlide,
  language: SpokenLanguage,
): { file: string; pool: boolean } | undefined {
  const file = path.join(root, slide.textSource, `${language}.json`);
  return existsSync(file) ? { file, pool: slide.pool } : undefined;
}

function slideTitle(root: string, slide: OutlineSlide, language: SpokenLanguage): string {
  const found = slideI18nFile(root, slide, language);
  const title =
    found === undefined ? undefined : (JSON.parse(readFileSync(found.file, 'utf8')) as { title?: unknown }).title;
  return typeof title === 'string' ? title : slide.slug;
}

export interface SlideRow {
  readonly slug: string;
  readonly section: number;
  readonly title: string;
  readonly i18n: { file: string; pool: boolean } | undefined;
}

export function slideRows(root: string, episodeDir: string, language: SpokenLanguage): SlideRow[] {
  const outline = outlineOf(root, episodeDir);
  const row = (slide: OutlineSlide, section: number): SlideRow => ({
    slug: slide.slug,
    section,
    title: slideTitle(root, slide, language),
    i18n: slideI18nFile(root, slide, language),
  });
  return [
    ...(outline.title === undefined ? [] : [row(outline.title, 0)]),
    ...outline.sections.flatMap((slides, index) => slides.map((slide) => row(slide, index + 1))),
  ];
}

export function recordingViolations(root: string, episodeDir: string): Violation[] {
  const recording = readRecordingFolder(episodeDir);
  return Object.keys(recording).length === 0 ? [] : validateRecording(compositionOf(root, episodeDir), recording);
}

export function allRecordingViolations(root: string): { folder: string; violations: Violation[] }[] {
  return episodeFolders(root)
    .map(({ folder, dir }) => ({ folder, violations: recordingViolations(root, dir) }))
    .filter(({ violations }) => violations.length > 0);
}
