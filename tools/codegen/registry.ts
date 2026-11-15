// `npm run registry` writes the Episode registry from the Episode folders and the Event, Template, Explorable page and Guide registries from
// their record files, formatted as Prettier would; then, from the compositions those registries list, the page
// summaries. The fast suite fails while a checked-in file is stale: a registry in registry.test.ts, a summary in
// src/episodes/lib/page-summary.test.ts. What each holds: episode-registry.pure.ts, event-registry.pure.ts and
// page-summaries.pure.ts.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { createVitest } from 'vitest/node';
import type { compositionSummaries } from '../../src/episodes/lib/composition-summaries.ts';
import { pageFolders } from '../../src/episodes/lib/episode-folders.ts';
import { episodeRegistryFiles, type EpisodeFolder, type RegistryFile } from './episode-registry.pure.ts';
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

/** Loads a module of the site by its path from the repository root, aliases, JSON and JSX resolved as the site resolves them. */
type SiteLoader = <T>(repoPath: string) => Promise<T>;

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

/** Files in the repository's Prettier style, so `format:check` passes them. */
async function formatted(root: string, files: readonly RegistryFile[]): Promise<RegistryFile[]> {
  return Promise.all(
    files.map(async (file) => {
      const filepath = path.join(root, file.path);
      const options = await resolveConfig(filepath);
      return { path: file.path, text: await format(file.text, { ...options, filepath }) };
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

/** The registry files whose checked-in text differs from what the folders give: none when every registry is current. */
export async function staleRegistryFiles(root: string): Promise<string[]> {
  return staleOf(root, await formatted(root, sourceFiles(root))).map((file) => file.path);
}

function write(root: string, files: readonly RegistryFile[]): string[] {
  const stale = staleOf(root, files);
  stale.forEach((file) => writeFileSync(path.join(root, file.path), file.text));
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
    written.push(...write(root, await formatted(root, await summaryFiles(load))));
  } finally {
    await vitest.close();
  }
  console.log(written.length === 0 ? 'Every registry is current' : `wrote ${written.join(', ')}`);
}
