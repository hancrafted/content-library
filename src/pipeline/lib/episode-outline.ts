// An Episode's Slides in order, read from its code folder: the Title slide and each Section's Slide folders, from
// `episode.ts` and its Section placement markers (`sections/*.ts`) or its inline Section arrays. It reads the source
// text, not the modules, so it runs under plain node without the app's `@/` aliases.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export interface EpisodeOutline {
  /** The Title slide's folder under `slides/`; none when the Episode has no Title slide. */
  title?: string;
  /** Each Section's Slide folders under `slides/`, section slide first. */
  sections: string[][];
}

/** `import { name } from './path'` → name → path, for every named import in `source`. */
function imports(source: string): Map<string, string> {
  const named = new Map<string, string>();
  for (const [, names, from] of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)) {
    for (const name of (names ?? '').split(',')) {
      const trimmed = name.trim().replace(/^type\s+/, '');
      if (trimmed !== '') named.set(trimmed, from ?? '');
    }
  }
  return named;
}

/**
 * The Slide an import path names, by folder: `./slides/<folder>/slide` or `../slides/<folder>/slide`, or a pool Slide,
 * `@/episodes/slide-pool/<folder>/slide`, named by its pool folder (its i18n lives under `slide-pool/`, not `slides/`).
 */
function slideFolder(from: string | undefined, name: string, file: string): string {
  const folder = from === undefined ? undefined : /(?:slides|slide-pool)\/([^/]+)\/slide$/.exec(from)?.[1];
  if (folder === undefined) throw new Error(`${file}: ${name} is not imported from a slides/<folder>/slide module`);
  return folder;
}

/** The text between the bracket at `open` and its matching close. */
function bracketed(source: string, open: number): string {
  let depth = 0;
  for (let at = open; at < source.length; at += 1) {
    if (source[at] === '[') depth += 1;
    if (source[at] === ']') depth -= 1;
    if (depth === 0) return source.slice(open + 1, at);
  }
  throw new Error(`unclosed [ at ${open}`);
}

function identifiers(list: string): string[] {
  return list
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

function sectionMarker(folder: string, from: string, name: string): string[] {
  const file = path.join(folder, `${from}.ts`);
  const source = readFileSync(file, 'utf8');
  const open = source.indexOf('[', source.indexOf(`${name}:`));
  const named = imports(source);
  return identifiers(bracketed(source, open)).map((slide) => slideFolder(named.get(slide), slide, file));
}

export function episodeOutline(folder: string): EpisodeOutline {
  const file = path.join(folder, 'episode.ts');
  if (!existsSync(file)) throw new Error(`${file} is missing: an Episode folder holds its record in episode.ts`);
  const source = readFileSync(file, 'utf8');
  const named = imports(source);
  const title = /\btitle:\s*(\w+)/.exec(source)?.[1];
  const list = bracketed(source, source.indexOf('[', source.indexOf('sections:')));
  const sections = list.trim().startsWith('[')
    ? [...list.matchAll(/\[([^\]]*)\]/g)].map(([, inner]) =>
        identifiers(inner ?? '').map((slide) => slideFolder(named.get(slide), slide, file)),
      )
    : identifiers(list).map((marker) => sectionMarker(folder, named.get(marker) ?? '', marker));
  return { ...(title === undefined ? {} : { title: slideFolder(named.get(title), title, file) }), sections };
}
