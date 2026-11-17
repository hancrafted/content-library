import {
  folderOf,
  type EpisodeRef,
  type ExplorablePageRef,
  type GuideRef,
  type TemplateRef,
} from '@/content-store/catalogue/episode-id.pure';
import { hasPage } from '@/content-store/catalogue/record-routes';
import type { EpisodeStatus } from '@/content-store/schemas/episode.schema';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ComposedPage } from './composed-page';
import { placeSections, type SectionList, type SlideOutline } from './episode.pure';
import { formatAsRepo } from './oxfmt-format.ts';

/*
 * Published anchors (FE-002 §5.2): every Slide anchor a page has ever put in a URL stays reachable.
 * `<page>/published-anchors.json` snapshots them; a Slide may be added freely, but an anchor in the snapshot MUST still
 * be produced by the walk (`placeSections`). Each page folder's Episode-level checks hold its own snapshot
 * (`composed-page-checks.ts`) with `publishedAnchorFindings`.
 */

/** A page whose anchors may be bound: an Episode, a Template, an Explorable page or a Guide. */
type Page = EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef;

/** The snapshot in the page's folder: an Event's copy's under its Event, a Template's under `templates/`. */
function snapshotPath(page: Page): string {
  return path.join(import.meta.dirname, '..', folderOf(page), 'published-anchors.json');
}

/** The file to paste for a new Episode: its anchors sorted, formatted with the repo's oxfmt config so `format:check` accepts it. */
async function snapshotFile(file: string, produced: readonly string[]): Promise<string> {
  return formatAsRepo(file, JSON.stringify([...new Set(produced)].sort()));
}

/** The snapshot's anchors, or a thrown file to paste when the Episode has none. */
export async function publishedAnchorsOf(page: Page, produced: readonly string[]): Promise<string[]> {
  const file = snapshotPath(page);
  if (!existsSync(file)) {
    const contents = await snapshotFile(file, produced);
    throw new Error(
      `Episode "${page.id}" has no published-anchors.json. Create ${file} with this content:\n${contents}\n`,
    );
  }
  return JSON.parse(readFileSync(file, 'utf8')) as string[];
}

/** One message per published anchor the walk no longer produces. */
export function lostAnchors(walk: {
  slug: string;
  published: readonly string[];
  produced: readonly string[];
}): string[] {
  const { slug, published, produced } = walk;
  return published
    .filter((anchor) => !produced.includes(anchor))
    .map(
      (anchor) =>
        `Episode "${slug}" no longer produces the anchor "${anchor}". It is a published anchor: a shared link may point at it. Remove it from published-anchors.json only deliberately.`,
    );
}

/**
 * Whether a page's anchors are bound: an Episode's once it is no longer upcoming, whose anchors bind when it is published
 * (docs/features/episode-publishing.md); a Template's, an Explorable page's and a Guide's always, having no status.
 */
export function isBound(page: Page, status: EpisodeStatus | undefined): boolean {
  return page.kind === 'standalone' || page.kind === 'event-copy' ? status !== 'upcoming' && hasPage(page) : true;
}

/** What the published-anchor check reads of a page's composition: its Sections of Slides. */
interface ComposedSections {
  readonly sections: readonly SectionList<SlideOutline>[];
}

/** The anchors the walk produces for a page, as the Episode page does: its record's Section lists. */
function producedAnchors({ sections }: ComposedSections): string[] {
  return placeSections(sections).flatMap((section) => section.map(({ id }) => id));
}

/** Whether a snapshot is sorted with no anchor twice, as the file to paste writes it. */
const sortedAndUnique = (anchors: readonly string[]): boolean => anchors.join() === [...new Set(anchors)].sort().join();

/** A bound page's published anchors it no longer produces, a snapshot out of order, or the snapshot it lacks. */
export async function publishedAnchorFindings(
  page: ComposedPage,
  status: EpisodeStatus | undefined,
  composition: ComposedSections,
): Promise<string[]> {
  if (!isBound(page, status)) return [];
  const produced = producedAnchors(composition);
  try {
    const published = await publishedAnchorsOf(page, produced);
    const order = sortedAndUnique(published) ? [] : ['published-anchors.json is not sorted and unique'];
    return [...lostAnchors({ slug: page.id, published, produced }), ...order];
  } catch (error) {
    return [(error as Error).message];
  }
}
