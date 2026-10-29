// `npm run youtube:pull -- <episode folder | page url> [--lang en|de]`: prints how the video's live description and
// pinned comment differ from `recording/youtube.<lang>.md`, as a word diff. Writes nothing: the diff is input for the
// Learn branch of /episode-author-youtube-metadata, and the repo stays the source (design-ADR 0020). Pure half:
// `pull.pure.ts`.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { commandArgs, fail, recordingLanguage, resolvedEpisode } from './command.ts';
import { pickVideo, youtubeVideoId } from './episode-resolver.pure.ts';
import { comparePull, type PartComparison } from './pull.pure.ts';
import { readRecordingFolder } from './recording-disk.ts';
import { connectFromEnv } from './youtube-connection.ts';
import { parseYoutubeFile, youtubeFileName } from './youtube-file.pure.ts';

const { input, language: requested } = commandArgs(
  'npm run youtube:pull -- <episode folder | page url> [--lang en|de]',
);
const client = await connectFromEnv();

const { episode, dir } = await resolvedEpisode(input);
const language = recordingLanguage(requested, dir);
const video = pickVideo(episode, language, youtubeVideoId(input));
if (!video.ok) fail(video.reason);
const name = youtubeFileName(language);
const text = readRecordingFolder(dir)[name];
if (text === undefined) fail(`${episode.id} has no recording/${name}`);
const parsed = parseYoutubeFile(text);
if ('problems' in parsed) fail(`${name}: ${parsed.problems.join('; ')}`);
const file = parsed.value;

const snippet = await client.readSnippet(video.videoId);
const comment = file.commentId === '' ? undefined : await client.readComment(file.commentId);
const comparison = comparePull(file, { description: snippet.description, comment });

/** The word diff of one part, repo copy against YouTube, through git's own differ. */
function wordDiff(label: string, part: PartComparison, verdict: string): void {
  if (!part.edited) {
    console.log(`${label}: same on YouTube and in the repo`);
    return;
  }
  const scratch = mkdtempSync(path.join(tmpdir(), 'youtube-pull-'));
  try {
    writeFileSync(path.join(scratch, 'repo'), `${part.repo}\n`);
    writeFileSync(path.join(scratch, 'youtube'), `${part.youtube}\n`);
    const diff = spawnSync('git', ['diff', '--no-index', '--word-diff=plain', '--no-color', 'repo', 'youtube'], {
      cwd: scratch,
      encoding: 'utf8',
    });
    console.log(`${label}: ${verdict} ([-repo-] {+YouTube+})`);
    const lines = diff.stdout.split('\n');
    console.log(lines.slice(lines.findIndex((line) => line.startsWith('@@')) + 1).join('\n'));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

console.log(`${episode.id} (${language}), video ${video.videoId}: read-only, nothing is written`);
const VERDICTS = {
  none: '',
  youtube: 'edited on YouTube since the last apply: input for Learn',
  repo: 'changed in the repo, not yet applied: no YouTube edit',
  unknown: 'differs; no applied fingerprint stored, so the side that changed is unknown',
} as const;
wordDiff('description', comparison.description, VERDICTS[comparison.descriptionChange]);
if (file.commentId !== '' && comment === undefined) console.log(`comment: ${file.commentId} not found on YouTube`);
else wordDiff('comment', comparison.comment, 'differs from the repo; ask Han whether he edited it on YouTube');
