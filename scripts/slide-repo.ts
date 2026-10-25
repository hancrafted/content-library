// The working tree as the Slide commands read it (`slides:adapt`, `slides:settle`): a RepoView over the files under
// the current directory, and the Prettier formatting every command applies to a file it writes.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';
import type { InstanceRepoView } from './slide-instance.pure.ts';

export const root = process.cwd();

function filesUnder(dir: string): string[] {
  if (!existsSync(join(root, dir))) return [];
  return readdirSync(join(root, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => `${dir}${join(entry.parentPath, entry.name).slice(join(root, dir).length).split('\\').join('/')}`)
    .filter((file) => !file.includes('/node_modules/'))
    .sort();
}

export const repo: InstanceRepoView = {
  exists: (path) => existsSync(join(root, path)),
  read: (path) => readFileSync(join(root, path), 'utf8'),
  folders: (path) => {
    try {
      return readdirSync(join(root, path), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    } catch {
      return [];
    }
  },
  sourceFiles: () => [...filesUnder('src'), ...filesUnder('tests')].filter((file) => /\.tsx?$/.test(file)),
  filesUnder,
};

/** The text as Prettier writes it at that path, under the repository's own settings. */
export async function formatted(path: string, text: string): Promise<string> {
  const file = join(root, path);
  const options = (await resolveConfig(file)) ?? {};
  return format(text, { ...options, filepath: file });
}
