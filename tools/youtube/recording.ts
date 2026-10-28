// `npm run youtube:recording -- <episode folder | page url | video id> [--lang de]`: prints the Episode's composition
// (Section, Slide slug, Slide title in the spoken language) beside any stored Slide starts, then the violations of its
// Recording folder, exit 1 when there are any. The reading copy for `/episode-match-slide-starts`; rules in `recording.pure.ts`.
import path from 'node:path';
import { EPISODES_DIR } from '../../src/episodes/lib/episode-folders.ts';
import { loadEpisodeEntries } from './episode-index.ts';
import { resolveEpisode } from './episode-resolver.pure.ts';
import { readRecordingFolder, recordingViolations, slideRows } from './recording-disk.ts';
import { parseSpokenLanguage } from './transcript.pure.ts';

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
  fail('usage: npm run youtube:recording -- <episode folder | page url | video id> [--lang en|de]');

const resolution = resolveEpisode(input, await loadEpisodeEntries(ROOT));
if (!resolution.ok) fail(resolution.reason);
const dir = path.join(ROOT, EPISODES_DIR, resolution.episode.folder);

const stored = JSON.parse(readRecordingFolder(dir)[`slide-starts.${language}.json`] ?? '{}') as {
  starts?: Record<string, number>;
  unmatched?: string[];
};
console.log(`${resolution.episode.id} (${language})\nsection\tslide\ttitle\tstart`);
for (const { section, slug, title } of slideRows(ROOT, dir, language)) {
  const start = stored.starts?.[slug] ?? (stored.unmatched?.includes(slug) ? 'unmatched' : '');
  console.log(`${section}\t${slug}\t${title}\t${start}`);
}
const violations = recordingViolations(dir);
for (const { file, message } of violations) console.error(`${file}: ${message}`);
if (violations.length > 0) process.exit(1);
