import path from 'node:path';

export interface Copy {
  name: string;
  source: string;
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

function flatName(file: string): string {
  const name = path.basename(file);
  return name === 'SKILL.md' ? `${path.basename(path.dirname(file))}.md` : name;
}

export function planCopies(files: string[]): Copy[] {
  const owners = new Map<string, string>();
  for (const file of files) {
    const name = flatName(file);
    const other = owners.get(name);
    if (other !== undefined) throw new Error(`${other} and ${file} both flatten to ${name}`);
    owners.set(name, file);
  }
  return files.map((file) => ({ name: flatName(file), source: file }));
}

export interface FolderDiff {
  changed: string[];
  added: string[];
  removed: string[];
}

export function diffFolder(planned: Map<string, string>, current: Map<string, string>): FolderDiff {
  const changed: string[] = [];
  const added: string[] = [];
  for (const [name, content] of planned) {
    const before = current.get(name);
    if (before === undefined) added.push(name);
    else if (before !== content) changed.push(name);
  }
  const removed = [...current.keys()].filter((name) => !planned.has(name));
  return { changed, added, removed };
}

const FILES_A_VOICE_SESSION_CAN_USE = ['docs/**/*.md', 'skills/*/SKILL.md'];

export function proposeCandidates(touched: string[], listed: string[], atRef: string[]): string[] {
  const held = new Set(listed);
  const present = new Set(atRef);
  const fits = (file: string) => FILES_A_VOICE_SESSION_CAN_USE.some((glob) => path.matchesGlob(file, glob));
  return [...new Set(touched)].filter((file) => fits(file) && present.has(file) && !held.has(file)).sort();
}
