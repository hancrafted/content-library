import { describe, expect, it } from 'vitest';
import { episodeOutlinesFile, type OutlineInput } from './episode-outline.pure.ts';

const layerOf = (home: string) => ({
  en: [`src/episodes/${home}/i18n/en.json`],
  de: [`src/episodes/${home}/i18n/de.json`],
});

const CASH: OutlineInput = {
  id: 'cash',
  folder: 'cash',
  text: layerOf('cash'),
  title: { slug: 'hero', anchor: 'top', text: layerOf('cash/slides/hero') },
  sections: [
    [
      { slug: 'why', anchor: 'why', text: layerOf('cash/slides/why') },
      { slug: 'shared', anchor: 'why--shared', text: layerOf('slide-pool/shared') },
    ],
  ],
};

const outlinesOf = (episodes: readonly OutlineInput[]) =>
  JSON.parse(episodeOutlinesFile(episodes).text) as Record<string, Record<string, unknown>>;

describe('success cases', () => {
  describe('episodeOutlinesFile', () => {
    it('writes each Episode by id with its folder, Title, Sections, anchors and every text layer, as the record traced them', () => {
      // ARRANGE
      const expected = {
        cash: {
          folder: 'cash',
          text: layerOf('cash'),
          title: { slug: 'hero', anchor: 'top', text: layerOf('cash/slides/hero'), pool: false },
          sections: [
            [
              { slug: 'why', anchor: 'why', text: layerOf('cash/slides/why'), pool: false },
              { slug: 'shared', anchor: 'why--shared', text: layerOf('slide-pool/shared'), pool: true },
            ],
          ],
        },
      };
      // ACT
      const outlines = outlinesOf([CASH]);
      // ASSERT
      expect(outlines).toEqual(expected);
    });

    it('keeps the Base Episode an instance names', () => {
      // ARRANGE
      const instance = { ...CASH, id: 'axel__cash', folder: 'by-event/axel/cash', base: 'cash' };
      const expected = 'cash';
      // ACT
      const outlines = outlinesOf([CASH, instance]);
      // ASSERT
      expect(outlines['axel__cash']['base']).toBe(expected);
    });

    it('writes to the checked-in path the stale-file check compares', () => {
      // ARRANGE
      const expected = 'src/episodes/lib/episode-outlines.generated.json';
      // ACT
      const { path } = episodeOutlinesFile([]);
      // ASSERT
      expect(path).toBe(expected);
    });
  });
});

describe('failure cases', () => {
  describe('episodeOutlinesFile', () => {
    it('refuses a Slide whose text the record traced to no file', () => {
      // ARRANGE
      const ghost = { ...CASH, sections: [[{ slug: 'ghost', anchor: 'ghost', text: { en: [], de: [] } }]] };
      const expected = 'Slide "ghost" of cash has no text file';
      // ACT
      const write = () => episodeOutlinesFile([ghost]);
      // ASSERT
      expect(write).toThrow(expected);
    });
  });
});

describe('edge cases', () => {
  describe('episodeOutlinesFile', () => {
    it('lists Episodes in id order, so the file is stable, and leaves out a missing Title slide', () => {
      // ARRANGE
      const { title: _title, ...untitled } = CASH;
      const expected = ['a', 'b'];
      // ACT
      const outlines = outlinesOf([
        { ...untitled, id: 'b' },
        { ...untitled, id: 'a' },
      ]);
      // ASSERT
      expect(Object.keys(outlines)).toEqual(expected);
      expect(outlines['a']).not.toHaveProperty('title');
    });
  });
});
