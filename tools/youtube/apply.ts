// `npm run youtube:apply -- <episode folder | page url> [--lang en|de] [--dry-run] [--force]`: writes the Episode's
// `recording/youtube.<lang>.md` to its YouTube video (description update, pinned-comment post) and stores the posted
// comment's ID and the fingerprint of the sent description in that file. It refuses a description edited on YouTube
// since its last apply unless `--force`. `--dry-run` reads the remote state and prints the plan, writing nothing.
// Exits non-zero on any refusal, so a CI job can call it. Pure half: `apply.pure.ts`; setup of the credentials: tools/youtube/AGENTS.md.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { descriptionFingerprint, planApply } from './apply.pure.ts';
import { commandArgs, fail, recordingLanguage, resolvedEpisode, REPO_ROOT as ROOT } from './command.ts';
import { pickVideo, youtubeVideoId } from './episode-resolver.pure.ts';
import { readRecordingFolder, recordingViolations } from './recording-disk.ts';
import { RECORDING_FOLDER } from './transcript.pure.ts';
import { connectFromEnv } from './youtube-connection.ts';
import { parseYoutubeFile, serializeYoutubeFile, youtubeFileName } from './youtube-file.pure.ts';

const {
  input,
  dryRun,
  force,
  language: requested,
} = commandArgs('npm run youtube:apply -- <episode folder | page url> [--lang en|de] [--dry-run] [--force]');
const client = await connectFromEnv();

const { episode, dir } = await resolvedEpisode(input);
const language = recordingLanguage(requested, dir);
const violations = recordingViolations(ROOT, dir);
if (violations.length > 0) {
  for (const { file, message } of violations) console.error(`${file}: ${message}`);
  fail(`${episode.id}: the Recording folder fails validation; fix it before applying`);
}
const video = pickVideo(episode, language, youtubeVideoId(input));
if (!video.ok) fail(video.reason);
const videoId = video.videoId;

const name = youtubeFileName(language);
const text = readRecordingFolder(dir)[name];
if (text === undefined) fail(`${episode.id} has no recording/${name}`);
const parsed = parseYoutubeFile(text);
if ('problems' in parsed) fail(`${name}: ${parsed.problems.join('; ')}`);
const file = parsed.value;

const snippet = await client.readSnippet(videoId);
const plan = planApply(file, snippet.description, { force });
if (plan.description.action === 'refuse')
  fail(`${episode.id} (${language}), video ${videoId}: ${plan.description.reason}`);
if (plan.description.action === 'update' && file.appliedFingerprint === undefined) {
  console.warn(
    'warning: no applied fingerprint stored, so a Studio edit cannot be told apart; run `npm run youtube:pull` first',
  );
}

console.log(`${episode.id} (${language}), video ${videoId}${dryRun ? ', dry run: nothing is written' : ''}`);
console.log(`description: ${plan.description.action}`);
if (plan.description.action === 'update') console.log(`--- new description ---\n${plan.description.text}\n---`);
console.log(`comment: ${plan.comment.action}${plan.comment.action === 'none' ? ` (${plan.comment.reason})` : ''}`);
if (plan.comment.action === 'post') console.log(`--- comment ---\n${plan.comment.text}\n---`);
if (dryRun) process.exit(0);

if (plan.description.action === 'update') await client.updateDescription(videoId, snippet, plan.description.text);
// Fingerprint what YouTube stores, read back after the write: YouTube may normalise the text it was sent.
const shown =
  plan.description.action === 'update' ? (await client.readSnippet(videoId)).description : snippet.description;
let next = { ...file, appliedFingerprint: descriptionFingerprint(shown) };
if (plan.comment.action === 'post') {
  const commentId = await client.postComment(videoId, plan.comment.text);
  console.log(`posted comment ${commentId}`);
  console.log('Pin the comment in YouTube Studio: the API has no method to pin it.');
  next = { ...next, commentId };
}
const stored = serializeYoutubeFile(next);
if (stored !== text) {
  writeFileSync(path.join(dir, RECORDING_FOLDER, name), stored);
  console.log(`updated recording/${name}: commit it through a PR so the next apply knows what it sent`);
}
