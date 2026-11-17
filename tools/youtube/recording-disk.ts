import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { episodeFolders, EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { episodeOutline } from '../../src/pipeline/lib/episode-outline.ts';
import { validateRecording, type Composition, type RecordingFolder, type Violation } from './recording.pure.ts';
import { RECORDING_FOLDER, SPOKEN_LANGUAGES, type SpokenLanguage } from './transcript.pure.ts';

const SLIDE_POOL = 'slide-pool';

export function readRecordingFolder(episodeDir: string): RecordingFolder {
  const dir = path.join(episodeDir, RECORDING_FOLDER);
  if (!existsSync(dir)) return {};
  return Object.fromEntries(readdirSync(dir).map((name) => [name, readFileSync(path.join(dir, name), 'utf8')]));
}

export function compositionOf(root: string, episodeDir: string): Composition {
  const outline = episodeOutline(episodeDir);
  const titleOf = (language: SpokenLanguage) =>
    Object.fromEntries(slideRows(root, episodeDir, language).map(({ slug, title }) => [slug, title]));
  return {
    slides: [...(outline.title === undefined ? [] : [outline.title]), ...outline.sections.flat()],
    ...(outline.title === undefined ? {} : { titleSlide: outline.title }),
    sections: outline.sections,
    titles: Object.fromEntries(SPOKEN_LANGUAGES.map((language) => [language, titleOf(language)])),
  };
}

export interface SlideRow {
  readonly slug: string;
  readonly section: number;
  readonly title: string;
}

export function slideI18nFile(
  dirs: { root: string; episodeDir: string },
  slug: string,
  language: SpokenLanguage,
): { file: string; pool: boolean } | undefined {
  const own = path.join(dirs.episodeDir, 'slides', slug, 'i18n', `${language}.json`);
  if (existsSync(own)) return { file: own, pool: false };
  const pooled = path.join(dirs.root, EPISODES_DIR, SLIDE_POOL, slug, 'i18n', `${language}.json`);
  return existsSync(pooled) ? { file: pooled, pool: true } : undefined;
}

function slideTitle(dirs: { root: string; episodeDir: string }, slug: string, language: SpokenLanguage): string {
  const found = slideI18nFile(dirs, slug, language);
  const title =
    found === undefined ? undefined : (JSON.parse(readFileSync(found.file, 'utf8')) as { title?: unknown }).title;
  return typeof title === 'string' ? title : slug;
}

export function slideRows(root: string, episodeDir: string, language: SpokenLanguage): SlideRow[] {
  const outline = episodeOutline(episodeDir);
  const row = (slug: string, section: number): SlideRow => ({
    slug,
    section,
    title: slideTitle({ root, episodeDir }, slug, language),
  });
  return [
    ...(outline.title === undefined ? [] : [row(outline.title, 0)]),
    ...outline.sections.flatMap((slides, index) => slides.map((slug) => row(slug, index + 1))),
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
