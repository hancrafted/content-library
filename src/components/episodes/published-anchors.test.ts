import { findEpisode } from '@/components/episodes/registry';
import type { Slide } from '@/components/slide-master/episode-record';
import { placeSections } from '@/lib/episode.pure';
import { EPISODE_SLUGS } from '@/lib/routes';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Published anchors (FE-002): every Slide anchor an Episode has ever put in a
 * URL stays reachable. `<episode>/published-anchors.json` snapshots them; a
 * Slide may be added freely, but an anchor in the snapshot MUST still be
 * produced by the walk (`placeSections`). Anchors come from the record's
 * Section lists alone, so they cannot differ by locale.
 */

function snapshotPath(slug: string): string {
  return path.join(__dirname, slug, 'published-anchors.json');
}

/** The snapshot's anchors, or a thrown instruction when the Episode has none. */
function publishedAnchorsOf(slug: string): string[] {
  const file = snapshotPath(slug);
  if (!existsSync(file)) {
    throw new Error(
      `Episode "${slug}" has no published-anchors.json. Add ${file}: a sorted JSON array of its Slide anchors.`,
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

/** The anchors the walk produces for one Episode, as the Episode page does: its record's Section lists. */
function producedAnchors(slug: (typeof EPISODE_SLUGS)[number]): string[] {
  return placeSections<Slide>(findEpisode(slug).sections).flatMap((section) => section.map(({ id }) => id));
}

describe('success cases', () => {
  it('still produces every published anchor of every registered Episode', () => {
    // ARRANGE
    const cases = [...EPISODE_SLUGS];
    // ACT
    const lost = cases.flatMap((slug) =>
      lostAnchors({ slug, published: publishedAnchorsOf(slug), produced: producedAnchors(slug) }),
    );
    // ASSERT
    expect(lost).toEqual([]);
  });

  it('keeps each published-anchors.json a sorted array of unique strings', () => {
    // ARRANGE
    const snapshots = EPISODE_SLUGS.map((slug) => publishedAnchorsOf(slug));
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

  it('fails an Episode that has no published-anchors.json', () => {
    // ARRANGE
    const unregistered = 'no-such-episode';
    const expectedFile = 'published-anchors.json';
    // ACT
    const read = () => publishedAnchorsOf(unregistered);
    // ASSERT
    expect(read).toThrow(expectedFile);
  });
});

describe('edge cases', () => {
  it('allows a new anchor the snapshot does not list', () => {
    // ARRANGE
    const published = ['foundations'];
    const produced = ['foundations', 'foundations--brand-new'];
    // ACT
    const lost = lostAnchors({ slug: 'demo', published, produced });
    // ASSERT
    expect(lost).toEqual([]);
  });
});
