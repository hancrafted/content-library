// `npm run youtube:transcript -- <youtube url | video id | episode folder | page url>`: asks which language was
// spoken, fetches YouTube's captions in it with yt-dlp, and stores them unedited in the Episode's Recording folder.
// Pure half: `transcript.pure.ts`; the Episode lookup: `episode-resolver.pure.ts`.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { loadEpisodeEntries } from './episode-index.ts';
import { resolveEpisode, youtubeVideoId } from './episode-resolver.pure.ts';
import { captionFile, parseSpokenLanguage, RECORDING_FOLDER, transcriptFile, ytDlpArgs } from './transcript.pure.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const input = process.argv[2];
if (!input) fail('usage: npm run youtube:transcript -- <youtube url | video id | episode folder | page url>');

const resolution = resolveEpisode(input, await loadEpisodeEntries(ROOT));
if (!resolution.ok) fail(resolution.reason);
const { episode } = resolution;
const videoId = youtubeVideoId(input) ?? episode.videoIds[0];
if (!videoId) fail(`${episode.id} declares no video; run /episode-add-youtube first`);
if (episode.videoIds.length > 1 && !youtubeVideoId(input)) {
  fail(`${episode.id} declares several videos (${episode.videoIds.join(', ')}); pass the video's YouTube URL`);
}

const prompt = createInterface({ input: process.stdin, output: process.stdout });
const answer = await prompt.question(`Which language was spoken in ${videoId} (en or de)? `);
prompt.close();
const language = parseSpokenLanguage(answer);
if (!language) fail(`expected en or de, got "${answer.trim()}"`);

const work = mkdtempSync(path.join(tmpdir(), 'youtube-transcript-'));
try {
  const run = spawnSync('yt-dlp', ytDlpArgs(videoId, language, work), { stdio: ['ignore', 'inherit', 'inherit'] });
  if (run.error) fail(`could not run yt-dlp: ${run.error.message}`);
  const caption = captionFile(readdirSync(work), videoId, language);
  if (!caption) {
    fail(`YouTube has no ${language} captions for ${videoId} yet; retry later (no other transcript source is used)`);
  }
  const target = path.join(ROOT, EPISODES_DIR, episode.folder, transcriptFile(language));
  mkdirSync(path.join(ROOT, EPISODES_DIR, episode.folder, RECORDING_FOLDER), { recursive: true });
  copyFileSync(path.join(work, caption), target);
  console.log(`wrote ${path.relative(ROOT, target)}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
