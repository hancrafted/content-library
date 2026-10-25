import { describe, expect, it } from 'vitest';
import { pageFacts } from './page-facts';

/* The facts the visibility predicate reads, from the real content store. */

const EVENT = '2026-10-23-axel-agentic-workflow';

describe('success cases', () => {
  it("reads a public Episode's visibility and status from its metadata", () => {
    // ARRANGE
    const expected = { visibility: 'public', status: 'published' };
    // ACT
    const facts = pageFacts({ episode: 'ai-token-economy' });
    // ASSERT
    expect(facts).toEqual(expected);
  });

  it('reads the same facts for an Episode as its Event presents it', () => {
    // ARRANGE
    const expected = { visibility: 'unlisted', status: 'published' };
    // ACT
    const facts = pageFacts({ event: EVENT, episode: 'axel-agentic-workflow-agenda' });
    // ASSERT
    expect(facts).toEqual(expected);
  });

  it("reads an Event page's visibility from its Playlist", () => {
    // ARRANGE
    const expected = { visibility: 'unlisted' };
    // ACT
    const facts = pageFacts({ event: EVENT });
    // ASSERT
    expect(facts).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('gives a tooling page no facts, so nothing can index it', () => {
    // ARRANGE
    const expected = {};
    // ACT
    const facts = pageFacts({ tooling: 'slide-master' });
    // ASSERT
    expect(facts).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('treats the page template, which has no metadata, as public and published', () => {
    // ARRANGE
    const expected = { visibility: 'public', status: 'published' };
    // ACT
    const facts = pageFacts({ episode: 'page-template' });
    // ASSERT
    expect(facts).toEqual(expected);
  });
});
