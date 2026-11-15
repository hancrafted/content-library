// `npm run episode:copy-to-event -- <slug> <event-slug> [--position <n>]`: copies the Episode `src/episodes/<slug>/` whole
// into the Event as an unlisted copy under `src/episodes/by-event/<event-slug>/<slug>/` (docs/features/events.md, "Unlisted
// Episodes"), publishes it on the Event's date, lists it in the Event's Playlist (last, unless --position names a
// 1-based place), runs the registry and writes the copy's published-anchors.json, so its Event-scoped page is built.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  anchorsFileFromFailure,
  copyEntryId,
  insertPlaylistEntry,
  unlistedCopyMetadata,
} from '../../../src/pipeline/lib/copy-to-event.pure.ts';

const USAGE = '✖ usage: npm run episode:copy-to-event -- <slug> <event-slug> [--position <n>]';

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = args.indexOf('--position');
const position = flag >= 0 ? Number(args.splice(flag, 2)[1]) : undefined;
const [slug, eventSlug] = args;
if (!slug || !eventSlug || args.length !== 2) fail(USAGE.slice(2));

const root = process.cwd();
const source = path.join(root, 'src/episodes', slug);
const target = path.join(root, 'src/episodes/by-event', eventSlug, slug);
const eventFile = path.join(root, 'src/content-store/events', `${eventSlug}.ts`);
if (!existsSync(path.join(source, 'episode-metadata.ts'))) fail(`src/episodes/${slug}/ is no Episode with a page`);
if (!existsSync(eventFile)) fail(`no Event ${eventSlug}: src/content-store/events/${eventSlug}.ts`);
if (existsSync(target)) fail(`${path.relative(root, target)} exists already`);

const event = readFileSync(eventFile, 'utf8');
const date = /date: '(\d{4}-\d{2}-\d{2})'/.exec(event)?.[1] ?? fail(`${eventSlug} names no date`);
const playlistId = /playlist: '([^']+)'/.exec(event)?.[1] ?? fail(`${eventSlug} names no playlist`);
const playlistFile = path.join(root, 'src/content-store/playlists', `${playlistId}.ts`);
const id = copyEntryId(eventSlug, slug);
// Compute before any write, so a refusal leaves the tree as it was.
const original = readFileSync(playlistFile, 'utf8');
const playlist = insertPlaylistEntry(original, id, position);

/** A refusal after the first write puts the tree back, so the script can run again. */
function rollBack(message: string): never {
  rmSync(target, { recursive: true, force: true });
  writeFileSync(playlistFile, original);
  run('npm', ['run', 'registry']);
  return fail(message);
}

cpSync(source, target, { recursive: true });
rmSync(path.join(target, 'brief.md'), { force: true });
const metadataFile = path.join(target, 'episode-metadata.ts');
writeFileSync(metadataFile, unlistedCopyMetadata(readFileSync(metadataFile, 'utf8'), date));
writeFileSync(playlistFile, playlist);

function run(command: string, commandArgs: string[]) {
  return spawnSync(command, commandArgs, { cwd: root, encoding: 'utf8' });
}

const registry = run('npm', ['run', 'registry']);
if (registry.status !== 0) rollBack(`npm run registry failed:\n${registry.stdout}${registry.stderr}`);

const anchors = path.join(target, 'published-anchors.json');
if (!existsSync(anchors)) {
  const test = run('npx', ['vitest', 'run', 'src/episodes/lib/published-anchors.test.ts']);
  const asked = anchorsFileFromFailure(`${test.stdout}${test.stderr}`, id);
  if (!asked)
    rollBack(`the anchors test did not ask for ${id}'s published-anchors.json:\n${test.stdout}${test.stderr}`);
  writeFileSync(asked.file, asked.content);
}

const entry = position === undefined ? 'last' : `place ${position}`;
console.log(`✔ ${id} copied, published unlisted on ${date}, listed ${entry} in ${playlistId}`);
console.log(`  page: /events/${eventSlug}/episodes/${slug}/ (and /de/...); next: npm run verify`);
