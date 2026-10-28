// `npm run youtube:chapters -- <episode folder | page url | video id> [--lang de]`: derives the YouTube chapters (one
// per Section) from the Slide starts and writes them into `recording/youtube.<lang>.md` between the chapter markers,
// creating the file if missing and rewriting only the block if not. Pure halves: `chapters.pure.ts`, `youtube-file.pure.ts`.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { chapterBlock, deriveChapters } from './chapters.pure.ts';
import { loadEpisodeEntries } from './episode-index.ts';
import { resolveEpisode } from './episode-resolver.pure.ts';
import { compositionOf, readRecordingFolder } from './recording-disk.ts';
import { parseSpokenLanguage, RECORDING_FOLDER } from './transcript.pure.ts';
import { parseYoutubeFile, serializeYoutubeFile, withChapterBlock, youtubeFileName } from './youtube-file.pure.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const args = process.argv.slice(2);
const langAt = args.indexOf('--lang');
const language = parseSpokenLanguage(langAt === -1 ? 'de' : (args[langAt + 1] ?? ''));
const input = args.find((arg, index) => !arg.startsWith('--') && (langAt === -1 || index !== langAt + 1));
if (!input || !language)
  fail('usage: npm run youtube:chapters -- <episode folder | page url | video id> [--lang en|de]');

const resolution = resolveEpisode(input, await loadEpisodeEntries(ROOT));
if (!resolution.ok) fail(resolution.reason);
const dir = path.join(ROOT, EPISODES_DIR, resolution.episode.folder);
const recording = readRecordingFolder(dir);
const startsText = recording[`slide-starts.${language}.json`];
if (startsText === undefined) fail(`no slide-starts.${language}.json; run /episode-match-slide-starts first`);

const composition = compositionOf(ROOT, dir);
const { starts } = JSON.parse(startsText) as { starts: Record<string, number> };
const chapters = deriveChapters({
  ...(composition.titleSlide === undefined ? {} : { titleSlide: composition.titleSlide }),
  sections: composition.sections,
  titles: composition.titles[language] ?? {},
  starts,
});
const block = chapterBlock(chapters);

const name = youtubeFileName(language);
const existing = recording[name];
const parsed = existing === undefined ? undefined : parseYoutubeFile(existing);
if (parsed && 'problems' in parsed) fail(`${name}: ${parsed.problems.join('; ')}`);
const file = parsed?.value ?? { description: '', pinnedComment: '', commentId: '' };
const next = serializeYoutubeFile({ ...file, description: withChapterBlock(file.description, block) });

const target = path.join(dir, RECORDING_FOLDER, name);
if (!existsSync(path.dirname(target))) mkdirSync(path.dirname(target), { recursive: true });
if (!existsSync(target) || readFileSync(target, 'utf8') !== next) writeFileSync(target, next);
console.log(`${path.relative(ROOT, target)}\n${block}`);
