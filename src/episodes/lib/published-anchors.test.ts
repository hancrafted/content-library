import {
  episodeRef,
  explorablePageRef,
  folderOf,
  guideRef,
  templateRef,
  type EpisodeRef,
  type ExplorablePageRef,
  type GuideRef,
  type TemplateRef,
} from '@/content-store/catalogue/episode-id.pure';
import {
  EXPLORABLE_PAGE_SLUGS,
  GUIDE_SLUGS,
  hasPage,
  TEMPLATE_SLUGS,
  type TemplateSlug,
} from '@/content-store/catalogue/record-routes';
import type { EpisodeStatus } from '@/content-store/schemas/episode.schema';
import { listEpisodes } from '@/content-store/store';
import { placeSections, type SlideOutline } from '@/episodes/lib/episode.pure';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';
import { compositionOf, type ComposedPage } from './registry';

/*
 * Published anchors (FE-002): every Slide anchor an Episode has ever put in a
 * URL stays reachable. `<episode>/published-anchors.json` snapshots them; a
 * Slide may be added freely, but an anchor in the snapshot MUST still be
 * produced by the walk (`placeSections`). Anchors come from the record's
 * Section lists alone, so they cannot differ by locale.
 */

/** A page whose anchors may be bound: an Episode, a Template, an Explorable page or a Guide. */
type Page = EpisodeRef | TemplateRef | ExplorablePageRef | GuideRef;

/** The snapshot in the page's folder: an Event's copy's under its Event, a Template's under `templates/`. */
function snapshotPath(page: Page): string {
  return path.join(__dirname, '..', folderOf(page), 'published-anchors.json');
}

/** The file to paste for a new Episode: its anchors sorted, formatted with the repo's prettier config so `prettier --check` accepts it. */
async function snapshotFile(file: string, produced: readonly string[]): Promise<string> {
  const options = await resolveConfig(file);
  return format(JSON.stringify([...new Set(produced)].sort()), { ...options, filepath: file });
}

/** The snapshot's anchors, or a thrown file to paste when the Episode has none. */
async function publishedAnchorsOf(page: Page, produced: readonly string[]): Promise<string[]> {
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
function lostAnchors(walk: { slug: string; published: readonly string[]; produced: readonly string[] }): string[] {
  const { slug, published, produced } = walk;
  return published
    .filter((anchor) => !produced.includes(anchor))
    .map(
      (anchor) =>
        `Episode "${slug}" no longer produces the anchor "${anchor}". It is a published anchor: a shared link may point at it. Remove it from published-anchors.json only deliberately.`,
    );
}

/**
 * The pages whose anchors are bound: every Episode with a page but an upcoming one, whose anchors bind when it is
 * published (docs/features/episode-publishing.md), and every Template, Explorable page and Guide, which has no status and is always bound.
 */
function boundPages(
  episodes: readonly { ref: EpisodeRef; status: EpisodeStatus }[],
  tooling: readonly TemplateSlug[],
): ComposedPage[] {
  const bound = episodes.flatMap(({ ref, status }) => (status !== 'upcoming' && hasPage(ref) ? [ref] : []));
  return [
    ...tooling.map(templateRef),
    ...EXPLORABLE_PAGE_SLUGS.map(explorablePageRef),
    ...GUIDE_SLUGS.map(guideRef),
    ...bound,
  ];
}

/** The anchors the walk produces for one page, as the Episode page does: its record's Section lists. */
function producedAnchors(page: ComposedPage): string[] {
  return placeSections<SlideOutline>(compositionOf(page).sections).flatMap((section) => section.map(({ id }) => id));
}

describe('success cases', () => {
  it('still produces every published anchor of every registered Episode', async () => {
    // ARRANGE
    const cases = boundPages(listEpisodes(), TEMPLATE_SLUGS);
    // ACT
    const lostPerEpisode = await Promise.all(
      cases.map(async (page) => {
        const produced = producedAnchors(page);
        return lostAnchors({ slug: page.id, published: await publishedAnchorsOf(page, produced), produced });
      }),
    );
    const lost = lostPerEpisode.flat();
    // ASSERT
    expect(lost).toEqual([]);
  });

  it('keeps each published-anchors.json a sorted array of unique strings', async () => {
    // ARRANGE
    const snapshots = await Promise.all(
      boundPages(listEpisodes(), TEMPLATE_SLUGS).map((page) => publishedAnchorsOf(page, producedAnchors(page))),
    );
    // ACT
    const unsorted = snapshots.filter((anchors) => anchors.join() !== [...new Set(anchors)].sort().join());
    // ASSERT
    expect(unsorted).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names a published anchor the walk stopped producing and says it was shared', () => {
    // ARRANGE
    const published = ['foundations', 'foundations--why'];
    const produced = ['foundations'];
    const expectedAnchor = 'foundations--why';
    const expectedShared = 'published anchor';
    const expectedAdvice = 'Remove it from published-anchors.json only deliberately.';
    // ACT
    const [message, ...rest] = lostAnchors({ slug: 'demo', published, produced });
    // ASSERT
    expect(message).toContain(expectedAnchor);
    expect(message).toContain(expectedShared);
    expect(message).toContain(expectedAdvice);
    expect(rest).toEqual([]);
  });

  it('fails an Episode that has no published-anchors.json and prints the sorted file as prettier writes it', async () => {
    // ARRANGE
    const unregistered = episodeRef('no-such-episode');
    const produced = ['demo--why', 'demo', 'demo--how'];
    const expectedFile = path.join('no-such-episode', 'published-anchors.json');
    const expectedJson = '\n["demo", "demo--how", "demo--why"]\n\n';
    // ACT
    const read = publishedAnchorsOf(unregistered, produced);
    // ASSERT
    await expect(read).rejects.toThrow(expectedFile);
    await expect(read).rejects.toThrow(expectedJson);
  });
});

describe('edge cases', () => {
  it('skips an upcoming Episode with a page and binds a published one', () => {
    // ARRANGE
    const episodes: { ref: EpisodeRef; status: EpisodeStatus }[] = [
      { ref: episodeRef('maintaining-markdown-for-ai'), status: 'published' },
      { ref: episodeRef('ai-token-economy'), status: 'upcoming' },
    ];
    const expected = ['episode-template', ...EXPLORABLE_PAGE_SLUGS, ...GUIDE_SLUGS, 'maintaining-markdown-for-ai'];
    // ACT
    const bound = boundPages(episodes, ['episode-template']).map(({ id }) => id);
    // ASSERT
    expect(bound).toEqual(expected);
  });

  it('allows a new anchor the snapshot does not list', () => {
    // ARRANGE
    const published = ['foundations'];
    const produced = ['foundations', 'foundations--brand-new'];
    // ACT
    const lost = lostAnchors({ slug: 'demo', published, produced });
    // ASSERT
    expect(lost).toEqual([]);
  });

  it('prints a list too long for one line one anchor per line, as prettier writes it', async () => {
    // ARRANGE
    const produced = [
      'why-context-runs-out',
      'why-context-runs-out--the-lost-middle',
      'why-context-runs-out--the-fullness-gauge',
      'why-context-runs-out--levers',
    ];
    const expectedJson = [
      '[',
      '  "why-context-runs-out",',
      '  "why-context-runs-out--levers",',
      '  "why-context-runs-out--the-fullness-gauge",',
      '  "why-context-runs-out--the-lost-middle"',
      ']',
      '',
    ].join('\n');
    // ACT
    const read = publishedAnchorsOf(episodeRef('no-such-episode'), produced);
    // ASSERT
    await expect(read).rejects.toThrow(expectedJson);
  });
});
