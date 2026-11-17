import { listEpisodes, listEvents } from '@/content-store/store';
import type { EpisodeComposition } from '@/episodes/components/slide-master/slide';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { ComposedPage } from './composed-page';
import {
  MARKERS_DIR,
  type CheckedPage,
  type PageContext,
  type PlaylistAnchor,
  type SectionMarker,
} from './composed-page-checks';
import { summaryOf } from './page-summary';
import { producedAnchors, readPublishedSnapshot, type MissingSnapshot } from './published-anchors';

/*
 * The production reader of a page folder's context for its composition checks (`composed-page-checks.ts`): every read
 * a page is judged against, in one place. It reads the store, the generated summaries and the page folder `dir` on
 * disk, so the published snapshot and the Section markers are the ones in `dir`. `episode-checks.ts` calls it for a
 * page folder whose test hands over its `episode.ts`.
 */

/**
 * The values a loaded module exports that carry every one of `keys`, read as `T`: how a page's `episode.ts` and a
 * Slide's entry are told apart from their other exports. `keys` names the fields that make a value a `T`.
 */
export function exportsCarrying<T extends object>(module: unknown, keys: readonly (keyof T & string)[]): T[] {
  return Object.values(module as object).filter(
    (value): value is T => typeof value === 'object' && value !== null && keys.every((key) => key in value),
  );
}

/** The composition an `episode.ts` module exports: its one value carrying Sections and own text. */
function compositionIn(module: unknown): EpisodeComposition {
  const [found] = exportsCarrying<EpisodeComposition>(module, ['sections', 'messages']);
  if (found === undefined) throw new Error('episode.ts exports no composition');
  return found;
}

/** The page's summary, or none when the generated index lacks it. */
function summaryIn(page: ComposedPage): PageContext['summary'] {
  try {
    return summaryOf(page);
  } catch {
    return undefined;
  }
}

/** Every Playlist entry that opens this page at an anchor, with the Event presenting it. */
function playlistAnchorsOf(page: ComposedPage): PlaylistAnchor[] {
  return listEvents().flatMap(({ slug, playlist }) =>
    playlist.episodes.flatMap(({ page: entry, anchor }) =>
      entry?.id === page.id && anchor !== undefined ? [{ event: slug, anchor }] : [],
    ),
  );
}

/** The Section markers in `dir`'s `sections/`, in name order, each with the values it exports. */
async function markersIn(dir: string): Promise<SectionMarker[] | undefined> {
  const folder = path.join(dir, MARKERS_DIR);
  if (!existsSync(folder)) return undefined;
  const names = readdirSync(folder)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .map((file) => file.slice(0, -'.ts'.length))
    .sort();
  return Promise.all(
    names.map(async (name) => ({ name, exports: Object.values(await import(path.join(folder, `${name}.ts`))) })),
  );
}

/**
 * The `published-anchors.json` the page folder `dir` lacks, for the composition `load` returns: the file and its
 * content, as the composition checks ask for it; none when `dir` has one. `copy-to-event.ts` writes it for an Event's copy.
 */
export async function missingPublishedSnapshot(
  dir: string,
  load: () => Promise<unknown>,
): Promise<MissingSnapshot | undefined> {
  const snapshot = await readPublishedSnapshot(dir, producedAnchors(compositionIn(await load())));
  return 'missing' in snapshot ? snapshot.missing : undefined;
}

/** The composition `load` returns and the context of `page`, held in the page folder `dir`. */
export async function readPage(dir: string, page: ComposedPage, load: () => Promise<unknown>): Promise<CheckedPage> {
  const composition = compositionIn(await load());
  const context: PageContext = {
    status: listEpisodes().find(({ ref }) => ref.id === page.id)?.status,
    summary: summaryIn(page),
    playlistAnchors: playlistAnchorsOf(page),
    published: await readPublishedSnapshot(dir, producedAnchors(composition)),
    markers: await markersIn(dir),
  };
  return { composition, context };
}
