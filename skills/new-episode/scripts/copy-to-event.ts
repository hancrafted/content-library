import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createVitest } from 'vitest/node';
import type { missingPublishedSnapshot } from '../../../src/episodes/lib/composed-page-context.ts';
import {
  baseExportName,
  copyEntryId,
  INSTANCE_CHECKS_TEST,
  insertPlaylistEntry,
  instanceEpisodeSource,
  instanceExportName,
  instanceMetadata,
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
const baseFile = path.join(source, 'episode.ts');
if (!existsSync(path.join(source, 'episode-metadata.ts')) || !existsSync(baseFile))
  fail(`src/episodes/${slug}/ is no Episode with a page`);
if (!existsSync(eventFile)) fail(`no Event ${eventSlug}: src/content-store/events/${eventSlug}.ts`);
if (existsSync(target)) fail(`${path.relative(root, target)} exists already`);

const event = readFileSync(eventFile, 'utf8');
const date = /date: '(\d{4}-\d{2}-\d{2})'/.exec(event)?.[1] ?? fail(`${eventSlug} names no date`);
const playlistId = /playlist: '([^']+)'/.exec(event)?.[1] ?? fail(`${eventSlug} names no playlist`);
const playlistFile = path.join(root, 'src/content-store/playlists', `${playlistId}.ts`);
const id = copyEntryId(eventSlug, slug);
const original = readFileSync(playlistFile, 'utf8');
const playlistComputedBeforeAnyWrite = insertPlaylistEntry(original, id, position);

function rollBackSoScriptCanRunAgain(message: string): never {
  rmSync(target, { recursive: true, force: true });
  writeFileSync(playlistFile, original);
  run('npm', ['run', 'registry']);
  return fail(message);
}

const baseExport = baseExportName(readFileSync(baseFile, 'utf8'));
mkdirSync(target, { recursive: true });
writeFileSync(
  path.join(target, 'episode-metadata.ts'),
  instanceMetadata(readFileSync(path.join(source, 'episode-metadata.ts'), 'utf8'), date),
);
writeFileSync(
  path.join(target, 'episode.ts'),
  instanceEpisodeSource({ slug, exportName: baseExport }, instanceExportName(eventSlug, slug)),
);
writeFileSync(path.join(target, 'episode-checks.test.ts'), INSTANCE_CHECKS_TEST);
writeFileSync(playlistFile, playlistComputedBeforeAnyWrite);

function run(command: string, commandArgs: string[]) {
  return spawnSync(command, commandArgs, { cwd: root, encoding: 'utf8' });
}

const registry = run('npm', ['run', 'registry']);
if (registry.status !== 0)
  rollBackSoScriptCanRunAgain(`npm run registry failed:\n${registry.stdout}${registry.stderr}`);

async function writeAnchorsSnapshotThroughVitestModuleRunner(): Promise<void> {
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
  await writeAnchorsSnapshotThroughVitestModuleRunner();
} catch (error) {
  rollBackSoScriptCanRunAgain(
    `could not write ${id}'s published-anchors.json: ${error instanceof Error ? error.message : String(error)}`,
  );
}

const entry = position === undefined ? 'last' : `place ${position}`;
console.log(
  `✔ ${id} made an Episode instance of ${slug}, published unlisted on ${date}, listed ${entry} in ${playlistId}`,
);
console.log(`  page: /events/${eventSlug}/episodes/${slug}/ (and /de/...); next: npm run verify`);
