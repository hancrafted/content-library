import { episodeRef, guideRef, templateRef } from '@/content-store/catalogue/episode-id.pure';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isBound, lostAnchors, publishedAnchorsOf } from './published-anchors';

/*
 * Published anchors (FE-002): the parts each page folder's Episode-level checks read to hold its snapshot. Whether
 * every bound page still produces its published anchors runs per page folder (`composed-page-checks.ts`).
 */

describe('success cases', () => {
  it('binds a Template and a Guide, which have no status, and a published Episode', () => {
    // ARRANGE
    const pages = [templateRef('episode-template'), guideRef('setup-ai-agent-and-starter-folder')];
    const published = episodeRef('maintaining-markdown-for-ai');
    const expected = [true, true, true];
    // ACT
    const bound = [...pages.map((page) => isBound(page, undefined)), isBound(published, 'published')];
    // ASSERT
    expect(bound).toEqual(expected);
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

  it('fails an Episode that has no published-anchors.json and prints the sorted file as oxfmt writes it', async () => {
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
  it('leaves an upcoming Episode unbound, so its anchors may still move', () => {
    // ARRANGE
    const upcoming = episodeRef('ai-token-economy');
    const expected = false;
    // ACT
    const bound = isBound(upcoming, 'upcoming');
    // ASSERT
    expect(bound).toBe(expected);
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

  it('prints a list too long for one line one anchor per line, as oxfmt writes it', async () => {
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
