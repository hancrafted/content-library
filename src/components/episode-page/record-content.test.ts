import { slidesFor, type EpisodeRecord } from '@/components/slide-master/episode-record';
import { selfContainedEpisode, slide, type SelfContainedEpisodeRecord } from '@/components/slide-master/slide';
import type { RuntimeKit, RuntimeTranslator } from '@/components/slide-master/slide-base';
import { TRANSLATIONS } from '@/i18n/translations';
import type { Locale } from '@/lib/locale.pure';
import { createElement, isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { recordContent, type TranslatorOf } from './record-content';

/*
 * Stand-in for next-intl's site-wide translator: reads the real Translation
 * files and returns each string as written (no ICU formatting), so these tests
 * read structure and keys, never wording. A missing key throws, as in the
 * static build. A self-contained Slide never reaches it: the kit builds its
 * translator from the Slide's own messages.
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

/** What a Slide's Scene saw of its kit: the strings it read and the heading level it got. */
function probe(kit: RuntimeKit, keys: readonly string[]): ReactElement {
  const title = kit.Title({ children: kit.t('title') });
  return createElement('div', { 'data-read': keys.map((key) => kit.t(key)).join('|') }, title);
}

/** The heading element a Slide's content rendered, as `Title` built it. */
function headingOf(content: unknown): ReactElement<{ as: string; 'data-target': string }> {
  if (!isValidElement<{ children: ReactElement }>(content)) throw new Error('Slide content is not an element.');
  return content.props.children as ReactElement<{ as: string; 'data-target': string }>;
}

/** What a probe Scene read, joined: the `data-read` of the element it rendered. */
function readOf(content: unknown): string {
  if (!isValidElement<{ 'data-read': string }>(content)) throw new Error('Slide content is not an element.');
  return content.props['data-read'];
}

// "Copy it once, so the next Episode starts from a working example." is 12 words; the German line is 10.
const WHY = {
  en: {
    title: 'Why every Episode starts from a copy',
    prose: 'Copy this folder.',
    notes: { 'reference-episode': { header: 'Why a reference Episode', description: 'Point at the prose.' } },
    voiceScript: {
      segments: {
        'one-breath': {
          title: 'The template in one breath',
          keywords: 'template, shape',
          script: 'Copy it once, so the next Episode starts from a working example.',
        },
      },
    },
  },
  de: {
    title: 'Warum jede Episode als Kopie beginnt',
    prose: 'Diesen Ordner kopieren.',
    notes: { 'reference-episode': { header: 'Warum eine Referenz-Episode', description: 'Auf den Text zeigen.' } },
    voiceScript: {
      segments: {
        'one-breath': {
          title: 'Die Vorlage in einem Atemzug',
          keywords: 'Vorlage, Form',
          script: 'Einmal kopieren, damit die nächste Episode mit einem Beispiel beginnt.',
        },
      },
    },
  },
};
const SECTION = {
  en: { title: 'Foundations', caption: 'A Section opens with its own slide.' },
  de: { title: 'Grundlagen', caption: 'Ein Abschnitt beginnt mit einer eigenen Folie.' },
};
const NEXT = { en: { title: 'Next steps' }, de: { title: 'Nächste Schritte' } };
const EPISODE = {
  en: { title: 'Page template', caption: 'The smallest Episode.', description: 'Copy it.' },
  de: { title: 'Seitenvorlage', caption: 'Die kleinste Episode.', description: 'Kopieren.' },
};

const foundations = slide({
  slug: 'foundations',
  messages: SECTION,
  content: (kit) => probe(kit as unknown as RuntimeKit, ['caption']),
});
const whyATemplate = slide({
  slug: 'why-a-template',
  messages: WHY,
  notes: [{ slug: 'reference-episode', target: 'prose' }],
  segments: [{ slug: 'one-breath' }],
  content: (kit) => probe(kit as unknown as RuntimeKit, ['prose']),
});
const nextSteps = slide({
  slug: 'next-steps',
  messages: NEXT,
  content: (kit) => probe(kit as unknown as RuntimeKit, []),
});

const RECORD = selfContainedEpisode({
  slug: 'page-template',
  messages: EPISODE,
  sections: [[foundations, whyATemplate], [nextSteps]],
});

describe('success cases', () => {
  it("reads the Episode's own title and caption, and each Section's title from its first Slide's own file", async () => {
    // ARRANGE
    const expected = {
      title: 'Seitenvorlage',
      caption: 'Die kleinste Episode.',
      sections: [
        { slug: 'foundations', title: 'Grundlagen', slides: ['why-a-template'] },
        { slug: 'next-steps', title: 'Nächste Schritte', slides: [] },
      ],
    };
    // ACT
    const content = await recordContent(RECORD, 'de', translatorOf('de'));
    // ASSERT
    expect({
      title: content.title,
      caption: content.caption,
      sections: content.sections.map(({ slide: head, slides }) => ({
        slug: head.slug,
        title: head.title,
        slides: slides.map((page) => page.slide.slug),
      })),
    }).toEqual(expected);
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

  it("gives each Slide a translator over its own file in the page's locale and a Title at its position's level", async () => {
    // ARRANGE
    const expectedLevels = ['h2', 'h3'];
    const expectedTarget = 'title';
    const expectedRead = 'Diesen Ordner kopieren.';
    // ACT
    const { sections } = await recordContent(RECORD, 'de', translatorOf('de'));
    const [head, page] = [sections[0].slide.content, sections[0].slides[0].slide.content];
    // ASSERT
    expect([headingOf(head).props.as, headingOf(page).props.as]).toEqual(expectedLevels);
    expect(headingOf(head).props['data-target']).toBe(expectedTarget);
    expect(readOf(page)).toBe(expectedRead);
  });

  it("resolves a Slide's notes and segments from its own file, with short targets", async () => {
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

  it("times a Slide from its own Voice script's words in the page's locale", async () => {
    // ARRANGE
    const expected = { en: 12 / 140, de: 10 / 120 };
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
      messages: NEXT,
      content: ({ locale, slideHref }) => `${locale} ${slideHref('why-a-template')} ${slideHref('next-steps')}`,
    });
    const record = selfContainedEpisode({
      slug: 'page-template',
      messages: EPISODE,
      sections: [[foundations, whyATemplate], [linker]],
    });
    const expected = 'de /de/episode/page-template#foundations--why-a-template /de/episode/page-template#next-steps';
    // ACT
    const { sections } = await recordContent(record, 'de', translatorOf('de'));
    // ASSERT
    expect(sections[1].slide.content).toBe(expected);
  });

  it('still renders an Episode of `slidesFor` Slides from the site-wide Translation file', async () => {
    // ARRANGE
    const old = slidesFor('slide-layouts');
    const sectionSlide = old({ slug: 'section-slide', content: (kit) => probe(kit as unknown as RuntimeKit, []) });
    const basicPage = old({
      slug: 'basic-page',
      notes: [{ slug: 'layout-target', target: 'prose' }],
      content: (kit) => probe(kit as unknown as RuntimeKit, ['prose']),
    });
    const record: EpisodeRecord<'slide-layouts'> = { slug: 'slide-layouts', sections: [[sectionSlide, basicPage]] };
    const expected = { title: 'Slide layouts', section: 'Section slide', note: 'The prose target' };
    // ACT
    const content = await recordContent(record, 'en', translatorOf('en'));
    // ASSERT
    expect({
      title: content.title,
      section: content.sections[0].slide.title,
      note: content.sections[0].slides[0].slide.notes?.[0].header,
    }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a Slide slug used twice in one Episode, as when a copied Slide collides', async () => {
    // ARRANGE
    const record = selfContainedEpisode({
      slug: 'page-template',
      messages: EPISODE,
      sections: [[foundations], [foundations]],
    });
    const expected = 'foundations';
    // ACT
    const build = recordContent(record, 'en', translatorOf('en'));
    // ASSERT
    await expect(build).rejects.toThrow(expected);
  });

  it('rejects a link to a slug that is not a Slide of the same Episode', async () => {
    // ARRANGE
    const linker = slide({
      slug: 'next-steps',
      messages: NEXT,
      content: ({ slideHref }) => slideHref('no-such-slide'),
    });
    const record = selfContainedEpisode({
      slug: 'page-template',
      messages: EPISODE,
      sections: [[foundations], [linker]],
    });
    const expected = 'no-such-slide';
    // ACT
    const build = recordContent(record, 'en', translatorOf('en'));
    // ASSERT
    await expect(build).rejects.toThrow(expected);
  });

  it("rejects a key missing from the Slide's own file in the page's locale, even past the types", async () => {
    // ARRANGE
    const gap = { en: { title: 'Next steps' }, de: {} as { title: string } };
    const record = selfContainedEpisode({
      slug: 'page-template',
      messages: EPISODE,
      sections: [[slide({ slug: 'next-steps', messages: gap, content: ({ t }) => t('title') })]],
    });
    const expected = 'title';
    // ACT
    const build = recordContent(record, 'de', translatorOf('de'));
    // ASSERT
    await expect(build).rejects.toThrow(expected);
  });

  it('rejects a context reference to a note the Slide does not declare, even past the types', async () => {
    // ARRANGE
    const rogue = slide({
      slug: 'what-comes-next',
      messages: NEXT,
      content: (kit) => (kit as unknown as RuntimeKit).ref('reference-episode')('phrase'),
    });
    const record = selfContainedEpisode({ slug: 'page-template', messages: EPISODE, sections: [[foundations, rogue]] });
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
    const bare = slide({ slug: 'what-comes-next', messages: NEXT, content: () => null });
    const record: SelfContainedEpisodeRecord = {
      slug: 'page-template',
      messages: EPISODE,
      sections: [[nextSteps, bare]],
    };
    const expected = [0, 0];
    // ACT
    const { sections } = await recordContent(record, 'de', translatorOf('de'));
    const [section] = sections;
    // ASSERT
    expect([section.slide.minutes, section.slides[0].slide.minutes]).toEqual(expected);
  });

  it("renders the default rich tags from a Slide's own string, as for every Slide", async () => {
    // ARRANGE
    const bold = {
      en: { title: 'Next steps', prose: 'A <b>bold</b> start' },
      de: { title: 'Nächste Schritte', prose: 'Ein <b>kräftiger</b> Anfang' },
    };
    const rich = slide({ slug: 'next-steps', messages: bold, content: ({ t }) => t.rich('prose') });
    const record = selfContainedEpisode({ slug: 'page-template', messages: EPISODE, sections: [[rich]] });
    const expected = 'b';
    // ACT
    const { sections } = await recordContent(record, 'en', translatorOf('en'));
    const parts = sections[0].slide.content as unknown[];
    // ASSERT
    expect(parts.map((part) => (isValidElement(part) ? part.type : typeof part))).toContain(expected);
  });
});
