import { episodeFolderOf, episodeRefOf, TOOLING_FOLDER } from '@/content-store/catalogue/episode-id.pure';
import { EPISODES_PATH_SLUGS, isToolingSlug, type EpisodesPathSlug } from '@/content-store/catalogue/record-routes';
import type { EpisodeStatus } from '@/content-store/schemas/episode.schema';
import { listEpisodes } from '@/content-store/store';
import { placeSections, type SlideOutline } from '@/episodes/lib/episode.pure';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';
import { findPageRecord } from './tooling-pages';

/*
 * Published anchors (FE-002): every Slide anchor an Episode has ever put in a
 * URL stays reachable. `<episode>/published-anchors.json` snapshots them; a
 * Slide may be added freely, but an anchor in the snapshot MUST still be
 * produced by the walk (`placeSections`). Anchors come from the record's
 * Section lists alone, so they cannot differ by locale.
 */

/** The snapshot in the page's folder, an Event's copy's under its Event, by Episode id; a tooling page's under `tooling/`. */
function snapshotPath(id: string): string {
  const folder = isToolingSlug(id) ? path.join(TOOLING_FOLDER, id) : episodeFolderOf(episodeRefOf(id));
  return path.join(__dirname, '..', folder, 'published-anchors.json');
}

/** The file to paste for a new Episode: its anchors sorted, formatted with the repo's prettier config so `prettier --check` accepts it. */
async function snapshotFile(file: string, produced: readonly string[]): Promise<string> {
  const options = await resolveConfig(file);
  return format(JSON.stringify([...new Set(produced)].sort()), { ...options, filepath: file });
}

/** The snapshot's anchors, or a thrown file to paste when the Episode has none. */
async function publishedAnchorsOf(slug: string, produced: readonly string[]): Promise<string[]> {
  const file = snapshotPath(slug);
  if (!existsSync(file)) {
    const contents = await snapshotFile(file, produced);
    throw new Error(
      `Episode "${slug}" has no published-anchors.json. Create ${file} with this content:\n${contents}\n`,
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
 * The pages under `/episodes/` whose anchors are bound: every one but an upcoming
 * Episode, whose anchors bind when it is published (docs/features/episode-publishing.md).
 * A tooling page has no status and is always bound.
 */
function boundSlugs(
  registered: readonly EpisodesPathSlug[],
  episodes: readonly { id: string; status: EpisodeStatus }[],
): EpisodesPathSlug[] {
  const upcoming = episodes.filter(({ status }) => status === 'upcoming').map(({ id }) => id);
  return registered.filter((slug) => !upcoming.includes(slug));
}

/** The anchors the walk produces for one Episode, as the Episode page does: its record's Section lists. */
function producedAnchors(slug: EpisodesPathSlug): string[] {
  return placeSections<SlideOutline>(findPageRecord(slug).sections).flatMap((section) => section.map(({ id }) => id));
}

describe('success cases', () => {
  it('still produces every published anchor of every registered Episode', async () => {
    // ARRANGE
    const cases = boundSlugs(EPISODES_PATH_SLUGS, listEpisodes());
    // ACT
    const lostPerEpisode = await Promise.all(
      cases.map(async (slug) => {
        const produced = producedAnchors(slug);
        return lostAnchors({ slug, published: await publishedAnchorsOf(slug, produced), produced });
      }),
    );
    const lost = lostPerEpisode.flat();
    // ASSERT
    expect(lost).toEqual([]);
  });

  it('keeps each published-anchors.json a sorted array of unique strings', async () => {
    // ARRANGE
    const snapshots = await Promise.all(
      boundSlugs(EPISODES_PATH_SLUGS, listEpisodes()).map((slug) => publishedAnchorsOf(slug, producedAnchors(slug))),
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
    const unregistered = 'no-such-episode';
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
    const episodes: { id: string; status: EpisodeStatus }[] = [
      { id: 'maintaining-markdown-for-ai', status: 'published' },
      { id: 'ai-token-economy', status: 'upcoming' },
    ];
    const expected = ['episode-template', 'maintaining-markdown-for-ai'];
    // ACT
    const bound = boundSlugs(['episode-template', 'maintaining-markdown-for-ai', 'ai-token-economy'], episodes);
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
    const read = publishedAnchorsOf('no-such-episode', produced);
    // ASSERT
    await expect(read).rejects.toThrow(expectedJson);
  });
});
