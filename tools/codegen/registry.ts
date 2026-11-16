// `npm run registry` writes the Episode registry from the Episode folders and the Event, Template, Explorable page and Guide registries from
// their record files, formatted as oxfmt would; then, from the page catalogue, one route per Episode page, and from
// the compositions, the page summaries. The fast suite fails while a checked-in file is stale: a registry or a route in
// registry.test.ts, a summary in src/episodes/lib/page-summary.test.ts. What each holds: episode-registry.pure.ts,
// event-registry.pure.ts, episode-routes.pure.ts and page-summaries.pure.ts.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { formatAsRepo } from '../../src/episodes/lib/oxfmt-format.ts';
import { createVitest } from 'vitest/node';
import type * as store from '../../src/content-store/store.ts';
import type { compositionSummaries } from '../../src/episodes/lib/composition-summaries.ts';
import { pageFolders } from '../../src/episodes/lib/episode-folders.ts';
import {
  episodeRegistryFiles,
  exportedRecord,
  type EpisodeFolder,
  type RegistryFile,
} from './episode-registry.pure.ts';
import { episodeRouteFiles, isGeneratedRoute, ROUTE_GROUPS, type EpisodeRoute } from './episode-routes.pure.ts';
import { eventRegistryFiles } from './event-registry.pure.ts';
import { explorablePageRegistryFile } from './explorable-page-registry.pure.ts';
import { guideRegistryFile } from './guide-registry.pure.ts';
import { pageSummariesFile } from './page-summaries.pure.ts';
import { templateRegistryFile } from './template-registry.pure.ts';

const EVENTS_DIR = 'src/content-store/events';
const TEMPLATES_DIR = 'src/content-store/templates';
const EXPLORABLE_PAGES_DIR = 'src/content-store/explorable-pages';
const EXPLORABLES_DIR = 'src/explorables';
const GUIDES_DIR = 'src/content-store/guides';

/** Every page folder the one folder walker finds, an Event's copies included, with its entries and `episode.ts` text. */
function readEpisodeFolders(root: string): EpisodeFolder[] {
  return pageFolders(root).map(({ id, folder, dir, files }) => {
    const record = path.join(dir, 'episode.ts');
    const episodeSource = existsSync(record) ? readFileSync(record, 'utf8') : undefined;
    return { id, folder, files, episodeSource };
  });
}

/** Every file directly under a record folder of the content store; none while the folder does not exist yet. */
function readFilesIn(root: string, dir: string): string[] {
  if (!existsSync(path.join(root, dir))) return [];
  return readdirSync(path.join(root, dir), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map(({ name }) => name);
}

/** The folders directly under a directory: each Explorable is one. */
function readFoldersIn(root: string, dir: string): string[] {
  return readdirSync(path.join(root, dir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name);
}

/**
 * Loads a module of the site by its path from the repository root, aliases, JSON and JSX resolved as the site resolves
 * them: Vitest's module runner under `npm run registry`, a plain `import()` inside the fast suite.
 */
export type SiteLoader = <T>(repoPath: string) => Promise<T>;

type Store = Pick<
  typeof store,
  'episodesPathParams' | 'episodesPathPageAt' | 'eventEpisodeParams' | 'eventEpisodePageAt'
>;

/** Every Episode page the page catalogue builds, each with its Episode's folder and record, for its own route. */
async function episodeRoutes(root: string, load: SiteLoader): Promise<EpisodeRoute[]> {
  const catalogue = await load<Store>('src/content-store/store.ts');
  const folders = new Map(readEpisodeFolders(root).map((folder) => [folder.id, folder]));
  const routeOf = (slug: string, id: string | undefined, event?: string): EpisodeRoute => {
    const folder = id === undefined ? undefined : folders.get(id);
    if (folder === undefined) throw new Error(`The page catalogue builds an Episode page at "${slug}" no folder holds`);
    return { ...(event === undefined ? {} : { event }), slug, folder: folder.folder, exported: exportedRecord(folder) };
  };
  return [
    ...catalogue
      .episodesPathParams()
      .map((params) => routeOf(params.episode, catalogue.episodesPathPageAt(params)?.episode.id)),
    ...catalogue
      .eventEpisodeParams()
      .map((params) => routeOf(params.episode, catalogue.eventEpisodePageAt(params)?.episode.id, params.event)),
  ];
}

/** The folders directly under a directory, but a dynamic `[segment]`; none while it does not exist. */
function staticFoldersIn(root: string, dir: string): string[] {
  if (!existsSync(path.join(root, dir))) return [];
  return readFoldersIn(root, dir).filter((name) => !name.startsWith('['));
}

/** Every route file on disk `npm run registry` wrote: an Episode's own page's and an Episode's under its Event. */
function generatedRoutesOnDisk(root: string): string[] {
  return ROUTE_GROUPS.flatMap((group) => [
    ...staticFoldersIn(root, `${group}/episodes`).map((slug) => `${group}/episodes/${slug}/page.tsx`),
    ...staticFoldersIn(root, `${group}/events`).flatMap((event) =>
      staticFoldersIn(root, `${group}/events/${event}/episodes`).map(
        (slug) => `${group}/events/${event}/episodes/${slug}/page.tsx`,
      ),
    ),
  ]).filter(
    (file) => existsSync(path.join(root, file)) && isGeneratedRoute(readFileSync(path.join(root, file), 'utf8')),
  );
}

/** The generated routes on disk the page catalogue no longer builds a page for. */
function obsoleteRoutes(root: string, routes: readonly RegistryFile[]): string[] {
  const current = new Set(routes.map((file) => file.path));
  return generatedRoutesOnDisk(root).filter((file) => !current.has(file));
}

/** Removes a route file and every folder it leaves empty, up to its route group. */
function removeRoute(root: string, file: string): void {
  rmSync(path.join(root, file));
  for (let dir = path.dirname(file); !(ROUTE_GROUPS as readonly string[]).includes(dir); dir = path.dirname(dir)) {
    if (readdirSync(path.join(root, dir)).length > 0) return;
    rmdirSync(path.join(root, dir));
  }
}

/** The registry files the folders and record files give, read as plain text. */
function sourceFiles(root: string): RegistryFile[] {
  return [
    ...episodeRegistryFiles(readEpisodeFolders(root)),
    ...eventRegistryFiles(readFilesIn(root, EVENTS_DIR)),
    templateRegistryFile(readFilesIn(root, TEMPLATES_DIR)),
    explorablePageRegistryFile(readFilesIn(root, EXPLORABLE_PAGES_DIR), readFoldersIn(root, EXPLORABLES_DIR)),
    guideRegistryFile(readFilesIn(root, GUIDES_DIR)),
  ];
}

/** The summaries the compositions give, read through the site's own module graph once the source registries are current. */
async function summaryFiles(load: SiteLoader): Promise<RegistryFile[]> {
  const summaries = await load<{ compositionSummaries: typeof compositionSummaries }>(
    'src/episodes/lib/composition-summaries.ts',
  );
  return [pageSummariesFile(summaries.compositionSummaries())];
}

/** Files in the repository's oxfmt style, so `format:check` passes them. */
async function formatted(root: string, files: readonly RegistryFile[]): Promise<RegistryFile[]> {
  return Promise.all(
    files.map(async (file) => {
      const filepath = path.join(root, file.path);
      return { path: file.path, text: await formatAsRepo(filepath, file.text) };
    }),
  );
}

function onDisk(root: string, file: RegistryFile): string | undefined {
  const at = path.join(root, file.path);
  return existsSync(at) ? readFileSync(at, 'utf8') : undefined;
}

function staleOf(root: string, files: readonly RegistryFile[]): RegistryFile[] {
  return files.filter((file) => onDisk(root, file) !== file.text);
}

/**
 * The registry and route files whose checked-in text differs from what the folders and the page catalogue give, and
 * the generated routes no page needs any more: none when every one is current.
 */
export async function staleRegistryFiles(root: string, load: SiteLoader): Promise<string[]> {
  const routes = await formatted(root, episodeRouteFiles(await episodeRoutes(root, load)));
  const stale = staleOf(root, [...(await formatted(root, sourceFiles(root))), ...routes]);
  return [...stale.map((file) => file.path), ...obsoleteRoutes(root, routes)];
}

function write(root: string, files: readonly RegistryFile[]): string[] {
  const stale = staleOf(root, files);
  stale.forEach((file) => {
    mkdirSync(path.dirname(path.join(root, file.path)), { recursive: true });
    writeFileSync(path.join(root, file.path), file.text);
  });
  return stale.map((file) => file.path);
}

if (import.meta.main) {
  const root = process.cwd();
  const written = write(root, await formatted(root, sourceFiles(root)));
  // The compositions import Slides, JSON and aliases plain node cannot load: Vitest's module runner loads them as the
  // fast suite does, after the source registries above are written, so it reads the current ones.
  const vitest = await createVitest('test', { config: path.join(root, 'vitest.config.mts'), watch: false });
  try {
    const load: SiteLoader = (repoPath) => vitest.import(path.join(root, repoPath));
    const routes = await formatted(root, episodeRouteFiles(await episodeRoutes(root, load)));
    const obsolete = obsoleteRoutes(root, routes);
    obsolete.forEach((file) => removeRoute(root, file));
    written.push(...write(root, routes), ...obsolete.map((file) => `${file} (removed)`));
    written.push(...write(root, await formatted(root, await summaryFiles(load))));
  } finally {
    await vitest.close();
  }
  console.log(written.length === 0 ? 'Every registry is current' : `wrote ${written.join(', ')}`);
}
