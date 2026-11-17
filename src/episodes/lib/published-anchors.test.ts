// decision: FE-002 §5
import { episodeRef, guideRef, templateRef } from '@/content-store/catalogue/episode-id.pure';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { publishedAnchorFindings, readPublishedSnapshot } from './published-anchors';

/** A folder no page lives in, so it holds no snapshot. */
const NO_SNAPSHOT = path.join(import.meta.dirname, 'no-such-episode');

const NO_SNAPSHOT_FILE = path.join(NO_SNAPSHOT, 'published-anchors.json');

const COMPOSITION = { sections: [[{ slug: 'foundations' }, { slug: 'why' }] as const] };

describe('success cases', () => {
  it('binds a Template and a Guide, which have no status, and a published Episode', () => {
    // ARRANGE
    const pages = [templateRef('episode-template'), guideRef('setup-ai-agent-and-starter-folder')];
    const published = episodeRef('maintaining-markdown-for-ai');
    const snapshot = { anchors: ['foundations--gone'] };
    const expected = [1, 1, 1];
    // ACT
    const found = [
      ...pages.map(
        (page) => publishedAnchorFindings(page, { status: undefined, published: snapshot }, COMPOSITION).length,
      ),
      publishedAnchorFindings(published, { status: 'published', published: snapshot }, COMPOSITION).length,
    ];
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names a published anchor the walk stopped producing and says it was shared', () => {
    // ARRANGE
    const snapshot = { anchors: ['foundations', 'foundations--gone'] };
    const expectedAnchor = 'foundations--gone';
    const expectedShared = 'published anchor';
    const expectedAdvice = 'Remove it from published-anchors.json only deliberately.';
    // ACT
    const [message, ...rest] = publishedAnchorFindings(
      templateRef('grids'),
      { status: undefined, published: snapshot },
      COMPOSITION,
    );
    // ASSERT
    expect(message).toContain(expectedAnchor);
    expect(message).toContain(expectedShared);
    expect(message).toContain(expectedAdvice);
    expect(rest).toEqual([]);
  });

  it('reads no snapshot from a folder without one, and hands the sorted file as oxfmt writes it', async () => {
    // ARRANGE
    const produced = ['demo--why', 'demo', 'demo--how'];
    const expected = {
      missing: {
        file: NO_SNAPSHOT_FILE,
        contents: '["demo", "demo--how", "demo--why"]\n',
      },
    };
    // ACT
    const snapshot = await readPublishedSnapshot(NO_SNAPSHOT, produced);
    // ASSERT
    expect(snapshot).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leaves an upcoming Episode unbound, so its anchors may still move', () => {
    // ARRANGE
    const snapshot = { anchors: ['foundations--gone'] };
    const expected: string[] = [];
    // ACT
    const found = publishedAnchorFindings(
      episodeRef('ai-token-economy'),
      { status: 'upcoming', published: snapshot },
      COMPOSITION,
    );
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('allows a new anchor the snapshot does not list', () => {
    // ARRANGE
    const snapshot = { anchors: ['foundations'] };
    const expected: string[] = [];
    // ACT
    const found = publishedAnchorFindings(
      templateRef('grids'),
      { status: undefined, published: snapshot },
      COMPOSITION,
    );
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('prints a list too long for one line one anchor per line, as oxfmt writes it', async () => {
    // ARRANGE
    const produced = [
      'why-context-runs-out',
      'why-context-runs-out--the-lost-middle',
      'why-context-runs-out--the-fullness-gauge',
      'why-context-runs-out--levers',
    ];
    const expected = [
      '[',
      '  "why-context-runs-out",',
      '  "why-context-runs-out--levers",',
      '  "why-context-runs-out--the-fullness-gauge",',
      '  "why-context-runs-out--the-lost-middle"',
      ']',
      '',
    ].join('\n');
    // ACT
    const snapshot = await readPublishedSnapshot(NO_SNAPSHOT, produced);
    // ASSERT
    expect(snapshot).toEqual({
      missing: { file: NO_SNAPSHOT_FILE, contents: expected },
    });
  });
});
