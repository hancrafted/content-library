import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { composedPageChecks, type GlobEntries, type NamedCheck } from './composed-page-checks';

/*
 * The Episode-level checks (ARCH-003 §4.7): every invariant that holds inside one page folder, run on that folder
 * alone. Each page folder, and the Slide pool, has its own `episode-checks.test.ts` that hands its folder and its Slide
 * entries here, so `vitest --changed` runs only the checks of the Episode an edit touched, and each test's cost stays
 * one Episode. An invariant that spans Episodes stays in one test that reads an index, never every folder.
 *
 * A check returns findings and never throws, so a broken Episode's test names what broke. Add a new Episode-level
 * check here, to `slides` (one per Slide folder) or `folder` (one per page folder), or to `composed-page-checks.ts` when
 * it reads the page's composition: every per-Episode test runs it without being edited.
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
/** A page folder's composition: the record that orders its Sections of Slides. */
const PAGE_ENTRY = 'episode.ts';
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
function slidesOf(module: unknown): { slug: string }[] {
  return Object.values(module as object).filter(
    (value): value is { slug: string } =>
      typeof value === 'object' && value !== null && 'slug' in value && 'messages' in value,
  );
}

function declaresNotes(value: unknown): value is DeclaringSlide {
  return typeof value === 'object' && value !== null && 'slug' in value && 'notes' in value && 'messages' in value;
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
      Object.values((await load()) as object)
        .filter(declaresNotes)
        .flatMap(({ slug, notes, messages }) => {
          const declared = new Set(notes.map((note) => note.slug));
          return Object.entries(messages).flatMap(([locale, strings]) =>
            Object.keys(strings.notes ?? {})
              .filter((key) => !declared.has(key))
              .map((key) => `${slug} ${locale}: notes.${key} is no declared Speaker note`),
          );
        }),
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

/**
 * The checks of one page folder (an Episode, an Event's copy, a Template, an Explorable page or a Guide): `dir` is the
 * folder, `entries` its `import.meta.glob('./slides/*\/slide.tsx')`, which puts every Slide in the test's import graph,
 * and `page` its `import.meta.glob('./episode.ts')`, which puts its composition there: Sections, markers and own text.
 */
export function episodeChecks(dir: string, entries: GlobEntries, page: GlobEntries = {}): EpisodeChecks {
  const { slides, folder } = slideFolderChecks(path.join(dir, SLIDES_DIR), `${SLIDES_DIR}/`, entries);
  const codeFolders: NamedCheck = {
    name: 'keeps no Episode-level parts/ or client/ folder: Slide code lives only in its Slide folder',
    findings: async () => EPISODE_CODE_FOLDERS.filter((kind) => existsSync(path.join(dir, kind))),
  };
  const handedOver: NamedCheck = {
    name: `hands its ${PAGE_ENTRY} to the checks, so none of its composition goes unchecked`,
    findings: async () =>
      existsSync(path.join(dir, PAGE_ENTRY)) && Object.keys(page).length === 0
        ? [`pass import.meta.glob('./${PAGE_ENTRY}') to episodeChecks`]
        : [],
  };
  return { slides, folder: [...folder, codeFolders, handedOver, ...composedPageChecks(dir, page)] };
}

/** The checks of the Slide pool, whose Slide folders sit directly in `dir`: `entries` is `import.meta.glob('./*\/slide.tsx')`. */
export function slidePoolChecks(dir: string, entries: GlobEntries): EpisodeChecks {
  return slideFolderChecks(dir, '', entries);
}
