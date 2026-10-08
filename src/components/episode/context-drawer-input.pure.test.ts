import { describe, expect, it } from 'vitest';
import { contextItemsOf } from './context-drawer-input.pure';
import type { EpisodeSection, EpisodeSlide } from './episode-page-container.pure';

function slide(slug: string, title: string, minutes: EpisodeSlide['minutes']): EpisodeSlide {
  return { slug, title, minutes, content: null };
}

const note = { slug: 'n', header: 'H', description: 'D', target: 'prose' };
const segment = { slug: 's', from: 0, to: 1, title: 'T', keywords: [], script: 'S' };

describe('success cases', () => {
  it('lists every section slide and page Slide in page order, with notes and script and full target ids', () => {
    // ARRANGE
    const sections: EpisodeSection[] = [
      {
        ...slide('foundations', 'Foundations', { en: 1, de: 1 }),
        notes: [{ ...note, target: 'title' }],
        slides: [{ ...slide('why', 'Why', { en: 3, de: 4 }), notes: [note], voiceScript: [segment] }],
      },
    ];
    const expected = [
      { id: 'foundations', title: 'Foundations', notes: [{ ...note, target: 'foundations--title' }], script: [] },
      {
        id: 'foundations--why',
        title: 'Why',
        notes: [{ ...note, target: 'foundations--why--prose' }],
        script: [segment],
      },
    ];
    // ACT
    const context = contextItemsOf(sections);
    // ASSERT
    expect(context).toEqual(expected);
  });

  it('gives a Slide without notes empty lists', () => {
    // ARRANGE
    const sections: EpisodeSection[] = [{ ...slide('a', 'A', { en: 1, de: 1 }), slides: [] }];
    const expected = [{ id: 'a', title: 'A', notes: [], script: [] }];
    // ACT
    const context = contextItemsOf(sections);
    // ASSERT
    expect(context).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a Slide whose notes share a slug', () => {
    // ARRANGE
    const sections: EpisodeSection[] = [{ ...slide('a', 'A', { en: 1, de: 1 }), notes: [note, note], slides: [] }];
    const duplicate = '"n"';
    // ACT
    const derive = () => contextItemsOf(sections);
    // ASSERT
    expect(derive).toThrow(duplicate);
  });
});

describe('edge cases', () => {
  it('derives nothing for an Episode with no Sections', () => {
    // ARRANGE
    const sections: EpisodeSection[] = [];
    // ACT
    const context = contextItemsOf(sections);
    // ASSERT
    expect(context).toEqual([]);
  });
});
