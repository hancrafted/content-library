import { describe, expect, it } from 'vitest';
import { watchFor } from './watch.pure';

/* English links the AXEL Episodes, German the Akademie ones; the freelancer comes first in both. */

describe('success cases', () => {
  it('links the AXEL freelancer and attention-span Episodes in English', () => {
    // ARRANGE
    const expected = [
      '/events/2026-10-23-axel-agentic-workflow/episodes/onboard-ai-every-time',
      '/events/2026-10-23-axel-agentic-workflow/episodes/ai-attention-span',
    ];
    // ACT
    const found = watchFor('en').map((episode) => episode.path);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('links the Akademie freelancer and attention-span Episodes in German', () => {
    // ARRANGE
    const expected = [
      '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/onboard-ai-every-time',
      '/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow/episodes/ai-attention-span',
    ];
    // ACT
    const found = watchFor('de').map((episode) => episode.path);
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never offers the German Episodes to an English viewer', () => {
    // ARRANGE
    const forbidden = 'akademie';
    // ACT
    const found = watchFor('en').map((episode) => episode.path);
    // ASSERT
    expect(found.filter((path) => path.includes(forbidden))).toEqual([]);
  });
});

describe('edge cases', () => {
  it('gives both locales the same number of Episodes', () => {
    // ARRANGE
    const english = watchFor('en');
    // ACT
    const german = watchFor('de');
    // ASSERT
    expect(german).toHaveLength(english.length);
  });
});
