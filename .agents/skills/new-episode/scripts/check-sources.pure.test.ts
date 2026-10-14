import { describe, expect, it } from 'vitest';
import { classify, resourcesOf, summarize } from './check-sources.pure.ts';

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

describe('resourcesOf', () => {
  it('lists the resource of every source in the frontmatter', () => {
    // ARRANGE
    const text = FILE;
    // ACT
    const resources = resourcesOf(text);
    // ASSERT
    expect(resources).toEqual(['https://example.com/a', 'https://example.org/b']);
  });

  it('lists nothing for a file without frontmatter sources', () => {
    // ARRANGE
    const texts = ['# Q\n', '---\ntype: research\n---\n', '---\nsources: [oops\n---\n'];
    // ACT
    const resources = texts.map(resourcesOf);
    // ASSERT
    expect(resources).toEqual([[], [], []]);
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

describe('summarize', () => {
  it('counts the verdicts and fails only on a dead link', () => {
    // ARRANGE
    const verdicts = ['ok', 'unverifiable', 'ok'] as const;
    const withDead = [...verdicts, 'dead'] as const;
    // ACT
    const clean = summarize(verdicts);
    const failed = summarize(withDead);
    // ASSERT
    expect(clean).toEqual({ ok: 2, dead: 0, unverifiable: 1, failed: false });
    expect(failed.failed).toBe(true);
  });
});
