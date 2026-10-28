import { describe, expect, it } from 'vitest';
import { classify, linksIn, resourcesOf, summarize } from './check-sources.pure.ts';

/*
 * `npm run check:sources`: which URLs a research file cites, how one fetch outcome is judged,
 * and when the run fails. Fetching is the script's job; the outcomes here are hand-written.
 */

const FILE = `---
type: research
sources:
  - id: 1
    resource: https://example.com/a
    title: A
  - id: 2
    resource: 'https://example.org/b'
    title: B
---
# Q
`;
describe('success cases', () => {
  describe('resourcesOf', () => {
    it('lists the resource of every source in the frontmatter', () => {
      // ARRANGE
      const text = FILE;
      // ACT
      const resources = resourcesOf(text);
      // ASSERT
      expect(resources).toEqual(['https://example.com/a', 'https://example.org/b']);
    });
  });

  describe('classify', () => {
    it.each([
      [{ status: 200 }, 'ok'],
      [{ status: 204 }, 'ok'],
      [{ status: 404 }, 'dead'],
      [{ status: 410 }, 'dead'],
      [{ status: 401 }, 'unverifiable'],
      [{ status: 403 }, 'unverifiable'],
      [{ status: 429 }, 'unverifiable'],
      [{ status: 503 }, 'unverifiable'],
      [{ status: 418 }, 'unverifiable'],
      [{ error: 'ENOTFOUND' }, 'dead'],
      [{ error: 'EAI_AGAIN' }, 'dead'],
      [{ error: 'timeout' }, 'unverifiable'],
      [{ error: 'ECONNRESET' }, 'unverifiable'],
    ] as const)('judges %j as %s', (outcome, expected) => {
      // ARRANGE
      // ACT
      const verdict = classify(outcome);
      // ASSERT
      expect(verdict).toBe(expected);
    });
  });

  it('finds every link of a page or a markdown result once, in order: markdown links, bare URLs, src and href', () => {
    // ARRANGE
    const text = [
      'See [the stay](https://a.example/stay) and https://b.example/map.',
      '<img src="https://c.example/p.jpg"> <a href="https://a.example/stay">again</a>',
    ].join('\n');
    const expected = ['https://a.example/stay', 'https://b.example/map', 'https://c.example/p.jpg'];
    // ACT
    const links = linksIn(text);
    // ASSERT
    expect(links).toEqual(expected);
  });
});

describe('failure cases', () => {
  describe('summarize', () => {
    it('counts the verdicts and fails only on a dead link', () => {
      // ARRANGE
      const verdicts = ['ok', 'unverifiable', 'ok'] as const;
      const withDead = [...verdicts, 'dead'] as const;
      const expected = { ok: 2, dead: 0, unverifiable: 1, failed: false };
      // ACT
      const clean = summarize(verdicts);
      const failed = summarize(withDead);
      // ASSERT
      expect(clean).toEqual(expected);
      expect(failed.failed).toBe(true);
    });
  });

  it('finds no link in text that holds none', () => {
    // ARRANGE
    const text = 'No sources were found; see the open doubts.';
    // ACT
    const links = linksIn(text);
    // ASSERT
    expect(links).toEqual([]);
  });
});

describe('edge cases', () => {
  describe('resourcesOf', () => {
    it('lists nothing for a file without frontmatter sources', () => {
      // ARRANGE
      const texts = ['# Q\n', '---\ntype: research\n---\n', '---\nsources: [oops\n---\n'];
      // ACT
      const resources = texts.map(resourcesOf);
      // ASSERT
      expect(resources).toEqual([[], [], []]);
    });
  });

  it('leaves the punctuation and backticks around a link out of it, and keeps a query', () => {
    // ARRANGE
    const text = 'Rates (https://d.example/rates?week=36), map: `https://e.example/m`; end https://f.example/.';
    const expected = ['https://d.example/rates?week=36', 'https://e.example/m', 'https://f.example/'];
    // ACT
    const links = linksIn(text);
    // ASSERT
    expect(links).toEqual(expected);
  });
});
