// The context folder's judgement: listed files in, flat copy plan out.
// Reading the list and touching the filesystem is sync.ts's job.
import path from 'node:path';

/** One file in a context folder: its flat name there and its path in the repo. */
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

// A skill's file is always SKILL.md, so it flattens to its folder's name instead.
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

/** What a sync would do to one context folder, by flat name. */
export interface FolderDiff {
  changed: string[];
  added: string[];
  removed: string[];
}

/** Planned and current folder contents, each keyed by flat name. */
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

/** The kinds of file a voice session can use: docs and authored skills. */
const UPLOADABLE = ['docs/**/*.md', 'skills/*/SKILL.md'];

/**
 * Files that sessions or commits touched and the list does not hold yet.
 * `listed` is the expanded list and `atRef` every file at the synced ref.
 */
export function proposeCandidates(touched: string[], listed: string[], atRef: string[]): string[] {
  const held = new Set(listed);
  const present = new Set(atRef);
  const fits = (file: string) => UPLOADABLE.some((glob) => path.matchesGlob(file, glob));
  return [...new Set(touched)].filter((file) => fits(file) && present.has(file) && !held.has(file)).sort();
}
