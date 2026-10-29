// `npm run youtube:transcript -- <youtube url | video id | episode folder | page url>`: asks which language was
// spoken, fetches YouTube's captions in it with yt-dlp, and stores them unedited in the Episode's Recording folder.
// Pure half: `transcript.pure.ts`; the Episode lookup: `episode-resolver.pure.ts`.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { fail, resolvedEpisode, REPO_ROOT as ROOT } from './command.ts';
import { pickVideo, youtubeVideoId } from './episode-resolver.pure.ts';
import {
  captionFile,
  parseDuration,
  parseSpokenLanguage,
  RECORDING_FOLDER,
  transcriptFile,
  videoFile,
  videoFileText,
  ytDlpArgs,
  ytDlpDurationArgs,
} from './transcript.pure.ts';

const input = process.argv[2];
if (!input) fail('usage: npm run youtube:transcript -- <youtube url | video id | episode folder | page url>');

const { episode } = await resolvedEpisode(input);

const prompt = createInterface({ input: process.stdin, output: process.stdout });
const answer = await prompt.question(`Which language was spoken in the recording of ${episode.id} (en or de)? `);
prompt.close();
const language = parseSpokenLanguage(answer);
if (!language) fail(`expected en or de, got "${answer.trim()}"`);
const video = pickVideo(episode, language, youtubeVideoId(input));
if (!video.ok) fail(video.reason);
const videoId = video.videoId;

const work = mkdtempSync(path.join(tmpdir(), 'youtube-transcript-'));
try {
  const run = spawnSync('yt-dlp', ytDlpArgs(videoId, language, work), { stdio: ['ignore', 'inherit', 'inherit'] });
  if (run.error) fail(`could not run yt-dlp: ${run.error.message}`);
  const caption = captionFile(readdirSync(work), videoId, language);
  if (!caption) {
    fail(`YouTube has no ${language} captions for ${videoId} yet; retry later (no other transcript source is used)`);
  }
  const duration = spawnSync('yt-dlp', ytDlpDurationArgs(videoId), { encoding: 'utf8' });
  const seconds = parseDuration(duration.stdout ?? '');
  if (seconds === undefined) fail(`yt-dlp reported no length for ${videoId}: ${duration.stderr ?? ''}`);
  const target = path.join(ROOT, EPISODES_DIR, episode.folder, transcriptFile(language));
  mkdirSync(path.join(ROOT, EPISODES_DIR, episode.folder, RECORDING_FOLDER), { recursive: true });
  copyFileSync(path.join(work, caption), target);
  writeFileSync(path.join(ROOT, EPISODES_DIR, episode.folder, videoFile(language)), videoFileText(videoId, seconds));
  console.log(`wrote ${path.relative(ROOT, target)} and ${videoFile(language)} (${seconds}s)`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
