import type { GlobEntries, NamedCheck } from '@/shared/lib/folder-check';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { ComposedPage } from './composed-page';
import { composedPageChecks } from './composed-page-checks';
import { exportsCarrying, readPage } from './composed-page-context';
import { pageFolders } from './episode-folders';

/*
 * The Episode-level checks (ARCH-003 §4.7): every invariant that holds inside one page folder, run on that folder
 * alone. Each page folder, and the Slide pool, has its own `episode-checks.test.ts` that hands its folder and its Slide
 * entries here, so `vitest --changed` runs only the checks of the Episode an edit touched, and each test's cost stays
 * one Episode. An invariant that spans Episodes stays in one test that reads an index, never every folder.
 *
 * A check returns findings and never throws, so a broken Episode's test names what broke. Add a new Episode-level
 * check here, to `slides` (one per Slide folder) or `folder` (one per page folder), or to `composed-page-checks.ts` when
 * it judges the page's composition, reading anything new it needs in `composed-page-context.ts`: every per-Episode test
 * runs it without being edited.
 *
 * Accepted rerun gap (ARCH-003 §4.6): folder existence read from disk (a Slide folder without its slide.tsx, a parts/
 * or client/ folder, a marker no Section imports) is outside the globs, so `--changed` misses it until push and CI run
 * the full suite; a rerun trigger on `src/episodes/**` would rerun every test on every Slide edit.
 */

/** The checks of one page folder: those run once per Slide folder, and those run once for the folder. */
export interface EpisodeChecks {
  readonly slides: readonly NamedCheck[];
  readonly folder: readonly NamedCheck[];
}

const ENTRY = 'slide.tsx';
const SLIDES_DIR = 'slides';
/** The repository root, from this module's own place in it: where the folder walker looks for page folders. */
const ROOT = path.resolve(import.meta.dirname, '../../..');
/** Folders an Episode MUST NOT keep beside its Slides: Slide code lives only in its Slide folder (FE-004 §3). */
const EPISODE_CODE_FOLDERS = ['parts', 'client'];

interface DeclaringSlide {
  slug: string;
  notes: { slug: string }[];
  messages: Record<string, { notes?: Record<string, unknown> }>;
}

function subfolders(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** The Slides an entry module exports: each carries its slug and its own messages. */
function slidesOf(module: unknown): { slug: string; messages: unknown }[] {
  return exportsCarrying(module, ['slug', 'messages']);
}

/** The slug check: the folder holds the one Slide it is named after. */
function slugCheck(shown: string, slug: string, load: () => Promise<unknown>): NamedCheck {
  return {
    name: `${shown} names its folder after the one Slide slug its server entry declares`,
    findings: async () => {
      const declared = slidesOf(await load()).map((slide) => slide.slug);
      return declared.length === 1 && declared[0] === slug
        ? []
        : [`${shown} declares [${declared.join(', ')}], not [${slug}]`];
    },
  };
}

/** The Speaker-note check: under `notes.*` sit only the notes the Slide declares, in every locale (FE-010 §3.1). */
function notesCheck(shown: string, load: () => Promise<unknown>): NamedCheck {
  return {
    name: `${shown} keeps under notes.* only the Speaker notes its Slide declares, in every locale (FE-010 §3.1)`,
    findings: async () =>
      exportsCarrying<DeclaringSlide>(await load(), ['slug', 'notes', 'messages']).flatMap(
        ({ slug, notes, messages }) => {
          const declared = new Set(notes.map((note) => note.slug));
          return Object.entries(messages).flatMap(([locale, strings]) =>
            Object.keys(strings.notes ?? {})
              .filter((key) => !declared.has(key))
              .map((key) => `${slug} ${locale}: notes.${key} is no declared Speaker note`),
          );
        },
      ),
  };
}

/** The checks over Slide folders sitting in `slidesDir`, shown by `prefix` + slug. */
function slideFolderChecks(slidesDir: string, prefix: string, entries: GlobEntries): EpisodeChecks {
  const loaders = new Map(Object.entries(entries).map(([key, load]) => [path.basename(path.dirname(key)), load]));
  const folders = subfolders(slidesDir);
  const slides = folders.flatMap((slug) => {
    const load = loaders.get(slug);
    return load === undefined ? [] : [slugCheck(`${prefix}${slug}`, slug, load), notesCheck(`${prefix}${slug}`, load)];
  });
  const entryCheck: NamedCheck = {
    name: `gives every Slide folder a ${ENTRY}, so no folder holds a Slide under another name`,
    findings: async () =>
      folders.filter((slug) => !loaders.has(slug)).map((slug) => `${prefix}${slug} has no ${ENTRY}`),
  };
  return { slides, folder: [entryCheck] };
}

/** The composition checks of the page folder `dir`, found by the one folder walker, never by reading its path. */
function pageChecks(dir: string, page: GlobEntries): NamedCheck[] {
  const load = Object.values(page)[0];
  if (load === undefined) return [];
  const found = pageFolders(ROOT).find((folder) => folder.dir === path.resolve(dir));
  if (found !== undefined) {
    // Sound: the walker reads the ref off disk, so its id is a plain string, and the registry's id lists come from this
    // same walk. A folder the registry has not caught up with reaches no lookup unguarded: its summary check names it.
    const ref = found as ComposedPage;
    return composedPageChecks(ref, () => readPage(found.dir, ref, load));
  }
  return [
    {
      name: 'sits where the folder walker finds a page folder, so its composition is checked',
      findings: async () => [`${dir} is no page folder under ${path.join(ROOT, 'src/episodes')}`],
    },
  ];
}

/**
 * The checks of one page folder (an Episode, an Event's copy, a Template, an Explorable page or a Guide): `dir` is the
 * folder, `entries` its `import.meta.glob('./slides/*\/slide.tsx')`, which puts every Slide in the test's import graph,
 * and `page` its `import.meta.glob('./episode.ts')`, which puts its composition there: Sections, markers and own text.
 * A folder with no page, such as a test's fixture, hands `{}`.
 */
export function episodeChecks(dir: string, entries: GlobEntries, page: GlobEntries): EpisodeChecks {
  const { slides, folder } = slideFolderChecks(path.join(dir, SLIDES_DIR), `${SLIDES_DIR}/`, entries);
  const codeFolders: NamedCheck = {
    name: 'keeps no Episode-level parts/ or client/ folder: Slide code lives only in its Slide folder',
    findings: async () => EPISODE_CODE_FOLDERS.filter((kind) => existsSync(path.join(dir, kind))),
  };
  return { slides, folder: [...folder, codeFolders, ...pageChecks(dir, page)] };
}

/** The checks of the Slide pool, whose Slide folders sit directly in `dir`: `entries` is `import.meta.glob('./*\/slide.tsx')`. */
export function slidePoolChecks(dir: string, entries: GlobEntries): EpisodeChecks {
  return slideFolderChecks(dir, '', entries);
}
