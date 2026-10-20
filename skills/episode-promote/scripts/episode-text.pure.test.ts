import { describe, expect, it } from 'vitest';
import { episodeText, type EpisodeWords } from './episode-text.pure.ts';

const WORDS: EpisodeWords = {
  episode: { title: 'Cash first', caption: 'Start before you need it.' },
  sections: [
    [
      {
        slug: 'why-cash',
        messages: {
          title: 'Why cash',
          caption: 'Money arrives late.',
          voiceScript: { segments: { open: { title: 'Open', keywords: '', script: 'Revenue is late.' } } },
        },
      },
      {
        slug: 'watch-cash',
        messages: {
          title: 'Watch cash',
          caption: 'Four months on a board.',
          voiceScript: {
            segments: {
              costs: { title: 'Costs first', keywords: '', script: 'Costs begin before customers.' },
              zero: { title: 'Zero month', keywords: '', script: 'Find your zero-cash month.' },
            },
          },
          notes: {
            burn: {
              header: 'A high burn rate is a clock',
              description: 'Spend little while working fast.[1]',
              sources: { funding: { title: 'Paul Graham, Startup Funding' } },
            },
          },
        },
      },
    ],
  ],
};

describe('episodeText', () => {
  describe('success cases', () => {
    it("prints the Episode's words as markdown: Sections at h2, page Slides at h3, Voice script and Speaker notes with sources", () => {
      // ARRANGE
      const expected = [
        '# Cash first',
        '',
        'Start before you need it.',
        '',
        '## Why cash {#why-cash}',
        '',
        'Money arrives late.',
        '',
        '**Voice script**',
        '',
        '- **Open:** Revenue is late.',
        '',
        '### Watch cash {#watch-cash}',
        '',
        'Four months on a board.',
        '',
        '**Voice script**',
        '',
        '- **Costs first:** Costs begin before customers.',
        '- **Zero month:** Find your zero-cash month.',
        '',
        '**Speaker notes**',
        '',
        '- **A high burn rate is a clock:** Spend little while working fast.[1]',
        '  - [1] Paul Graham, Startup Funding',
        '',
      ].join('\n');

      // ACT
      const text = episodeText(WORDS);

      // ASSERT
      expect(text).toBe(expected);
    });
  });

  describe('failure cases', () => {
    it('refuses a Slide whose messages carry no title', () => {
      // ARRANGE
      const words: EpisodeWords = {
        episode: { title: 'Cash first' },
        sections: [[{ slug: 'untitled', messages: {} }]],
      };
      const message = /untitled/;

      // ACT
      const text = () => episodeText(words);

      // ASSERT
      expect(text).toThrow(message);
    });
  });

  describe('edge cases', () => {
    it('prints only the heading of a Slide with no caption, Voice script or Speaker notes', () => {
      // ARRANGE
      const words: EpisodeWords = {
        episode: { title: 'Cash first' },
        sections: [[{ slug: 'quiet', messages: { title: 'Quiet' } }]],
      };
      const expected = '# Cash first\n\n## Quiet {#quiet}\n';

      // ACT
      const text = episodeText(words);

      // ASSERT
      expect(text).toBe(expected);
    });
  });
});
