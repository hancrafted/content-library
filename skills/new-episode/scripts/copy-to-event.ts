// `npm run episode:copy-to-event -- <slug> <event-slug> [--position <n>]`: copies the Episode `src/episodes/<slug>/` whole
// into the Event as an unlisted copy under `src/episodes/by-event/<event-slug>/<slug>/` (docs/features/events.md, "Unlisted
// Episodes"), publishes it on the Event's date, lists it in the Event's Playlist (last, unless --position names a
// 1-based place), runs the registry and writes the copy's published-anchors.json, so its Event-scoped page is built.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createVitest } from 'vitest/node';
import type { missingPublishedSnapshot } from '../../../src/episodes/lib/composed-page-context.ts';
import {
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

/**
 * Writes the copy's `published-anchors.json` when it has none, from the reader the composition checks use. The copy's
 * `episode.ts` imports Slides, JSON and aliases plain node cannot load, so Vitest's module runner loads it, as
 * `npm run registry` loads the compositions.
 */
async function writeAnchorsSnapshot(): Promise<void> {
  const vitest = await createVitest('test', { config: path.join(root, 'vitest.config.mts'), watch: false });
  try {
    const context = await vitest.import<{ missingPublishedSnapshot: typeof missingPublishedSnapshot }>(
      path.join(root, 'src/episodes/lib/composed-page-context.ts'),
    );
    const missing = await context.missingPublishedSnapshot(target, () =>
      vitest.import(path.join(target, 'episode.ts')),
    );
    if (missing !== undefined) writeFileSync(missing.file, missing.contents);
  } finally {
    await vitest.close();
  }
}

try {
  await writeAnchorsSnapshot();
} catch (error) {
  rollBack(`could not write ${id}'s published-anchors.json: ${error instanceof Error ? error.message : String(error)}`);
}

const entry = position === undefined ? 'last' : `place ${position}`;
console.log(`✔ ${id} copied, published unlisted on ${date}, listed ${entry} in ${playlistId}`);
console.log(`  page: /events/${eventSlug}/episodes/${slug}/ (and /de/...); next: npm run verify`);
