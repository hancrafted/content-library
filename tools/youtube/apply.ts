// `npm run youtube:apply -- <episode folder | page url> [--lang en|de] [--dry-run]`: writes the Episode's
// `recording/youtube.<lang>.md` to its YouTube video (description update, pinned-comment post) and stores the posted
// comment's ID in that file. `--dry-run` reads the remote state and prints the plan, writing nothing. Exits non-zero
// on any refusal, so a CI job can call it. Pure half: `apply.pure.ts`; setup of the credentials: tools/youtube/AGENTS.md.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { envProblem, parseCredentials, planApply } from './apply.pure.ts';
import { commandArgs, fail, recordingLanguage, resolvedEpisode, REPO_ROOT as ROOT } from './command.ts';
import { pickVideo, youtubeVideoId } from './episode-resolver.pure.ts';
import { readRecordingFolder, recordingViolations } from './recording-disk.ts';
import { RECORDING_FOLDER } from './transcript.pure.ts';
import { connect } from './youtube-client.ts';
import { parseYoutubeFile, serializeYoutubeFile, youtubeFileName } from './youtube-file.pure.ts';

const ENV_FILE = '.env';

function git(...args: string[]): boolean {
  return spawnSync('git', args, { cwd: ROOT, stdio: 'ignore' }).status === 0;
}

const {
  input,
  dryRun,
  language: requested,
} = commandArgs('npm run youtube:apply -- <episode folder | page url> [--lang en|de] [--dry-run]');

const envPath = path.join(ROOT, ENV_FILE);
const problem = envProblem({
  exists: existsSync(envPath),
  tracked: git('ls-files', '--error-unmatch', ENV_FILE),
  ignored: git('check-ignore', '-q', ENV_FILE),
});
if (problem) fail(problem);
const credentials = parseCredentials(readFileSync(envPath, 'utf8'));
if ('missing' in credentials) fail(`.env lacks ${credentials.missing.join(', ')}`);

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

const client = await connect(credentials.value);
const snippet = await client.readSnippet(videoId);
const plan = planApply(file, snippet.description);

console.log(`${episode.id} (${language}), video ${videoId}${dryRun ? ', dry run: nothing is written' : ''}`);
console.log(`description: ${plan.description.action}`);
if (plan.description.action === 'update') console.log(`--- new description ---\n${plan.description.text}\n---`);
console.log(`comment: ${plan.comment.action}${plan.comment.action === 'none' ? ` (${plan.comment.reason})` : ''}`);
if (plan.comment.action === 'post') console.log(`--- comment ---\n${plan.comment.text}\n---`);
if (dryRun) process.exit(0);

if (plan.description.action === 'update') await client.updateDescription(videoId, snippet, plan.description.text);
if (plan.comment.action === 'post') {
  const commentId = await client.postComment(videoId, plan.comment.text);
  console.log(`posted comment ${commentId}`);
  writeFileSync(path.join(dir, RECORDING_FOLDER, name), serializeYoutubeFile({ ...file, commentId }));
  console.log('Pin the comment in YouTube Studio: the API has no method to pin it.');
}
