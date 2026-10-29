// `npm run youtube:voice-script -- <episode folder | page url | video id> [--lang de]`: the reading copy for
// `/episode-transcript-to-voice-script`. Per Slide in composition order it prints the Slide's i18n file (flagged
// `pool` when the Slide is the Slide pool's, shared), its window in the recording, its Voice script segments as
// authored, the transcript text of the window, and the Voice script's reading time; then the Episode's total.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { commandArgs, fail, recordingLanguage, resolvedEpisode, REPO_ROOT as ROOT } from './command.ts';
import { readRecordingFolder, slideI18nFile, slideRows } from './recording-disk.ts';
import { cutBySlide, parseCues, readingMinutes, spokenWords } from './voice-script.pure.ts';

interface Messages {
  voiceScript?: { segments?: Record<string, { title?: string; script?: string; bridge?: string }> } | null;
}

const { input, language: requested } = commandArgs(
  'npm run youtube:voice-script -- <episode folder | page url | video id> [--lang en|de]',
);

const { episode, dir } = await resolvedEpisode(input);
const language = recordingLanguage(requested, dir);
const recording = readRecordingFolder(dir);
const transcript = recording[`transcript.${language}.vtt`];
const startsFile = recording[`slide-starts.${language}.json`];
if (transcript === undefined || startsFile === undefined)
  fail(
    `needs recording/transcript.${language}.vtt and recording/slide-starts.${language}.json (youtube:transcript, then /episode-match-slide-starts)`,
  );

const { starts } = JSON.parse(startsFile) as { starts: Record<string, number> };
const rows = slideRows(ROOT, dir, language);
const speech = cutBySlide(
  parseCues(transcript),
  rows.map(({ slug }) => slug),
  starts,
);

const clock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const scripts: string[] = [];
console.log(`# ${episode.id} (${language})`);
for (const { slug, section, title } of rows) {
  const found = slideI18nFile({ root: ROOT, episodeDir: dir }, slug, language);
  const messages = found === undefined ? {} : (JSON.parse(readFileSync(found.file, 'utf8')) as Messages);
  const segments = Object.entries(messages.voiceScript?.segments ?? {});
  const texts = segments.flatMap(([, { script = '', bridge = '' }]) => [script, bridge]);
  scripts.push(...texts);
  const where =
    found === undefined
      ? 'NO I18N FILE'
      : `${path.relative(ROOT, found.file)}${found.pool ? ' (POOL: shared, read only)' : ''}`;
  const start = starts[slug];
  console.log(`\n## ${title} {#${slug}} section ${section}, start ${start === undefined ? 'unmatched' : clock(start)}`);
  console.log(`file: ${where}`);
  console.log(`reading time now: ${spokenWords(texts)} words, ${readingMinutes(texts, language).toFixed(2)} min`);
  console.log('\nauthored segments');
  for (const [key, { title: segmentTitle = '', script = '', bridge }] of segments)
    console.log(`- ${key} | ${segmentTitle}: ${script}${bridge ? ` [bridge: ${bridge}]` : ''}`);
  console.log(`\ntranscript\n${speech[slug] || '(none)'}`);
}
console.log(`\ntotal now: ${spokenWords(scripts)} words, ${readingMinutes(scripts, language).toFixed(2)} min`);
