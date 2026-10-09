import {
  slidesFor,
  type EpisodeRecord,
  type RuntimeKit,
  type RuntimeTranslator,
} from '@/components/slide-master/episode-record';
import { TRANSLATIONS } from '@/i18n/translations';
import type { Locale } from '@/lib/locale.pure';
import { createElement, isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { recordContent, type TranslatorOf } from './record-content';

/*
 * Stand-in for next-intl: reads the real Translation files and returns each
 * string as written (no ICU formatting), so these tests read structure and
 * keys, never wording. A missing key throws, as in the static build.
 */
function translatorOf(locale: Locale): TranslatorOf {
  return async (namespace) => {
    const read = (key: string): string => {
      const path = [...namespace.split('.'), ...key.split('.')];
      const leaf = path.reduce<unknown>(
        (node, part) => (node as Record<string, unknown> | undefined)?.[part],
        TRANSLATIONS[locale],
      );
      if (typeof leaf !== 'string') throw new Error(`Missing Translation key "${path.join('.')}" in ${locale}.`);
      return leaf;
    };
    const has = (key: string): boolean => {
      try {
        read(key);
        return true;
      } catch {
        return false;
      }
    };
    const t: RuntimeTranslator = Object.assign((key: string) => read(key), {
      rich: read,
      markup: read,
      raw: read,
      has,
    });
    return t;
  };
}
const slide = slidesFor('page-template');

/** What a Slide's Canvas saw of its kit: the strings it read and the heading level it got. */
function probe(kit: RuntimeKit, keys: readonly string[]): ReactElement {
  const title = kit.Title({ children: kit.t('title') });
  return createElement('div', { 'data-read': keys.map((key) => kit.t(key)).join('|') }, title);
}

const foundations = slide({
  slug: 'foundations',
  content: (kit) => probe(kit as unknown as RuntimeKit, ['caption']),
});
const whyATemplate = slide({
  slug: 'why-a-template',
  notes: [{ slug: 'reference-episode', target: 'prose' }],
  segments: [{ slug: 'one-breath' }],
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
    const content = await recordContent(RECORD, 'en', translatorOf('en'));
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
    const { sections } = await recordContent(RECORD, 'en', translatorOf('en'));
    // ASSERT
    expect(sections.map(({ id, slides }) => ({ id, slides: slides.map((page) => page.id) }))).toEqual(expected);
  });

  it('gives each Slide a translator namespaced to its own keys and a Title at the level its position gives it', async () => {
    // ARRANGE
    const expectedLevels = ['h2', 'h3'];
    const expectedTarget = 'title';
    // ACT
    const { sections } = await recordContent(RECORD, 'en', translatorOf('en'));
    const [head, page] = [sections[0].slide.content, sections[0].slides[0].slide.content].map(headingOf);
    // ASSERT
    expect([head.props.as, page.props.as]).toEqual(expectedLevels);
    expect(head.props['data-target']).toBe(expectedTarget);
  });

  it("resolves a Slide's notes and segments from its own Translation subtree, with short targets", async () => {
    // ARRANGE
    const expectedNote = { slug: 'reference-episode', header: 'Why a reference Episode', target: 'prose' };
    const expectedSegment = { slug: 'one-breath', from: 0, title: 'The template in one breath' };
    // ACT
    const { sections } = await recordContent(RECORD, 'en', translatorOf('en'));
    const why = sections[0].slides[0].slide;
    // ASSERT
    expect(why.notes).toEqual([expect.objectContaining(expectedNote)]);
    expect(why.voiceScript).toEqual([expect.objectContaining(expectedSegment)]);
  });

  it("times a Slide from its Voice script's words in the page's locale", async () => {
    // ARRANGE
    // "A reference Episode shows the shape once, so the next Episode copies a working example instead of inventing
    // one." is 19 words; the German line "Eine Referenz-Episode zeigt die Form einmal, damit die nächste Episode ein
    // funktionierendes Beispiel kopiert, statt eine neue zu erfinden." is 19 too, read slower.
    const expected = { en: 19 / 140, de: 19 / 120 };
    // ACT
    const minutes = await Promise.all(
      (['en', 'de'] as const).map(async (locale) => {
        const { sections } = await recordContent(RECORD, locale, translatorOf(locale));
        return sections[0].slides[0].slide.minutes;
      }),
    );
    // ASSERT
    expect({ en: minutes[0], de: minutes[1] }).toEqual(expected);
  });

  it("gives every kit the page's locale and links each Slide slug to the anchor the walk placed it at", async () => {
    // ARRANGE
    const linker = slide({
      slug: 'next-steps',
      content: ({ locale, slideHref }) => `${locale} ${slideHref('why-a-template')} ${slideHref('next-steps')}`,
    });
    const record: EpisodeRecord<'page-template'> = {
      slug: 'page-template',
      sections: [[foundations, whyATemplate], [linker]],
    };
    const expected = 'de /de/episode/page-template#foundations--why-a-template /de/episode/page-template#next-steps';
    // ACT
    const { sections } = await recordContent(record, 'de', translatorOf('de'));
    // ASSERT
    expect(sections[1].slide.content).toBe(expected);
  });
});

describe('failure cases', () => {
  it('rejects a Slide slug used twice in one Episode', async () => {
    // ARRANGE
    const record: EpisodeRecord<'page-template'> = { slug: 'page-template', sections: [[foundations], [foundations]] };
    const expected = 'foundations';
    // ACT
    const build = recordContent(record, 'en', translatorOf('en'));
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
    const build = recordContent(record, 'en', translatorOf('en'));
    // ASSERT
    await expect(build).rejects.toThrow(expected);
  });
});

describe('edge cases', () => {
  it('gives a Slide without a Voice script 0 minutes, so the table of contents shows no time for it', async () => {
    // ARRANGE
    const bare = slide({ slug: 'what-comes-next', content: () => null });
    const record: EpisodeRecord<'page-template'> = { slug: 'page-template', sections: [[nextSteps, bare]] };
    const expected = [0, 0];
    // ACT
    const { sections } = await recordContent(record, 'de', translatorOf('de'));
    const [section] = sections;
    // ASSERT
    expect([section.slide.minutes, section.slides[0].slide.minutes]).toEqual(expected);
  });
});
