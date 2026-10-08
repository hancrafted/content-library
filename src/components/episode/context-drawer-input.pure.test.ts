import { describe, expect, it } from 'vitest';
import { contextItemsOf as itemsOf } from './context-drawer-input.pure';
import type { EpisodeSection, EpisodeSlide, PlacedEpisodeSection } from './episode-page-container.pure';

/** A page Slide placed under `id`, the anchor the walk would give it. */
function page(id: string, slide: Omit<EpisodeSlide, 'content'>): PlacedEpisodeSection['slides'][number] {
  return { id, slide: { ...slide, content: null } };
}

/** A section slide placed under `id`, holding its placed page Slides. */
function section(
  id: string,
  head: Omit<EpisodeSlide, 'slug' | 'content' | 'title'> & { title: string },
  slides: PlacedEpisodeSection['slides'] = [],
): PlacedEpisodeSection {
  const record: EpisodeSection = {
    slug: id,
    minutes: { en: 1, de: 1 },
    ...head,
    content: null,
    slides: slides.map(({ slide }) => slide),
  };
  return { id, slide: record, slides };
}

const EXPLAINER = 'How the drawer works';
const titleItem = { id: 'top', title: undefined, notes: [], script: [], explainer: EXPLAINER };
const contextItemsOf = (placed: readonly PlacedEpisodeSection[]) => itemsOf(placed, EXPLAINER).slice(1);
const note = { slug: 'n', header: 'H', description: 'D', target: 'prose' };
const segment = { slug: 's', from: 0, to: 1, title: 'T', keywords: [], script: 'S' };

describe('success cases', () => {
  it('gives each placed Slide an item under its id, with notes, script and full target ids', () => {
    // ARRANGE
    const placed = [
      section('foundations', { title: 'Foundations', notes: [{ ...note, target: 'title' }] }, [
        page('foundations--why', { slug: 'why', title: 'Why', notes: [note], voiceScript: [segment] }),
      ]),
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
    const context = contextItemsOf(placed);
    // ASSERT
    expect(context).toEqual(expected);
  });

  it('keeps an untitled Slide as an item without a title, so the drawer still follows it', () => {
    // ARRANGE
    const placed = [section('a', { title: 'A' }, [page('a--visual', { slug: 'visual' })])];
    const expected = [
      { id: 'a', title: 'A', notes: [], script: [] },
      { id: 'a--visual', title: undefined, notes: [], script: [] },
    ];
    // ACT
    const context = contextItemsOf(placed);
    // ASSERT
    expect(context).toEqual(expected);
  });
});

describe('the Title slide', () => {
  it('comes first, with the explainer and no notes or script', () => {
    // ARRANGE
    const placed = [section('a', { title: 'A' })];
    const expected = [titleItem, 'a'];
    // ACT
    const [first, second] = itemsOf(placed, EXPLAINER);
    // ASSERT
    expect([first, second.id]).toEqual(expected);
  });

  it('is the only item with an explainer', () => {
    // ARRANGE
    const placed = [section('a', { title: 'A' }, [page('a--b', { slug: 'b', title: 'B' })])];
    const expected = ['top'];
    // ACT
    const withExplainer = itemsOf(placed, EXPLAINER)
      .filter((item) => item.explainer !== undefined)
      .map((item) => item.id);
    // ASSERT
    expect(withExplainer).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a Slide whose notes share a slug', () => {
    // ARRANGE
    const placed = [section('a', { title: 'A', notes: [note, note] })];
    const duplicate = '"n"';
    // ACT
    const derive = () => contextItemsOf(placed);
    // ASSERT
    expect(derive).toThrow(duplicate);
  });
});

describe('edge cases', () => {
  it('still gives the Title slide its item for an Episode with no Sections', () => {
    // ARRANGE
    const placed: PlacedEpisodeSection[] = [];
    // ACT
    const items = itemsOf(placed, EXPLAINER);
    // ASSERT
    expect(items).toEqual([titleItem]);
  });
});
