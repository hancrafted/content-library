// `npm run registry` writes the Episode registry from the Episode folders and the Event and Resource registries from
// their record files, formatted as Prettier would. The fast suite fails while a checked-in registry file is stale
// (registry.test.ts). What each registry holds: episode-registry.pure.ts and event-registry.pure.ts.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { pageFolders } from '../../src/episodes/lib/episode-folders.ts';
import { episodeRegistryFiles, type EpisodeFolder, type RegistryFile } from './episode-registry.pure.ts';
import { eventRegistryFiles } from './event-registry.pure.ts';
import { resourceRegistryFile } from './resource-registry.pure.ts';

const EVENTS_DIR = 'src/content-store/events';
const RESOURCES_DIR = 'src/content-store/resources';

/** Every page folder the one folder walker finds, an Event's copies included, with its entries and `episode.ts` text. */
function readEpisodeFolders(root: string): EpisodeFolder[] {
  return pageFolders(root).map(({ id, folder, dir, files }) => {
    const record = path.join(dir, 'episode.ts');
    const episodeSource = existsSync(record) ? readFileSync(record, 'utf8') : undefined;
    return { id, folder, files, episodeSource };
  });
}

/** Every file directly under a record folder of the content store. */
function readFilesIn(root: string, dir: string): string[] {
  return readdirSync(path.join(root, dir), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map(({ name }) => name);
}

/** Each registry file as the folders and files give it, in the repository's Prettier style, so `format:check` passes it. */
async function registryFiles(root: string): Promise<RegistryFile[]> {
  const files = [
    ...episodeRegistryFiles(readEpisodeFolders(root)),
    ...eventRegistryFiles(readFilesIn(root, EVENTS_DIR)),
    resourceRegistryFile(readFilesIn(root, RESOURCES_DIR)),
  ];
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

/** The registry files whose checked-in text differs from what the folders give: none when every registry is current. */
export async function staleRegistryFiles(root: string): Promise<string[]> {
  return (await registryFiles(root)).filter((file) => onDisk(root, file) !== file.text).map((file) => file.path);
}

if (import.meta.main) {
  const root = process.cwd();
  const written = (await registryFiles(root)).filter((file) => onDisk(root, file) !== file.text);
  written.forEach((file) => writeFileSync(path.join(root, file.path), file.text));
  console.log(written.length === 0 ? 'Every registry is current' : `wrote ${written.map((f) => f.path).join(', ')}`);
}
