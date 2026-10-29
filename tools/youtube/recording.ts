// `npm run youtube:recording -- <episode folder | page url | video id> [--lang de]`: prints the Episode's composition
// (Section, Slide slug, Slide title in the spoken language) beside any stored Slide starts, then the violations of its
// Recording folder, exit 1 when there are any. The reading copy for `/episode-match-slide-starts`; rules in `recording.pure.ts`.
import { chooseLanguage } from './command-args.pure.ts';
import { commandArgs, fail, resolvedEpisode, REPO_ROOT as ROOT } from './command.ts';
import { readRecordingFolder, recordingViolations, slideRows } from './recording-disk.ts';

const { input, language: requested } = commandArgs(
  'npm run youtube:recording -- <episode folder | page url | video id> [--lang en|de]',
);

const { episode, dir } = await resolvedEpisode(input);
console.log(`episode: ${episode.id}
slug: ${episode.slug}`);
const recording = readRecordingFolder(dir);
const chosen = chooseLanguage(requested, Object.keys(recording));
if (!chosen.ok) {
  if (Object.keys(recording).length === 0) process.exit(0);
  fail(chosen.reason);
}
const language = chosen.language;

const stored = JSON.parse(recording[`slide-starts.${language}.json`] ?? '{}') as {
  starts?: Record<string, number>;
  unmatched?: string[];
  guessed?: string[];
};
console.log(`language: ${language}\nsection\tslide\ttitle\tstart\tstatus`);
for (const { section, slug, title } of slideRows(ROOT, dir, language)) {
  const start = stored.starts?.[slug];
  const status = stored.unmatched?.includes(slug)
    ? 'unmatched'
    : stored.guessed?.includes(slug)
      ? 'guessed'
      : start === undefined
        ? ''
        : 'matched';
  console.log(`${section}\t${slug}\t${title}\t${start ?? ''}\t${status}`);
}
const violations = recordingViolations(ROOT, dir);
for (const { file, message } of violations) console.error(`${file}: ${message}`);
if (violations.length > 0) process.exit(1);
