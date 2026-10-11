import { episode, slide, type Section } from '@/components/slide-master/slide';
import type { RuntimeTranslator } from '@/components/slide-master/slide-base';
import type { SpeakerNoteItem, VoiceScriptSegment } from '@/lib/context-drawer.pure';
import { describe, expect, it } from 'vitest';
import { checkContext, contextItemsOf } from './context-drawer-input.pure';
import { recordContent } from './record-content';

const EPISODE = {
  en: { title: 'Page template', caption: 'c', description: 'd' },
  de: { title: 'Seitenvorlage', caption: 'c', description: 'd' },
};
const EXPLAINER = 'How the drawer works';
const titleItem = { id: 'top', notes: [], script: [], explainer: EXPLAINER };

/* The drawer's items come from the Slides `recordContent` returns; these Slides carry one note and one segment. */
const WHY = {
  title: 'Why',
  notes: { n: { header: 'H', description: 'D' } },
  voiceScript: { segments: { s: { title: 'T', keywords: 'k', script: 'S' } } },
};
const foundations = slide({
  slug: 'foundations',
  messages: { en: { ...WHY, title: 'Foundations' }, de: { ...WHY, title: 'Grundlagen' } },
  notes: [{ slug: 'n', target: 'title' }],
  content: () => null,
});
const why = slide({
  slug: 'why',
  messages: { en: WHY, de: WHY },
  notes: [{ slug: 'n', target: 'prose' }],
  segments: [{ slug: 's' }],
  content: () => null,
});
const visual = slide({ slug: 'visual', messages: { en: {}, de: {} }, content: () => null });

async function translatorOf(): Promise<RuntimeTranslator> {
  const read = () => 'opens speaker note';
  return Object.assign(read, { rich: read, markup: read, raw: read, has: () => true });
}

/** The drawer's items for an Episode of these Sections, as the adapter builds them. */
async function itemsOf(sections: readonly Section[]) {
  const record = episode({ slug: 'page-template', messages: EPISODE, sections });
  return contextItemsOf((await recordContent(record, 'en', translatorOf)).slides, EXPLAINER);
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

function segmentOf(slug: string): VoiceScriptSegment {
  return { slug, from: 0, to: 1, title: 't', keywords: [], script: 's' };
}

describe('success cases', () => {
  it("gives each Slide an item under its id, with notes, script and each note's short target", async () => {
    // ARRANGE
    const note = { slug: 'n', header: 'H', description: 'D' };
    const expected = [
      titleItem,
      { id: 'foundations', title: 'Foundations', notes: [{ ...note, target: 'title' }], script: [] },
      {
        id: 'foundations--why',
        title: 'Why',
        notes: [{ ...note, target: 'prose' }],
        script: [{ slug: 's', title: 'T', keywords: ['k'], script: 'S', from: 0, to: 1 / 140 }],
      },
    ];
    // ACT
    const items = await itemsOf([[foundations, why]]);
    // ASSERT
    expect(items).toEqual(expected);
  });

  it('keeps an untitled Slide as an item without a title, so the drawer still follows it', async () => {
    // ARRANGE
    const expected = { id: 'foundations--visual', title: undefined, notes: [], script: [] };
    // ACT
    const items = await itemsOf([[foundations, visual]]);
    // ASSERT
    expect(items.at(-1)).toEqual(expected);
  });

  it('accepts a Slide with distinct notes and segments', () => {
    // ARRANGE
    const notes = [noteOf('one'), noteOf('two', 'caption')];
    const segments = [segmentOf('a'), segmentOf('b')];
    // ACT
    const check = () => checkContext('foundations--why', notes, segments);
    // ASSERT
    expect(check).not.toThrow();
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
});

describe('failure cases', () => {
  it('rejects a Slide whose notes share a slug, even past the types', async () => {
    // ARRANGE
    const twice = slide({
      slug: 'foundations',
      messages: { en: WHY, de: WHY },
      notes: [
        { slug: 'n', target: 'prose' },
        { slug: 'n', target: 'title' },
      ],
      content: () => null,
    });
    const duplicate = '"n"';
    // ACT
    const derive = itemsOf([[twice]]);
    // ASSERT
    await expect(derive).rejects.toThrow(duplicate);
  });

  it('rejects two segments sharing a slug', () => {
    // ARRANGE
    const dupSegmentSlug = '"y"';
    // ACT
    const dupSegment = () => checkContext('s', [], [segmentOf('y'), segmentOf('y')]);
    // ASSERT
    expect(dupSegment).toThrow(dupSegmentSlug);
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

  it('rejects a citation marker that names no source', () => {
    // ARRANGE
    const marker = '[2]';
    const notes = [noteOf('a', 'prose', { description: `Only one source ${marker}.`, sources: [source('x')] })];
    // ACT
    const run = () => checkContext('s', notes, []);
    // ASSERT
    expect(run).toThrow(marker);
  });

  it('rejects a citation marker on a note with no sources', () => {
    // ARRANGE
    const marker = '[1]';
    // ACT
    const run = () => checkContext('s', [noteOf('a', 'prose', { description: `Cited ${marker}.` })], []);
    // ASSERT
    expect(run).toThrow(marker);
  });

  it('rejects two sources of one note sharing a slug', () => {
    // ARRANGE
    const dup = '"x"';
    // ACT
    const run = () => checkContext('s', [noteOf('a', 'prose', { sources: [source('x'), source('x')] })], []);
    // ASSERT
    expect(run).toThrow(dup);
  });
});

describe('edge cases', () => {
  it('still gives the Title slide its item, the only one with an explainer, for an Episode with no Sections', async () => {
    // ARRANGE
    const expected = [titleItem];
    // ACT
    const items = await itemsOf([]);
    // ASSERT
    expect(items).toEqual(expected);
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
