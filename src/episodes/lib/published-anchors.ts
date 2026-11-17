import type { EpisodeStatus } from '@/content-store/schemas/episode.schema';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ComposedPage } from './composed-page';
import { placeSections, type SectionList, type SlideOutline } from './episode.pure';
import { formatAsRepo } from './oxfmt-format.ts';

// decision: FE-002 §5.2
const SNAPSHOT_FILE = 'published-anchors.json';

export interface MissingSnapshot {
  readonly file: string;
  readonly contents: string;
}

export type PublishedSnapshot = { readonly anchors: readonly string[] } | { readonly missing: MissingSnapshot };

interface PublishedContext {
  readonly status: EpisodeStatus | undefined;
  readonly published: PublishedSnapshot;
}

interface ComposedSections {
  readonly sections: readonly SectionList<SlideOutline>[];
}

export function producedAnchors({ sections }: ComposedSections): string[] {
  return placeSections(sections).flatMap((section) => section.map(({ id }) => id));
}

export async function readPublishedSnapshot(dir: string, produced: readonly string[]): Promise<PublishedSnapshot> {
  const file = path.join(dir, SNAPSHOT_FILE);
  if (existsSync(file)) return { anchors: JSON.parse(readFileSync(file, 'utf8')) as string[] };
  return { missing: { file, contents: await formatAsRepo(file, JSON.stringify([...new Set(produced)].sort())) } };
}

function lostAnchors(id: string, published: readonly string[], produced: readonly string[]): string[] {
  return published
    .filter((anchor) => !produced.includes(anchor))
    .map(
      (anchor) =>
        `Episode "${id}" no longer produces the anchor "${anchor}". It is a published anchor: a shared link may point at it. Remove it from published-anchors.json only deliberately.`,
    );
}

const sortedAndUnique = (anchors: readonly string[]): boolean => anchors.join() === [...new Set(anchors)].sort().join();

function isBound(page: ComposedPage, status: EpisodeStatus | undefined): boolean {
  return page.kind === 'standalone' || page.kind === 'event-copy' ? status !== 'upcoming' : true;
}

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
