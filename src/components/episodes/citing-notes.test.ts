import type { SlideSource } from '@/lib/slide-source.pure';
import { describe, expect, it } from 'vitest';
import { citingNotes } from './citing-notes';

/*
 * The Speaker notes a Research page lists (design-ADR 0016, Citations rule 6): every note of a listed Episode that
 * cites the question, named by its Episode and header and placed at its Slide's anchor.
 */

const AT = { episode: 'onboard-ai-every-time', slide: 'brief-the-venue' } as const;

describe('success cases', () => {
  it('A Research page lists the Speaker notes that cite it', () => {
    // ARRANGE
    const sources: SlideSource[] = [
      { ...AT, note: 'focus-beats-volume', slug: 'onboarding', research: 'AIE-0001' },
      { ...AT, note: 'a-wrong-early-guess-sticks', slug: 'other', research: 'LLM-0001' },
    ];
    const expected = [
      {
        episode: 'onboard-ai-every-time',
        episodeTitle: 'Treat AI like a brilliant freelancer with amnesia',
        header: 'Focus beats volume',
        path: '/episodes/onboard-ai-every-time',
        anchor: 'five-moves-to-brief-a-freelancer--brief-the-venue',
      },
    ];
    // ACT
    const notes = citingNotes(sources, 'AIE-0001');
    // ASSERT
    expect(notes).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lists no note when only a Source cited directly shares the slug', () => {
    // ARRANGE
    const sources: SlideSource[] = [{ ...AT, note: 'focus-beats-volume', slug: 'AIE-0001', url: 'https://a.example' }];
    // ACT
    const notes = citingNotes(sources, 'AIE-0001');
    // ASSERT
    expect(notes).toEqual([]);
  });
});

describe('edge cases', () => {
  it('lists a note once when it cites the question twice, and leaves out an unlisted Episode', () => {
    // ARRANGE
    const sources: SlideSource[] = [
      { ...AT, note: 'focus-beats-volume', slug: 'onboarding', research: 'AIE-0001' },
      { ...AT, note: 'focus-beats-volume', slug: 'again', research: 'AIE-0001' },
      { episode: 'axel-agentic-workflow-agenda', slide: 'title', note: 'any', slug: 'x', research: 'AIE-0001' },
    ];
    const expected = ['Focus beats volume'];
    // ACT
    const notes = citingNotes(sources, 'AIE-0001');
    // ASSERT
    expect(notes.map(({ header }) => header)).toEqual(expected);
  });
});
