// The context folder's judgement: listed files in, flat link plan out.
// Reading the list and touching the filesystem is sync.ts's job.
import path from 'node:path';

export interface Link {
  name: string;
  target: string;
}

export function parseList(markdown: string): string[] {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim().replace(/^`|`$/g, ''))
    .filter((entry) => entry !== '');
}

export function expandEntries(entries: string[], match: (entry: string) => string[]): string[] {
  return entries.flatMap((entry) => {
    const files = match(entry);
    if (files.length === 0) throw new Error(`${entry} in assets/files.md matches no file`);
    return files;
  });
}

// A skill's file is always SKILL.md, so it flattens to its folder's name instead.
function flatName(file: string): string {
  const name = path.basename(file);
  return name === 'SKILL.md' ? `${path.basename(path.dirname(file))}.md` : name;
}

export function planLinks(files: string[], folder: string): Link[] {
  const owners = new Map<string, string>();
  for (const file of files) {
    const name = flatName(file);
    const other = owners.get(name);
    if (other !== undefined) throw new Error(`${other} and ${file} both flatten to ${name}`);
    owners.set(name, file);
  }
  return files.map((file) => ({
    name: flatName(file),
    target: path.relative(folder, file),
  }));
}
