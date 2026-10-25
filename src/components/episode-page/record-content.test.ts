import { episode, slide } from '@/components/slide-master/slide';
import type { RuntimeKit, RuntimeTranslator } from '@/components/slide-master/slide-base';
import { TRANSLATIONS } from '@/i18n/translations';
import type { Locale } from '@/lib/locale.pure';
import { createElement, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { recordContent, type TranslatorOf } from './record-content';

/*
 * Stand-in for next-intl's site-wide translator: reads the real Translation
 * files and returns each string as written (no ICU formatting), so these tests
 * read structure and keys, never wording. A missing key throws, as in the
 * static build. A Slide never reaches it: the kit builds its
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

const SECTION = { en: { title: 'Foundations' }, de: { title: 'Grundlagen' } };
const WHY = { en: { title: 'Why a template' }, de: { title: 'Warum eine Vorlage' } };
const VISUAL = { en: { caption: 'A picture' }, de: { caption: 'Ein Bild' } };
const NEXT = { en: { title: 'Next steps' }, de: { title: 'Nächste Schritte' } };
const EPISODE = {
  en: { title: 'Page template', caption: 'The smallest Episode.', description: 'Copy it.' },
  de: { title: 'Seitenvorlage', caption: 'Die kleinste Episode.', description: 'Kopieren.' },
};

const foundations = slide({ slug: 'foundations', messages: SECTION, content: () => null });
const whyATemplate = slide({ slug: 'why-a-template', messages: WHY, content: () => null });
const visual = slide({ slug: 'visual', messages: VISUAL, content: () => null });
const nextSteps = slide({ slug: 'next-steps', messages: NEXT, content: () => null });

const RECORD = episode({
  slug: 'page-template',
  messages: EPISODE,
  sections: [[foundations, whyATemplate, visual], [nextSteps]],
});

// One pool Slide, held by reference: its author names the sibling by the slug they wrote.
const lostMiddle = slide({ slug: 'the-lost-middle', messages: WHY, content: () => null });
const linking = slide({
  slug: 'why-context-rots',
  messages: VISUAL,
  content: ({ slideHref }) => createElement('a', { href: slideHref('the-lost-middle') }, 'the lost middle'),
});
const optional = slide({
  slug: 'see-also',
  messages: VISUAL,
  content: ({ slideHref }) => {
    const href = slideHref('the-lost-middle', { fallback: 'text' });
    return href === undefined ? 'the lost middle' : createElement('a', { href }, 'the lost middle');
  },
});
const linkOf = async (record: ReturnType<typeof episode>, slug: string) => {
  const { slides } = await recordContent(record, 'en', translatorOf('en'));
  const placed = slides.find((localized) => localized.id.endsWith(slug));
  return renderToStaticMarkup(placed?.content);
};

describe('success cases', () => {
  it("reads the Episode's own title and caption in the page's locale", async () => {
    // ARRANGE
    const expected = { title: 'Seitenvorlage', caption: 'Die kleinste Episode.' };
    // ACT
    const { title, caption } = await recordContent(RECORD, 'de', translatorOf('de'));
    // ASSERT
    expect({ title, caption }).toEqual(expected);
  });

  it('lists every Slide once, in page order, under the id, Section and level its position gives it', async () => {
    // ARRANGE
    const expected = [
      { id: 'foundations', section: 'foundations', level: 'h2', title: 'Grundlagen' },
      { id: 'foundations--why-a-template', section: 'foundations', level: 'h3', title: 'Warum eine Vorlage' },
      { id: 'foundations--visual', section: 'foundations', level: 'h3', title: undefined },
      { id: 'next-steps', section: 'next-steps', level: 'h2', title: 'Nächste Schritte' },
    ];
    // ACT
    const { slides } = await recordContent(RECORD, 'de', translatorOf('de'));
    // ASSERT
    expect(slides.map(({ id, section, level, title }) => ({ id, section, level, title }))).toEqual(expected);
  });
  it('gives each titled Slide a Slide header by default: its on-screen title and its caption', async () => {
    // ARRANGE
    const captioned = slide({
      slug: 'why-a-template',
      messages: {
        en: { title: 'Why a template', heading: 'Why start from a template?', caption: 'One spine.' },
        de: { title: 'Warum eine Vorlage', heading: 'Warum mit einer Vorlage?', caption: 'Ein Rückgrat.' },
      },
      content: () => null,
    });
    const record = episode({ slug: 'page-template', messages: EPISODE, sections: [[foundations, captioned, visual]] });
    const expected = [
      { title: 'Foundations' },
      { title: 'Why start from a template?', caption: 'One spine.' },
      undefined,
    ];
    // ACT
    const { slides, header } = await recordContent(record, 'en', translatorOf('en'));
    // ASSERT
    expect(header).toBe('shared');
    expect(slides.map((placed) => placed.header)).toEqual(expected);
  });

  it("renders the record's title Slide as the Title slide's Scene", async () => {
    // ARRANGE
    const hero = slide({
      slug: 'hero',
      messages: { en: { motif: 'Rocket' }, de: { motif: 'Rakete' } },
      content: ({ t }) => createElement('p', null, t('motif')),
    });
    const record = episode({ slug: 'page-template', messages: EPISODE, title: hero, sections: [[foundations]] });
    const expected = '<p>Rakete</p>';
    // ACT
    const { hero: scene } = await recordContent(record, 'de', translatorOf('de'));
    // ASSERT
    expect(renderToStaticMarkup(scene)).toBe(expected);
  });

  it("takes the Title slide's caption from the record's title Slide when it gives one", async () => {
    // ARRANGE
    const hero = slide({
      slug: 'hero',
      messages: { en: { caption: 'An empty <b>pipeline</b>.' }, de: { caption: 'Eine leere <b>Pipeline</b>.' } },
      content: () => null,
    });
    const record = episode({ slug: 'page-template', messages: EPISODE, title: hero, sections: [[foundations]] });
    const expected = 'Eine leere Pipeline.';
    // ACT
    const { caption } = await recordContent(record, 'de', translatorOf('de'));
    // ASSERT
    expect(caption).toBe(expected);
  });

  it("marks where a Slide header's caption sets off its <b> runs", async () => {
    // ARRANGE
    const bold = slide({
      slug: 'foundations',
      messages: {
        en: { title: 'Foundations', caption: 'Revenue <b>lands</b> here.' },
        de: { title: 'Grundlagen', caption: 'Der Umsatz <b>landet</b> hier.' },
      },
      content: () => null,
    });
    const record = episode({ slug: 'page-template', messages: EPISODE, sections: [[bold]] });
    const expected = { title: 'Foundations', caption: 'Revenue lands here.', captionEmphasis: [{ start: 8, end: 13 }] };
    // ACT
    const { slides } = await recordContent(record, 'en', translatorOf('en'));
    // ASSERT
    expect(slides[0].header).toEqual(expected);
  });
  it('A link between sibling Slides still works in an Episode whose siblings differ, and a missing sibling fails the build', async () => {
    // ARRANGE
    const nested = episode({
      slug: 'page-template',
      messages: EPISODE,
      sections: [[foundations, linking, lostMiddle]],
    });
    const leading = episode({
      slug: 'slide-master',
      messages: EPISODE,
      sections: [[lostMiddle], [nextSteps, linking]],
    });
    const missing = episode({ slug: 'slides', messages: EPISODE, sections: [[foundations, linking]] });
    const expected = {
      nested: '<a href="/episodes/page-template#foundations--the-lost-middle">the lost middle</a>',
      leading: '<a href="/episodes/slide-master#the-lost-middle">the lost middle</a>',
    };
    // ACT
    const result = {
      nested: await linkOf(nested, 'why-context-rots'),
      leading: await linkOf(leading, 'why-context-rots'),
    };
    const build = recordContent(missing, 'en', translatorOf('en'));
    // ASSERT
    expect(result).toEqual(expected);
    await expect(build).rejects.toThrow(/the-lost-middle.*slides.*foundations--why-context-rots/);
  });
});

describe('failure cases', () => {
  it('rejects a Slide slug used twice in one Episode, as when a copied Slide collides', async () => {
    // ARRANGE
    const record = episode({
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
  it('refuses a Scene that renders its own Title while the Slide header renders it', async () => {
    // ARRANGE
    const titled = slide({
      slug: 'why-a-template',
      messages: WHY,
      content: ({ t, Title }) => createElement(Title, null, t('title')),
    });
    const record = episode({ slug: 'page-template', messages: EPISODE, sections: [[foundations, titled]] });
    const expected = /header: 'authored'/;
    // ACT
    const { slides } = await recordContent(record, 'en', translatorOf('en'));
    const render = () => renderToStaticMarkup(slides[1].content);
    // ASSERT
    expect(render).toThrow(expected);
  });

  it('refuses a title Slide that declares notes or a Voice script: the Title slide keeps them on the record', async () => {
    // ARRANGE
    const messages = { notes: { n: { header: 'h', description: 'd' } } };
    const hero = slide({
      slug: 'hero',
      messages: { en: messages, de: messages },
      notes: [{ slug: 'n', target: 'title' }],
      content: () => null,
    });
    const record = episode({ slug: 'page-template', messages: EPISODE, title: hero, sections: [[foundations]] });
    const expected = 'hero';
    // ACT
    const build = recordContent(record, 'en', translatorOf('en'));
    // ASSERT
    await expect(build).rejects.toThrow(expected);
  });
});

describe('edge cases', () => {
  it("labels a Context reference with the site-wide string in the page's locale", async () => {
    // ARRANGE
    const notes = { de: { title: 'Grundlagen', notes: { why: { header: 'h', description: 'd' } } } };
    const referring = slide({
      slug: 'foundations',
      messages: { en: { ...notes.de }, de: notes.de },
      notes: [{ slug: 'why', target: 'prose' }],
      content: (kit) => (kit as unknown as RuntimeKit).ref('why')('phrase'),
    });
    const record = episode({ slug: 'page-template', messages: EPISODE, sections: [[referring]] });
    const expected = 'öffnet Sprechernotiz';
    // ACT
    const { slides } = await recordContent(record, 'de', translatorOf('de'));
    const [{ content }] = slides;
    const label = isValidElement<{ label: string }>(content) ? content.props.label : undefined;
    // ASSERT
    expect(label).toBe(expected);
  });
  it("gives no Slide header on an Episode whose Scenes author their own, and lets them render the kit's Title", async () => {
    // ARRANGE
    const titled = slide({
      slug: 'why-a-template',
      messages: WHY,
      content: ({ t, Title }) => createElement(Title, null, t('title')),
    });
    const record = episode({
      slug: 'page-template',
      messages: EPISODE,
      header: 'authored',
      sections: [[foundations, titled]],
    });
    const expected =
      '<h3 data-target="title" class="font-semibold text-balance hyphens-auto text-subheading">Why a template</h3>';
    // ACT
    const { slides, header } = await recordContent(record, 'en', translatorOf('en'));
    // ASSERT
    expect(header).toBe('authored');
    expect(slides.map((placed) => placed.header)).toEqual([undefined, undefined]);
    expect(renderToStaticMarkup(slides[1].content)).toBe(expected);
  });

  it('types the header in by default, and takes the entrance the record names', async () => {
    // ARRANGE
    const record = episode({ slug: 'page-template', messages: EPISODE, entrance: 'fade', sections: [[foundations]] });
    const expected = { byDefault: 'typewriter', named: 'fade' };
    // ACT
    const byDefault = (await recordContent(RECORD, 'en', translatorOf('en'))).entrance;
    const named = (await recordContent(record, 'en', translatorOf('en'))).entrance;
    // ASSERT
    expect({ byDefault, named }).toEqual(expected);
  });

  it('renders a text-fallback link as plain text when the sibling is absent, and as a link when it is there', async () => {
    // ARRANGE
    const absent = episode({ slug: 'slides', messages: EPISODE, sections: [[foundations, optional]] });
    const present = episode({ slug: 'slides', messages: EPISODE, sections: [[foundations, optional, lostMiddle]] });
    const expected = {
      absent: 'the lost middle',
      present: '<a href="/episodes/slides#foundations--the-lost-middle">the lost middle</a>',
    };
    // ACT
    const result = { absent: await linkOf(absent, 'see-also'), present: await linkOf(present, 'see-also') };
    // ASSERT
    expect(result).toEqual(expected);
  });
});
