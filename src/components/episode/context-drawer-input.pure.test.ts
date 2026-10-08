import { describe, expect, it } from 'vitest';
import { checkContext, checkedNote, contextItemsOf as itemsOf } from './context-drawer-input.pure';
import type { EpisodeSection, EpisodeSlide, PlacedEpisodeSection } from './episode-page-container.pure';

type SpeakerNoteItem = NonNullable<EpisodeSlide['notes']>[number];
type VoiceScriptSegment = NonNullable<EpisodeSlide['voiceScript']>[number];

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

function noteOf(
  slug: string,
  target = 'prose',
  cited?: { description?: string; sources?: SpeakerNoteItem['sources'] },
): SpeakerNoteItem {
  const { description = 'd', sources } = cited ?? {};
  return { slug, header: 'h', description, target, ...(sources && { sources }) };
}

function source(slug: string, url = 'https://example.com/a') {
  return { slug, url, title: slug };
}

function segmentOf(slug: string, from = 0, to = 1): VoiceScriptSegment {
  return { slug, from, to, title: 't', keywords: [], script: 's' };
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

  it('accepts a Slide with distinct notes and segments', () => {
    // ARRANGE
    const notes = [noteOf('one'), noteOf('two', 'caption')];
    const segments = [segmentOf('a', 0, 1), segmentOf('b', 1, 2)];
    // ACT
    const check = () => checkContext('foundations--why', notes, segments);
    // ASSERT
    expect(check).not.toThrow();
  });

  it('finds the note a context reference names', () => {
    // ARRANGE
    const notes = [noteOf('a'), noteOf('b')];
    const expected = 'b';
    // ACT
    const found = checkedNote(notes, 'b');
    // ASSERT
    expect(found.slug).toBe(expected);
  });

  it('accepts markers that each name a source of their note', () => {
    // ARRANGE
    const notes = [
      noteOf('a', 'prose', {
        description: 'One [1] and two [2], again [1].',
        sources: [source('x'), source('y', 'https://example.com/b')],
      }),
    ];
    const check = () => checkContext('s', notes, []);
    // ACT
    const result = check();
    // ASSERT
    expect(result).toBeUndefined();
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

  it('rejects two notes, or two segments, sharing a slug', () => {
    // ARRANGE
    const dupNoteSlug = '"x"';
    const dupSegmentSlug = '"y"';
    const dupNote = () => checkContext('s', [noteOf('x'), noteOf('x')], []);
    const dupSegment = () => checkContext('s', [], [segmentOf('y'), segmentOf('y', 1, 2)]);
    // ACT
    const messages = [dupNote, dupSegment].map((run) => {
      try {
        run();
        return '';
      } catch (error) {
        return (error as Error).message;
      }
    });
    // ASSERT
    expect(messages[0]).toContain(dupNoteSlug);
    expect(messages[1]).toContain(dupSegmentSlug);
  });

  it('rejects a target or slug that is not kebab-case', () => {
    // ARRANGE
    const badTargetName = 'Not Kebab';
    const badSlugName = 'Bad Slug';
    const badTarget = () => checkContext('s', [noteOf('x', badTargetName)], []);
    const badSlug = () => checkContext('s', [], [segmentOf(badSlugName)]);
    // ACT
    const attempts = [badTarget, badSlug];
    // ASSERT
    expect(attempts[0]).toThrow(badTargetName);
    expect(attempts[1]).toThrow(badSlugName);
  });

  it('rejects a segment that ends before it starts', () => {
    // ARRANGE
    const segmentSlug = '"x"';
    const backwards = () => checkContext('s', [], [segmentOf('x', 2, 1)]);
    // ACT
    const attempt = backwards;
    // ASSERT
    expect(attempt).toThrow(segmentSlug);
  });

  it('rejects a citation marker that names no source', () => {
    // ARRANGE
    const marker = '[2]';
    const notes = [noteOf('a', 'prose', { description: `Only one source ${marker}.`, sources: [source('x')] })];
    const check = () => checkContext('s', notes, []);
    // ACT
    const run = () => check();
    // ASSERT
    expect(run).toThrow(marker);
  });

  it('rejects a citation marker on a note with no sources', () => {
    // ARRANGE
    const marker = '[1]';
    const check = () => checkContext('s', [noteOf('a', 'prose', { description: `Cited ${marker}.` })], []);
    // ACT
    const run = () => check();
    // ASSERT
    expect(run).toThrow(marker);
  });

  it('rejects two sources of one note sharing a slug', () => {
    // ARRANGE
    const dup = '"x"';
    const check = () => checkContext('s', [noteOf('a', 'prose', { sources: [source('x'), source('x')] })], []);
    // ACT
    const run = () => check();
    // ASSERT
    expect(run).toThrow(dup);
  });

  it('throws when a context reference names a note the Slide does not have', () => {
    // ARRANGE
    const missing = '"nope"';
    const run = () => checkedNote([noteOf('a')], 'nope');
    // ACT
    const result = run;
    // ASSERT
    expect(result).toThrow(missing);
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

  it('accepts a Slide with no notes and no script', () => {
    // ARRANGE
    const check = () => checkContext('s', [], []);
    // ACT
    const result = check();
    // ASSERT
    expect(result).toBeUndefined();
  });
});
