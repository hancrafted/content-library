// An Episode's Slides in order, read from its code folder: the Title slide and each Section's Slide folders, from
// `<slug>.ts` and its Section placement markers (`sections/*.ts`) or its inline Section arrays. A Slide is the
// Episode's own (`slides/<folder>/slide`) or a pool Slide (`@/components/slide-pool/<folder>/slide`), placed as is or
// under a Pinned anchor (`pinAnchor(slide, '<retired slug>')`). It reads the source text, not the modules, so it runs
// under plain node without the app's `@/` aliases.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** One Slide as this Episode places it. */
export interface OutlineSlide {
  /** Its anchor slug in this Episode: the folder name, or a Pinned anchor's retired slug. */
  slug: string;
  /** The Slide folder holding its files: under the Episode's `slides/`, or under the Slide pool. */
  folder: string;
}

export interface EpisodeOutline {
  /** The Title slide; none when the Episode has no Title slide. */
  title?: OutlineSlide;
  /** Each Section's Slides, section slide first. */
  sections: OutlineSlide[][];
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

/** What reading one file needs: the Episode folder, the file's named imports, and the file for error messages. */
interface Reading {
  episode: string;
  named: Map<string, string>;
  file: string;
}

/**
 * The Slide folder a binding's import path names, from the Episode folder: `./slides/<folder>/slide` or
 * `../slides/<folder>/slide` under its own `slides/`, `@/components/slide-pool/<folder>/slide` under the Slide pool.
 */
function slideFolder({ episode, named, file }: Reading, name: string): OutlineSlide {
  const from = named.get(name);
  const pool = from === undefined ? undefined : /^@\/components\/slide-pool\/([^/]+)\/slide$/.exec(from)?.[1];
  if (pool !== undefined) return { slug: pool, folder: path.join(episode, '..', '..', 'slide-pool', pool) };
  const own = from === undefined ? undefined : /^\.\.?\/slides\/([^/]+)\/slide$/.exec(from)?.[1];
  if (own === undefined)
    throw new Error(
      `${file}: ${name} is not imported from a slides/<folder>/slide or slide-pool/<folder>/slide module`,
    );
  return { slug: own, folder: path.join(episode, 'slides', own) };
}

/** One Section entry: a Slide's binding, or `pinAnchor(binding, '<retired slug>')`, which keeps the retired anchor. */
function entry(reading: Reading, item: string): OutlineSlide {
  const pinned = /^pinAnchor\(\s*(\w+)\s*,\s*'([^']+)'\s*\)$/.exec(item);
  const slide = slideFolder(reading, pinned?.[1] ?? item);
  return pinned?.[2] === undefined ? slide : { ...slide, slug: pinned[2] };
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

/** The comma-separated entries of a list, a comma inside a call's parentheses kept in its entry. */
function identifiers(list: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let start = 0;
  for (let at = 0; at <= list.length; at += 1) {
    const char = list[at];
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (at === list.length || (char === ',' && depth === 0)) {
      items.push(list.slice(start, at).trim());
      start = at + 1;
    }
  }
  return items.filter((item) => item !== '');
}

function sectionMarker(folder: string, from: string, name: string): OutlineSlide[] {
  const file = path.join(folder, `${from}.ts`);
  const source = readFileSync(file, 'utf8');
  const open = source.indexOf('[', source.indexOf(`${name}:`));
  const reading = { episode: folder, named: imports(source), file };
  return identifiers(bracketed(source, open)).map((item) => entry(reading, item));
}

export function episodeOutline(folder: string): EpisodeOutline {
  const file = path.join(folder, `${path.basename(folder)}.ts`);
  if (!existsSync(file)) throw new Error(`${file} is missing: an Episode folder holds a file named after it`);
  const source = readFileSync(file, 'utf8');
  const named = imports(source);
  const reading = { episode: folder, named, file };
  const title = /\btitle:\s*(\w+)/.exec(source)?.[1];
  const list = bracketed(source, source.indexOf('[', source.indexOf('sections:')));
  const sections = list.trim().startsWith('[')
    ? [...list.matchAll(/\[([^\]]*)\]/g)].map(([, inner]) =>
        identifiers(inner ?? '').map((item) => entry(reading, item)),
      )
    : identifiers(list).map((marker) => sectionMarker(folder, named.get(marker) ?? '', marker));
  return { ...(title === undefined ? {} : { title: slideFolder(reading, title) }), sections };
}
