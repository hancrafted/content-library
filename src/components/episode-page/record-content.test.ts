import { slidesFor, type EpisodeRecord, type RuntimeKit } from '@/components/slide-master/episode-record';
import { createElement, isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { recordContent } from './record-content';

/*
 * `recordContent` reads the real Translation files through the next-intl
 * stand-in (vitest.config.ts), which returns each string as written, so these
 * tests read structure and keys, never wording.
 */
const slide = slidesFor('page-template');

/** What a Slide's Canvas saw of its kit: the strings it read and the heading level it got. */
function probe(kit: RuntimeKit, keys: readonly string[]): ReactElement {
  const title = kit.Title({ children: kit.t('title') });
  return createElement('div', { 'data-read': keys.map((key) => kit.t(key)).join('|') }, title);
}

const foundations = slide({
  slug: 'foundations',
  minutes: { en: 1, de: 2 },
  content: (kit) => probe(kit as unknown as RuntimeKit, ['caption']),
});
const whyATemplate = slide({
  slug: 'why-a-template',
  minutes: { en: 3, de: 4 },
  notes: [{ slug: 'reference-episode', target: 'prose' }],
  segments: [{ slug: 'one-breath', from: 0, to: 1 }],
  content: (kit) => probe(kit as unknown as RuntimeKit, ['prose']),
});
const nextSteps = slide({ slug: 'next-steps', content: (kit) => probe(kit as unknown as RuntimeKit, []) });

const RECORD: EpisodeRecord<'page-template'> = {
  slug: 'page-template',
  sections: [[foundations, whyATemplate], [nextSteps]],
};

/** The heading element a Slide's content rendered, as `Title` built it. */
function headingOf(content: unknown): ReactElement<{ as: string; 'data-target': string }> {
  if (!isValidElement<{ children: ReactElement }>(content)) throw new Error('Slide content is not an element.');
  return content.props.children as ReactElement<{ as: string; 'data-target': string }>;
}

describe('success cases', () => {
  it("reads the Episode's title and caption, and each Section's title from its first Slide", async () => {
    // ARRANGE
    const expected = {
      title: 'Page template',
      sections: [
        { slug: 'foundations', title: 'Foundations', slides: ['why-a-template'] },
        { slug: 'next-steps', title: 'Next steps', slides: [] },
      ],
    };
    // ACT
    const content = await recordContent(RECORD, 'en');
    // ASSERT
    expect({
      title: content.title,
      sections: content.sections.map(({ slide, slides }) => ({
        slug: slide.slug,
        title: slide.title,
        slides: slides.map((page) => page.slide.slug),
      })),
    }).toEqual(expected);
    expect(content.caption).toBeTruthy();
  });

  it('places each Slide under the id its position gives it', async () => {
    // ARRANGE
    const expected = [
      { id: 'foundations', slides: ['foundations--why-a-template'] },
      { id: 'next-steps', slides: [] },
    ];
    // ACT
    const { sections } = await recordContent(RECORD, 'en');
    // ASSERT
    expect(sections.map(({ id, slides }) => ({ id, slides: slides.map((page) => page.id) }))).toEqual(expected);
  });

  it('gives each Slide a translator namespaced to its own keys and a Title at the level its position gives it', async () => {
    // ARRANGE
    const expectedLevels = ['h2', 'h3'];
    const expectedTarget = 'title';
    // ACT
    const { sections } = await recordContent(RECORD, 'en');
    const [head, page] = [sections[0].slide.content, sections[0].slides[0].slide.content].map(headingOf);
    // ASSERT
    expect([head.props.as, page.props.as]).toEqual(expectedLevels);
    expect(head.props['data-target']).toBe(expectedTarget);
  });

  it("resolves a Slide's notes and segments from its own Translation subtree, with short targets", async () => {
    // ARRANGE
    const expectedNote = { slug: 'reference-episode', header: 'Why a reference Episode', target: 'prose' };
    const expectedSegment = { slug: 'one-breath', from: 0, to: 1, title: 'The template in one breath' };
    // ACT
    const { sections } = await recordContent(RECORD, 'en');
    const why = sections[0].slides[0].slide;
    // ASSERT
    expect(why.notes).toEqual([expect.objectContaining(expectedNote)]);
    expect(why.voiceScript).toEqual([expect.objectContaining(expectedSegment)]);
  });
});

describe('failure cases', () => {
  it('rejects a Slide slug used twice in one Episode', async () => {
    // ARRANGE
    const record: EpisodeRecord<'page-template'> = { slug: 'page-template', sections: [[foundations], [foundations]] };
    const expected = 'foundations';
    // ACT
    const build = recordContent(record, 'en');
    // ASSERT
    await expect(build).rejects.toThrow(expected);
  });

  it('rejects a context reference to a note the Slide does not declare, even past the types', async () => {
    // ARRANGE
    const rogue = slide({
      slug: 'what-comes-next',
      content: (kit) => (kit as unknown as RuntimeKit).ref('reference-episode')('phrase'),
    });
    const record: EpisodeRecord<'page-template'> = { slug: 'page-template', sections: [[foundations, rogue]] };
    const expected = 'reference-episode';
    // ACT
    const build = recordContent(record, 'en');
    // ASSERT
    await expect(build).rejects.toThrow(expected);
  });
});

describe('edge cases', () => {
  it('leaves minutes out where a Slide declares none, so the table of contents counts them as 0', async () => {
    // ARRANGE
    const bare = slide({ slug: 'what-comes-next', content: () => null });
    const record: EpisodeRecord<'page-template'> = { slug: 'page-template', sections: [[nextSteps, bare]] };
    // ACT
    const { sections } = await recordContent(record, 'de');
    const [section] = sections;
    // ASSERT
    expect(section.slide.minutes).toBeUndefined();
    expect(section.slides[0].slide.minutes).toBeUndefined();
  });
});
