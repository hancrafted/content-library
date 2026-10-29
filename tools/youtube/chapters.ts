// `npm run youtube:chapters -- <episode folder | page url | video id> [--lang de]`: derives the YouTube chapters (one
// per Section) from the Slide starts and writes them into `recording/youtube.<lang>.md` between the chapter markers,
// creating the file if missing and rewriting only the block if not. Pure halves: `chapters.pure.ts`, `youtube-file.pure.ts`.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chapterBlock, deriveChapters, unstartedMessage } from './chapters.pure.ts';
import { commandArgs, fail, recordingLanguage, resolvedEpisode, REPO_ROOT as ROOT } from './command.ts';
import { compositionOf, readRecordingFolder } from './recording-disk.ts';
import { RECORDING_FOLDER } from './transcript.pure.ts';
import { parseYoutubeFile, serializeYoutubeFile, withChapterBlock, youtubeFileName } from './youtube-file.pure.ts';

const { input, language: requested } = commandArgs(
  'npm run youtube:chapters -- <episode folder | page url | video id> [--lang en|de]',
);

const { dir } = await resolvedEpisode(input);
const language = recordingLanguage(requested, dir);
const recording = readRecordingFolder(dir);
const startsText = recording[`slide-starts.${language}.json`];
if (startsText === undefined) fail(`no slide-starts.${language}.json; run /episode-match-slide-starts first`);

const composition = compositionOf(ROOT, dir);
const { starts } = JSON.parse(startsText) as { starts: Record<string, number> };
const source = {
  ...(composition.titleSlide === undefined ? {} : { titleSlide: composition.titleSlide }),
  sections: composition.sections,
  titles: composition.titles[language] ?? {},
  starts,
};
const unstarted = unstartedMessage(source);
if (unstarted) fail(unstarted);
const chapters = deriveChapters(source);
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
