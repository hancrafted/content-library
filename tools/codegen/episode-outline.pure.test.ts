import { describe, expect, it } from 'vitest';
import { episodeOutlinesFile } from './episode-outline.pure.ts';

const layerOf = (folder: string, slug: string) => ({
  en: [`src/episodes/${folder}/slides/${slug}/i18n/en.json`],
  de: [`src/episodes/${folder}/slides/${slug}/i18n/de.json`],
});

const textSourceOf = ([folder]: readonly string[], slug: string) => ({
  text: layerOf(folder ?? '', slug),
  pool: slug === 'shared',
});

const lastFolderHolding = (folders: readonly string[], slug: string) => ({
  text: layerOf(folders.at(-1) ?? '', slug),
  pool: false,
});

const episodeLayersOf = (folders: readonly string[]) => ({
  en: [...folders].reverse().map((folder) => `src/episodes/${folder}/i18n/en.json`),
  de: [...folders].reverse().map((folder) => `src/episodes/${folder}/i18n/de.json`),
});

function outlinesOf(episodes: Parameters<typeof episodeOutlinesFile>[0], slideText = textSourceOf): unknown {
  return JSON.parse(episodeOutlinesFile(episodes, slideText, episodeLayersOf).text);
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
          text: episodeLayersOf(['cash']),
          title: { slug: 'hero', anchor: 'top', text: layerOf('cash', 'hero'), pool: false },
          sections: [
            [
              { slug: 'why', anchor: 'why', text: layerOf('cash', 'why'), pool: false },
              { slug: 'watch', anchor: 'why--watch', text: layerOf('cash', 'watch'), pool: false },
            ],
          ],
        },
      };
      // ACT
      const outlines = outlinesOf(episodes);
      // ASSERT
      expect(outlines).toEqual(expected);
    });

    it("looks an Episode instance's Slides up in its own folder first, then in its Base Episode's", () => {
      // ARRANGE
      const sections = [[{ slug: 'why', anchor: 'why' }]];
      const episodes = [
        { id: 'cash', folder: 'cash', sections },
        { id: 'axel__cash', folder: 'by-event/axel/cash', base: 'cash', sections },
      ];
      const expected = [{ slug: 'why', anchor: 'why', text: layerOf('cash', 'why'), pool: false }];
      // ACT
      const outlines = outlinesOf(episodes, lastFolderHolding) as Record<string, { sections: unknown[] }>;
      // ASSERT
      expect(outlines['axel__cash'].sections[0]).toEqual(expected);
    });

    it("gives an Episode instance its Base Episode's Episode text layer first, then its own", () => {
      // ARRANGE
      const sections = [[{ slug: 'why', anchor: 'why' }]];
      const episodes = [
        { id: 'cash', folder: 'cash', sections },
        { id: 'axel__cash', folder: 'by-event/axel/cash', base: 'cash', sections },
      ];
      const expected = episodeLayersOf(['by-event/axel/cash', 'cash']);
      // ACT
      const outlines = outlinesOf(episodes) as Record<string, { text: unknown }>;
      // ASSERT
      expect(outlines['axel__cash'].text).toEqual(expected);
    });

    it('writes to the checked-in path the stale-file check compares', () => {
      // ARRANGE
      const expected = 'src/episodes/lib/episode-outlines.generated.json';
      // ACT
      const { path } = episodeOutlinesFile([], textSourceOf, episodeLayersOf);
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
      const write = () => episodeOutlinesFile(episodes, missing, episodeLayersOf);
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
      const outlines = outlinesOf(episodes) as Record<string, { title?: unknown }>;
      // ASSERT
      expect(Object.keys(outlines)).toEqual(expected);
      expect(outlines['a']).not.toHaveProperty('title');
    });
  });
});
