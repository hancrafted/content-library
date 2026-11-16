import type { EpisodeStatus } from '@/content-store/schemas/episode.schema';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { ComposedPage } from './composed-page';
import { placeSections, type SectionList, type SlideOutline } from './episode.pure';
import { isBound, lostAnchors, publishedAnchorsOf } from './published-anchors';

/*
 * The Episode-level checks on the files a page folder keeps beside its record (ARCH-003 §4.7): its published anchors
 * (FE-002 §5.2) and its Section markers in `sections/` (FE-004 §3, design-ADR-0008). `composed-page-checks.ts` runs
 * them for one page folder, with the Sections its own `episode.ts` composes.
 */

/** What these checks read of a page's composition: its Sections of Slides. */
export interface ComposedSections {
  readonly sections: readonly SectionList<SlideOutline>[];
}

const MARKERS_DIR = 'sections';

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

/** The marker module names of a page folder, without the extension. */
function markerNames(dir: string): string[] {
  return readdirSync(path.join(dir, MARKERS_DIR))
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .map((file) => file.slice(0, -'.ts'.length))
    .sort();
}

/** One marker against its Section: it exports exactly one Slide list, its section slide first, and that list is the Section. */
async function markerFindings(dir: string, name: string, sections: ComposedSections['sections']): Promise<string[]> {
  const exported: unknown[] = Object.values(await import(path.join(dir, MARKERS_DIR, `${name}.ts`)));
  const firsts = (exported.filter(Array.isArray) as { slug: string }[][]).map(([first]) => first?.slug).join(', ');
  const section = sections.find(([opener]) => opener.slug === name);
  return [
    ...(firsts === name ? [] : [`${MARKERS_DIR}/${name}.ts exports lists opening ${firsts}`]),
    ...(section === undefined || exported.includes(section)
      ? []
      : [`Section ${name} is not the list ${MARKERS_DIR}/${name}.ts exports`]),
  ];
}

/** A page folder's Section markers against its record: one per Section, named after its section slide, none astray. */
export async function placementMarkerFindings(dir: string, { sections }: ComposedSections): Promise<string[]> {
  if (!existsSync(path.join(dir, MARKERS_DIR))) return [];
  const openers = sections.map(([opener]) => opener.slug);
  const names = markerNames(dir);
  const missing = openers.filter((slug) => !names.includes(slug)).map((slug) => `no marker for Section ${slug}`);
  const strays = names
    .filter((name) => !openers.includes(name))
    .map((name) => `${MARKERS_DIR}/${name}.ts names no Section of the record`);
  const lists = await Promise.all(names.map((name) => markerFindings(dir, name, sections)));
  return [...missing, ...strays, ...lists.flat()];
}
