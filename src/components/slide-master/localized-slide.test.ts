import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { episodeMinutes, localizeSlide, type EpisodeContext, type LocalizedSlide } from './localized-slide';
import { episode, slide, type Slide } from './slide';
import type { RuntimeKit } from './slide-base';

/*
 * The Localized Slide is the one interface that turns a Slide and a locale
 * into what the page renders: these tests read it with real Slides and
 * next-intl's real translator, never the translator, kit or context reader
 * behind it.
 */

// "Copy it once, so the next Episode starts from a working example." is 12 words; the German line is 10.
const WHY = {
  en: {
    title: 'Why every Episode starts from a copy',
    prose: 'A <b>bold</b> start',
    count: '{n, plural, one {# token} other {# tokens}}',
    showAll: 'Show all {count}',
    labels: { one: 'one' },
    notes: {
      'reference-episode': {
        header: 'Why a reference Episode',
        description: 'Point at the prose [1].',
        sources: { spec: { title: 'The spec' } },
        image: { alt: 'A diagram' },
      },
    },
    voiceScript: {
      segments: {
        'one-breath': {
          title: 'The template in one breath',
          keywords: 'template, shape ,, ',
          script: 'Copy it once, so the next Episode starts from a working example.',
          bridge: 'Onward.',
        },
      },
    },
  },
  de: {
    title: 'Warum jede Episode als Kopie beginnt',
    prose: 'Ein <b>kräftiger</b> Anfang',
    count: '{n, plural, one {# Token} other {# Tokens}}',
    showAll: 'Alle {count} zeigen',
    labels: { one: 'eins' },
    notes: {
      'reference-episode': {
        header: 'Warum eine Referenz-Episode',
        description: 'Auf den Text zeigen [1].',
        sources: { spec: { title: 'Die Spezifikation' } },
        image: { alt: 'Ein Diagramm' },
      },
    },
    voiceScript: {
      segments: {
        'one-breath': {
          title: 'Die Vorlage in einem Atemzug',
          keywords: 'Vorlage, Form',
          script: 'Einmal kopieren, damit die nächste Episode mit einem Beispiel beginnt.',
          bridge: 'Weiter.',
        },
      },
    },
  },
};
const SECTION = { en: { title: 'Foundations' }, de: { title: 'Grundlagen' } };
const VISUAL = { en: { caption: 'A picture' }, de: { caption: 'Ein Bild' } };

/** What a Scene saw of its kit, so a test reads it back from the content the Slide returned. */
const seen = (kit: RuntimeKit): ReactNode => kit as unknown as ReactNode;
const kitOf = (localized: LocalizedSlide): RuntimeKit => localized.content as unknown as RuntimeKit;

const foundations = slide({ slug: 'foundations', messages: SECTION, content: (kit) => seen(kit as never) });
const whyATemplate = slide({
  slug: 'why-a-template',
  messages: WHY,
  notes: [{ slug: 'reference-episode', target: 'prose', sources: [{ slug: 'spec', url: 'https://example.com/a' }] }],
  segments: [{ slug: 'one-breath', bridge: true }],
  content: (kit) => seen(kit as never),
});
const retitled = slide({
  slug: 'retitled',
  messages: {
    en: { title: 'Contents title', heading: 'On-screen title' },
    de: { title: 'Inhaltstitel', heading: 'Titel auf dem Bildschirm' },
  },
  content: (kit) => seen(kit as never),
});
const visual = slide({ slug: 'visual', messages: VISUAL, content: (kit) => seen(kit as never) });

/** The Episode a test localizes into: the walk's real placement of these Sections. */
function episodeOf(locale: Locale, sections: readonly (readonly [Slide, ...Slide[]])[]): EpisodeContext {
  return {
    episode: 'page-template',
    locale,
    placed: placeSections<Slide>(sections).flat(),
    referenceLabels: {
      ref: 'opens speaker note',
      marker: (title) => (locale === 'de' ? `Sprechernotiz: ${title}` : `Speaker note: ${title}`),
    },
    header: 'authored',
  };
}

/** Every Slide of the Episode, localized in page order. */
function localized(
  locale: Locale,
  sections: readonly (readonly [Slide, ...Slide[]])[] = [[foundations, whyATemplate, visual]],
): LocalizedSlide[] {
  const episode = episodeOf(locale, sections);
  return episode.placed.map((placed) => localizeSlide(placed as never, episode));
}

/** The heading `Title` builds, at the level the Slide's position gives it. */
function headingOf(kit: RuntimeKit): ReactElement<{ as: string; 'data-target': string; children: ReactNode }> {
  return kit.Title({ children: 'x' }) as ReactElement<{ as: string; 'data-target': string; children: ReactNode }>;
}

describe('success cases', () => {
  it('places each Slide under the id, Section and level its position gives it, titled from its own file', () => {
    // ARRANGE
    const expected = [
      { id: 'foundations', section: 'foundations', level: 'h2', slug: 'foundations', title: 'Grundlagen' },
      {
        id: 'foundations--why-a-template',
        section: 'foundations',
        level: 'h3',
        slug: 'why-a-template',
        title: 'Warum jede Episode als Kopie beginnt',
      },
      { id: 'foundations--visual', section: 'foundations', level: 'h3', slug: 'visual', title: undefined },
    ];
    // ACT
    const slides = localized('de').map(({ id, section, level, slug, title }) => ({ id, section, level, slug, title }));
    // ASSERT
    expect(slides).toEqual(expected);
  });

  it("gives the Scene a translator over its own file in the page's locale, formatting by that locale", () => {
    // ARRANGE
    const expected = ['Warum jede Episode als Kopie beginnt', '2 Tokens', 'de'];
    // ACT
    const kit = kitOf(localized('de')[1]);
    const read = [kit.t('title'), kit.t('count', { n: 2 }), kit.locale];
    // ASSERT
    expect(read).toEqual(expected);
  });

  it('gives the Scene a Title at its position level, marked as the title target', () => {
    // ARRANGE
    const expected = [
      { as: 'h2', target: 'title' },
      { as: 'h3', target: 'title' },
    ];
    // ACT
    const headings = localized('en')
      .slice(0, 2)
      .map((slide) => headingOf(kitOf(slide)).props)
      .map((props) => ({ as: props.as, target: props['data-target'] }));
    // ASSERT
    expect(headings).toEqual(expected);
  });

  it('renders a heading key as the on-screen title while the table of contents keeps the title key', () => {
    // ARRANGE
    const expected = { toc: 'Inhaltstitel', heading: 'Titel auf dem Bildschirm', plain: 'x' };
    // ACT
    const [, retitledSlide, plainSlide] = localized('de', [[foundations, retitled, whyATemplate]]);
    const result = {
      toc: retitledSlide.title,
      heading: headingOf(kitOf(retitledSlide)).props.children,
      plain: headingOf(kitOf(plainSlide)).props.children,
    };
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('links each Slide slug to the localized anchor the walk placed it at', () => {
    // ARRANGE
    const expected = [
      '/de/episodes/page-template#foundations--why-a-template',
      '/de/episodes/page-template#foundations',
    ];
    // ACT
    const kit = kitOf(localized('de')[2]);
    const hrefs = [kit.slideHref('why-a-template'), kit.slideHref('foundations')];
    // ASSERT
    expect(hrefs).toEqual(expected);
  });

  it('links each Slide slug on the page an Event presents the Episode at, so the attendee stays under the Event', () => {
    // ARRANGE
    const route = '/events/2026-10-23-axel-agentic-workflow/episodes/page-template';
    const expected = `/de${route}#foundations--why-a-template`;
    const episode = { ...episodeOf('de', [[foundations, whyATemplate, visual]]), route };
    // ACT
    const kit = kitOf(localizeSlide(episode.placed[2] as never, episode));
    const href = kit.slideHref('why-a-template');
    // ASSERT
    expect(href).toBe(expected);
  });

  it("returns a key's raw string, placeholders unfilled, for a client component to fill", () => {
    // ARRANGE
    const expected = 'Show all {count}';
    // ACT
    const template = kitOf(localized('en')[1]).template('showAll');
    // ASSERT
    expect(template).toBe(expected);
  });

  it('renders the default rich tags beside a Context reference the Slide passes', () => {
    // ARRANGE
    const kit = kitOf(localized('en')[1]);
    const expected = ['string', 'b', 'string'];
    // ACT
    const parts = kit.t.rich('prose', { ref: kit.ref('reference-episode') }) as unknown[];
    // ASSERT
    expect(parts.map((part) => (isValidElement(part) ? part.type : typeof part))).toEqual(expected);
  });

  it('names a Context marker after the header of the note it opens, in the page locale', () => {
    // ARRANGE
    const expected = { label: 'Sprechernotiz: Warum eine Referenz-Episode', note: 'reference-episode' };
    const { Marker } = kitOf(localized('de')[1]);
    // ACT
    const button = load(renderToStaticMarkup(Marker({ note: 'reference-episode' })))('button');
    const seen = { label: button.attr('aria-label'), note: button.attr('data-context-ref') };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('follows a phrase in running text with its inline Context marker, kept on the same line', () => {
    // ARRANGE
    const kit = kitOf(localized('en')[1]);
    const expected = { text: 'keeps the shape\u00a0', label: 'Speaker note: Why a reference Episode' };
    // ACT
    const html = renderToStaticMarkup(
      createElement(Fragment, null, kit.marker('reference-episode')('keeps the shape')),
    );
    const $ = load(html);
    const seen = { text: $('body').contents().first().text(), label: $('button').attr('aria-label') };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('colours an inline Context marker as its surface needs, by the class it is given', () => {
    // ARRANGE
    const kit = kitOf(localized('en')[1]);
    const expected = 'text-primary-foreground/70';
    // ACT
    const html = renderToStaticMarkup(
      createElement(Fragment, null, kit.marker('reference-episode', expected)('keeps the shape')),
    );
    // ASSERT
    expect(load(html)('button').attr('class')?.split(/\s+/)).toContain(expected);
  });

  it("resolves the Slide's notes and Voice script from its own file, with short targets and titled sources", () => {
    // ARRANGE
    const expectedNote = {
      slug: 'reference-episode',
      header: 'Why a reference Episode',
      description: 'Point at the prose [1].',
      target: 'prose',
      sources: [{ slug: 'spec', url: 'https://example.com/a', title: 'The spec' }],
    };
    const expectedSegment = {
      slug: 'one-breath',
      title: 'The template in one breath',
      keywords: ['template', 'shape'],
      script: 'Copy it once, so the next Episode starts from a working example.',
      bridge: 'Onward.',
      from: 0,
      to: 13 / 140,
    };
    // ACT
    const { notes, voiceScript } = localized('en')[1];
    // ASSERT
    expect(notes).toEqual([expectedNote]);
    expect(voiceScript).toEqual([expectedSegment]);
  });

  it("times a Slide from its own Voice script's words, script and bridge, in the page's locale", () => {
    // ARRANGE
    const expected = { en: 13 / 140, de: 11 / 120 };
    // ACT
    const minutes = { en: localized('en')[1].minutes, de: localized('de')[1].minutes };
    // ASSERT
    expect(minutes).toEqual(expected);
  });

  it("totals an Episode's reading time per locale from every Slide's Voice script, listed or not", () => {
    // ARRANGE
    const again = slide({
      slug: 'again',
      messages: WHY,
      segments: [{ slug: 'one-breath', bridge: true }],
      content: () => null,
    });
    const messages = { title: 'Page template', caption: 'The smallest Episode.', description: 'A test.' };
    const record = episode({
      slug: 'page-template',
      messages: { en: messages, de: messages },
      sections: [
        [foundations, whyATemplate],
        [again, visual],
      ],
    });
    const expected = { en: 26 / 140, de: 22 / 120 };
    // ACT
    const minutes = { en: episodeMinutes(record, 'en'), de: episodeMinutes(record, 'de') };
    // ASSERT
    expect(minutes).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a link to a slug that is not a Slide of the same Episode, naming the linking Slide', () => {
    // ARRANGE
    const kit = kitOf(localized('en')[2]);
    const expected = /no-such-slide.*foundations--visual/;
    // ACT
    const link = () => kit.slideHref('no-such-slide');
    // ASSERT
    expect(link).toThrow(expected);
  });

  it("rejects a key missing from the Slide's own file in the page's locale, even past the types", () => {
    // ARRANGE
    const gap = slide({
      slug: 'gap',
      messages: { en: { title: 'Gap', caption: 'c' }, de: { title: 'Lücke' } as never },
      content: ({ t }) => t('caption'),
    });
    const expected = 'caption';
    // ACT
    const build = () => localized('de', [[foundations, gap]] as never);
    // ASSERT
    expect(build).toThrow(expected);
  });

  it('rejects a context reference to a note the Slide does not declare, even past the types', () => {
    // ARRANGE
    const kit = kitOf(localized('en')[0]);
    const expected = 'reference-episode';
    // ACT
    const ref = () => kit.ref('reference-episode');
    // ASSERT
    expect(ref).toThrow(expected);
  });

  it('rejects a Context marker for a note the Slide does not declare, even past the types', () => {
    // ARRANGE
    const kit = kitOf(localized('en')[0]);
    const expected = 'reference-episode';
    // ACT
    const inline = () => kit.marker('reference-episode');
    const element = () => kit.Marker({ note: 'reference-episode' });
    // ASSERT
    expect(inline).toThrow(expected);
    expect(element).toThrow(expected);
  });

  it('rejects a template key that holds no string, even past the types', () => {
    // ARRANGE
    const kit = kitOf(localized('en')[1]);
    const expected = 'labels';
    // ACT
    const read = () => kit.template('labels');
    // ASSERT
    expect(read).toThrow(expected);
  });

  it('rejects a Section that opens with an untitled Slide, even past the types', () => {
    // ARRANGE
    const expected = 'visual';
    // ACT
    const build = () => localized('en', [[visual]] as never);
    // ASSERT
    expect(build).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('gives a Slide without notes or a Voice script empty lists and 0 minutes', () => {
    // ARRANGE
    const expected = { notes: [], voiceScript: [], minutes: 0 };
    // ACT
    const { notes, voiceScript, minutes } = localized('en')[2];
    // ASSERT
    expect({ notes, voiceScript, minutes }).toEqual(expected);
  });

  it("lets a Slide's own tag override a default one of the same name", () => {
    // ARRANGE
    const kit = kitOf(localized('en')[1]);
    const own = (chunks: ReactNode) => `[${String(chunks)}]`;
    const expected = 'A [bold] start';
    // ACT
    const parts = kit.t.rich('prose', { b: own });
    // ASSERT
    expect(parts).toEqual(expected);
  });

  it("carries next-intl's other translator members over, so one the kit does not wrap still works", () => {
    // ARRANGE
    const expected = [true, false];
    // ACT
    const kit = kitOf(localized('en')[1]);
    const has = [kit.t.has('title'), kit.t.has('missing')];
    // ASSERT
    expect(has).toEqual(expected);
  });

  it('omits the bridge, sources and image a Slide does not declare', () => {
    // ARRANGE
    const bare = slide({
      slug: 'bare',
      messages: WHY,
      notes: [{ slug: 'reference-episode', target: 'prose' }],
      segments: [{ slug: 'one-breath' }],
      content: () => null,
    });
    const absent = ['sources', 'image', 'bridge'];
    // ACT
    const { notes, voiceScript } = localized('en', [[foundations, bare]])[1];
    const present = absent.filter((key) => key in notes[0] || key in voiceScript[0]);
    // ASSERT
    expect(present).toEqual([]);
  });
});
