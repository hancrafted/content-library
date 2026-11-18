import { describe, expect, it } from 'vitest';
import { episodeOutlinesFile } from './episode-outline.pure.ts';

const textSourceOf = (folder: string, slug: string) => ({
  textSource: `src/episodes/${folder}/slides/${slug}/i18n`,
  pool: slug === 'shared',
});

function outlinesOf(...args: Parameters<typeof episodeOutlinesFile>): unknown {
  return JSON.parse(episodeOutlinesFile(...args).text);
}

describe('success cases', () => {
  describe('episodeOutlinesFile', () => {
    it('writes each Episode by id with its Title, Sections, anchors and every Slide text source', () => {
      // ARRANGE
      const episodes = [
        {
          id: 'cash',
          folder: 'cash',
          title: { slug: 'hero', anchor: 'top' },
          sections: [
            [
              { slug: 'why', anchor: 'why' },
              { slug: 'watch', anchor: 'why--watch' },
            ],
          ],
        },
      ];
      const expected = {
        cash: {
          folder: 'cash',
          title: { slug: 'hero', anchor: 'top', textSource: 'src/episodes/cash/slides/hero/i18n', pool: false },
          sections: [
            [
              { slug: 'why', anchor: 'why', textSource: 'src/episodes/cash/slides/why/i18n', pool: false },
              { slug: 'watch', anchor: 'why--watch', textSource: 'src/episodes/cash/slides/watch/i18n', pool: false },
            ],
          ],
        },
      };
      // ACT
      const outlines = outlinesOf(episodes, textSourceOf);
      // ASSERT
      expect(outlines).toEqual(expected);
    });

    it('writes to the checked-in path the stale-file check compares', () => {
      // ARRANGE
      const expected = 'src/episodes/lib/episode-outlines.generated.json';
      // ACT
      const { path } = episodeOutlinesFile([], textSourceOf);
      // ASSERT
      expect(path).toBe(expected);
    });
  });
});

describe('failure cases', () => {
  describe('episodeOutlinesFile', () => {
    it('lets the text source lookup refuse a Slide that has no i18n folder', () => {
      // ARRANGE
      const episodes = [{ id: 'cash', folder: 'cash', sections: [[{ slug: 'ghost', anchor: 'ghost' }]] }];
      const missing = () => {
        throw new Error('ghost has no i18n folder');
      };
      // ACT
      const write = () => episodeOutlinesFile(episodes, missing);
      // ASSERT
      expect(write).toThrow(/ghost has no i18n folder/);
    });
  });
});

describe('edge cases', () => {
  describe('episodeOutlinesFile', () => {
    it('lists Episodes in id order, so the file is stable, and leaves out a missing Title slide', () => {
      // ARRANGE
      const section = [[{ slug: 'a', anchor: 'a' }]];
      const episodes = [
        { id: 'b', folder: 'b', sections: section },
        { id: 'a', folder: 'a', sections: section },
      ];
      const expected = ['a', 'b'];
      // ACT
      const outlines = outlinesOf(episodes, textSourceOf) as Record<string, { title?: unknown }>;
      // ASSERT
      expect(Object.keys(outlines)).toEqual(expected);
      expect(outlines['a']).not.toHaveProperty('title');
    });
  });
});
