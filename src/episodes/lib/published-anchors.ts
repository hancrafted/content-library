import type { EpisodeStatus } from '@/content-store/schemas/episode.schema';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ComposedPage } from './composed-page';
import { placeSections, type SectionList, type SlideOutline } from './episode.pure';
import { formatAsRepo } from './oxfmt-format.ts';

/*
 * Published anchors (FE-002 §5.2): every Slide anchor a page has ever put in a URL stays reachable.
 * `<page>/published-anchors.json` snapshots them; a Slide may be added freely, but an anchor in the snapshot MUST still
 * be produced by the walk (`placeSections`). A page folder's composition checks read its snapshot once
 * (`readPublishedSnapshot`, from `composed-page-context.ts`) and judge it (`publishedAnchorFindings`).
 */

const SNAPSHOT_FILE = 'published-anchors.json';

/** The snapshot a page folder lacks: the file to create and its content, ready to paste. */
export interface MissingSnapshot {
  readonly file: string;
  readonly contents: string;
}

/** A page folder's snapshot: its anchors, or, when it has none, the one to create. */
export type PublishedSnapshot = { readonly anchors: readonly string[] } | { readonly missing: MissingSnapshot };

/** What the published-anchor check reads of a page's context: its status and its snapshot. */
interface PublishedContext {
  readonly status: EpisodeStatus | undefined;
  readonly published: PublishedSnapshot;
}

/** What the published-anchor check reads of a page's composition: its Sections of Slides. */
interface ComposedSections {
  readonly sections: readonly SectionList<SlideOutline>[];
}

/** The anchors the walk produces for a page, as the Episode page does: its record's Section lists. */
export function producedAnchors({ sections }: ComposedSections): string[] {
  return placeSections(sections).flatMap((section) => section.map(({ id }) => id));
}

/**
 * The snapshot in the page folder `dir`. When it has none, the file to paste for the anchors it produces: sorted, and
 * formatted with the repo's oxfmt config so `format:check` accepts it.
 */
export async function readPublishedSnapshot(dir: string, produced: readonly string[]): Promise<PublishedSnapshot> {
  const file = path.join(dir, SNAPSHOT_FILE);
  if (existsSync(file)) return { anchors: JSON.parse(readFileSync(file, 'utf8')) as string[] };
  return { missing: { file, contents: await formatAsRepo(file, JSON.stringify([...new Set(produced)].sort())) } };
}

/** One message per published anchor the walk no longer produces. */
function lostAnchors(id: string, published: readonly string[], produced: readonly string[]): string[] {
  return published
    .filter((anchor) => !produced.includes(anchor))
    .map(
      (anchor) =>
        `Episode "${id}" no longer produces the anchor "${anchor}". It is a published anchor: a shared link may point at it. Remove it from published-anchors.json only deliberately.`,
    );
}

/** Whether a snapshot is sorted with no anchor twice, as the file to paste writes it. */
const sortedAndUnique = (anchors: readonly string[]): boolean => anchors.join() === [...new Set(anchors)].sort().join();

/**
 * Whether a page's anchors are bound: an Episode's once it is no longer upcoming, whose anchors bind when it is published
 * (docs/features/episode-publishing.md); a Template's, an Explorable page's and a Guide's always, having no status.
 */
function isBound(page: ComposedPage, status: EpisodeStatus | undefined): boolean {
  return page.kind === 'standalone' || page.kind === 'event-copy' ? status !== 'upcoming' : true;
}

/** A bound page's published anchors it no longer produces, a snapshot out of order, or the snapshot it lacks. */
export function publishedAnchorFindings(
  page: ComposedPage,
  { status, published: snapshot }: PublishedContext,
  composition: ComposedSections,
): string[] {
  if (!isBound(page, status)) return [];
  if ('missing' in snapshot) {
    const { file, contents } = snapshot.missing;
    return [`Episode "${page.id}" has no ${SNAPSHOT_FILE}. Create ${file} with this content:\n${contents}\n`];
  }
  const order = sortedAndUnique(snapshot.anchors) ? [] : [`${SNAPSHOT_FILE} is not sorted and unique`];
  return [...lostAnchors(page.id, snapshot.anchors, producedAnchors(composition)), ...order];
}
