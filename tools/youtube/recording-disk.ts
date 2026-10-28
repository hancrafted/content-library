// The disk half of the Recording model: reads an Episode's Recording folder and its composition (Slide order and
// titles) for `validateRecording` and the `youtube:recording` command. Plain node: the composition comes from
// `episodeOutline`, which reads source text, not modules.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { episodeFolders, EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { episodeOutline } from '../../src/pipeline/lib/episode-outline.ts';
import { validateRecording, type Composition, type RecordingFolder, type Violation } from './recording.pure.ts';
import { RECORDING_FOLDER, SPOKEN_LANGUAGES, type SpokenLanguage } from './transcript.pure.ts';

const SLIDE_POOL = 'slide-pool';

/** The text of each file in an Episode folder's Recording folder; empty when it has none. */
export function readRecordingFolder(episodeDir: string): RecordingFolder {
  const dir = path.join(episodeDir, RECORDING_FOLDER);
  if (!existsSync(dir)) return {};
  return Object.fromEntries(readdirSync(dir).map((name) => [name, readFileSync(path.join(dir, name), 'utf8')]));
}

/** The Slides of an Episode folder in composition order: the Title slide, then each Section's Slides. */
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

/** One Slide of the composition with its Section and its title in a language, for the Slide start table. */
export interface SlideRow {
  readonly slug: string;
  /** The Section's number from 1; 0 for the Title slide. */
  readonly section: number;
  readonly title: string;
}

/** Where a Slide's i18n file for a language is: the Episode's own `slides/<slug>/`, else the Slide pool's (shared by every Episode that uses it). */
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

/** A Slide's title in `language`, from its own i18n file or the Slide pool's. */
function slideTitle(dirs: { root: string; episodeDir: string }, slug: string, language: SpokenLanguage): string {
  const found = slideI18nFile(dirs, slug, language);
  const title =
    found === undefined ? undefined : (JSON.parse(readFileSync(found.file, 'utf8')) as { title?: unknown }).title;
  return typeof title === 'string' ? title : slug;
}

/** Every Slide of the Episode folder in composition order, with its Section and its title in `language`. */
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

/** The violations of one Episode folder's Recording folder. */
export function recordingViolations(root: string, episodeDir: string): Violation[] {
  const recording = readRecordingFolder(episodeDir);
  return Object.keys(recording).length === 0 ? [] : validateRecording(compositionOf(root, episodeDir), recording);
}

/** The violations of every Recording folder under `root`, by Episode folder, none for a sound repo. */
export function allRecordingViolations(root: string): { folder: string; violations: Violation[] }[] {
  return episodeFolders(root)
    .map(({ folder, dir }) => ({ folder, violations: recordingViolations(root, dir) }))
    .filter(({ violations }) => violations.length > 0);
}
