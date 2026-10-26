// `npm run episodes:registry` writes the Episode registry from the Episode folders, formatted as Prettier would. The fast
// suite fails while a checked-in registry file is stale (episode-registry.test.ts). What the registry holds:
// episode-registry.pure.ts.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { episodeRegistryFiles, type EpisodeFolder, type RegistryFile } from './episode-registry.pure.ts';

const EPISODES_DIR = 'src/components/episodes';

/** Every folder under `src/components/episodes/`, with its entries and its `episode.ts` text. */
function readEpisodeFolders(root: string): EpisodeFolder[] {
  const dir = path.join(root, EPISODES_DIR);
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => {
      const record = path.join(dir, name, 'episode.ts');
      const episodeSource = existsSync(record) ? readFileSync(record, 'utf8') : undefined;
      return { slug: name, files: readdirSync(path.join(dir, name)), episodeSource };
    });
}

/** Each registry file as the folders give it, in the repository's Prettier style, so `format:check` passes it. */
async function registryFiles(root: string): Promise<RegistryFile[]> {
  return Promise.all(
    episodeRegistryFiles(readEpisodeFolders(root)).map(async (file) => {
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

/** The registry files whose checked-in text differs from what the folders give: none when the registry is current. */
export async function staleRegistryFiles(root: string): Promise<string[]> {
  return (await registryFiles(root)).filter((file) => onDisk(root, file) !== file.text).map((file) => file.path);
}

if (import.meta.main) {
  const root = process.cwd();
  const written = (await registryFiles(root)).filter((file) => onDisk(root, file) !== file.text);
  written.forEach((file) => writeFileSync(path.join(root, file.path), file.text));
  console.log(written.length === 0 ? 'Episode registry is current' : `wrote ${written.map((f) => f.path).join(', ')}`);
}
