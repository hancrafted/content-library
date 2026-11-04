import { introHitlWorkflows } from '@/episodes/by-event/2026-11-04-intro-hitl-workflows/intro/episode';
import { episode, slide } from '@/episodes/components/slide-master/slide';
import type { RuntimeKit, RuntimeTranslator } from '@/episodes/components/slide-master/slide-base';
import { contextWindow } from '@/episodes/explorable-pages/context-window/episode';
import { TRANSLATIONS } from '@/page-assembly/translations';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { recordContent, type TranslatorOf } from './record-content';
import { SlideWrapper } from './slide-wrapper';

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
  slug: 'ai-token-economy',
  messages: EPISODE,
  sections: [[foundations, whyATemplate, visual], [nextSteps]],
});

describe('success cases', () => {
  it.each(['en', 'de'] as const)(
    'renders the workshop poll transitions with incoming goo precedence in %s',
    async (locale) => {
      // ARRANGE
      const expectedEdges = [
        ['agenda→poll', 'glitch'],
        ['poll→check-in-1', 'paper'],
        ['check-in-1→check-in-2', 'liquid'],
        ['check-in-2→check-in-3', 'goo'],
      ];
      const expectedSurfaces = [
        ['poll', 'inverse'],
        ['check-in-2', 'inverse'],
        ['check-in-3', 'normal'],
      ];
      // ACT
      const content = await recordContent(introHitlWorkflows, locale, {
        translatorOf: translatorOf(locale),
        id: '2026-11-04-intro-hitl-workflows__intro',
        route: '/events/2026-11-04-intro-hitl-workflows/episodes/intro',
      });
      const html = renderToStaticMarkup(
        createElement(
          Fragment,
          null,
          ...content.slides.map((entry) =>
            createElement(
              SlideWrapper,
              {
                key: entry.id,
                id: entry.id,
                presentation: entry.presentation,
                transition: content.transitions.get(entry.id),
              },
              entry.content,
            ),
          ),
        ),
      );
      const $ = load(html);
      const edges = $('[data-transition-edge]')
        .toArray()
        .map((host) => [$(host).attr('data-transition-edge'), $(host).attr('data-transition-effect')]);
      const surfaces = $('[data-surface-tone]')
        .toArray()
        .map((host) => [$(host).attr('id'), $(host).attr('data-surface-tone')]);
      // ASSERT
      expect(edges).toEqual(expectedEdges);
      expect(surfaces).toEqual(expectedSurfaces);
    },
  );
  it.each(['en', 'de'] as const)(
    'renders the workshop Intro Title inverse with liquid departure in %s',
    async (locale) => {
      // ARRANGE
      const expectedTone = 'inverse';
      const expectedEdge = 'top→grounding';
      const expectedEffect = 'liquid';
      // ACT
      const content = await recordContent(introHitlWorkflows, locale, {
        translatorOf: translatorOf(locale),
        id: '2026-11-04-intro-hitl-workflows__intro',
        route: '/events/2026-11-04-intro-hitl-workflows/episodes/intro',
      });
      const html = renderToStaticMarkup(
        createElement(
          SlideWrapper,
          { id: 'top', presentation: content.titlePresentation, transition: content.transitions.get('top') },
          content.hero,
        ),
      );
      const $ = load(html);
      // ASSERT
      expect($('#top').attr('data-surface-tone')).toBe(expectedTone);
      expect($('[data-transition-edge]').attr('data-transition-edge')).toBe(expectedEdge);
      expect($('[data-transition-edge]').attr('data-transition-effect')).toBe(expectedEffect);
    },
  );
  it.each(['liquid', 'paper', 'glitch', 'goo', 'dither', 'wave'] as const)(
    'renders repeated %s edges with independent matching filter identities',
    async (effect) => {
      // ARRANGE
      const record = episode({
        ...RECORD,
        sections: [
          [
            { ...foundations, presentation: { leave: { effect } } },
            { ...whyATemplate, presentation: { leave: { effect } } },
            visual,
          ],
        ],
      });
      const expectedEdges = [
        'foundations→foundations--why-a-template',
        'foundations--why-a-template→foundations--visual',
      ];
      const edgeCount = 2;
      // ACT
      const content = await recordContent(record, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' });
      const tree = createElement(
        Fragment,
        null,
        ...content.slides.map((entry) =>
          createElement(
            SlideWrapper,
            {
              key: entry.id,
              id: entry.id,
              presentation: entry.presentation,
              transition: content.transitions.get(entry.id),
            },
            entry.content,
          ),
        ),
      );
      const html = renderToStaticMarkup(tree);
      const $ = load(html);
      const hosts = $('[data-transition-edge]').toArray();
      const ids = $('filter[id]')
        .toArray()
        .map((filter) => $(filter).attr('id'));
      const references = hosts.map((host) => $(host).find('[data-ink-scale]').parent().attr('style'));
      // ASSERT
      expect(hosts.map((host) => $(host).attr('data-transition-edge'))).toEqual(expectedEdges);
      expect(ids).toHaveLength(edgeCount);
      expect(new Set(ids).size).toBe(edgeCount);
      references.forEach((reference, index) => expect(reference).toContain(`filter:url(#${ids[index]})`));
      expect(renderToStaticMarkup(tree)).toBe(html);
    },
  );
  it('carries explicit navigation entrance independently of a legacy inverse Title', async () => {
    // ARRANGE
    const record = episode({ ...RECORD, tone: 'inverse', tocEntrance: 'visible-from-start' });
    const expected = 'visible-from-start';
    // ACT
    const content = await recordContent(record, 'en', {
      translatorOf: translatorOf('en'),
      id: 'ai-token-economy',
    });
    // ASSERT
    expect(content.tocEntrance).toBe(expected);
    expect(content.titlePresentation).toBeUndefined();
  });
  it('composes the Context Title with independent inverse surface, rear drift and outgoing ink', async () => {
    // ARRANGE
    const expected = { tone: 'inverse', effect: 'liquid', incoming: 'play' };
    const backdrop = 'data-slot="slide-backdrop"';
    const mount = 'data-slot="slide-mount"';
    const motionButton = 'data-hero-motion-button';
    // ACT
    const content = await recordContent(contextWindow, 'de', {
      translatorOf: translatorOf('de'),
      id: 'context-window',
      route: '/explorables/context-window',
    });
    // ASSERT
    expect(content.titlePresentation?.tone).toBe(expected.tone);
    expect(content.titlePresentation?.rear).toBeDefined();
    expect(content.transitions.get('top')?.declaration.effect).toBe(expected.effect);
    expect(content.transitions.get('top')?.incoming).toBe(expected.incoming);
    const html = renderToStaticMarkup(
      createElement(SlideWrapper, { id: 'top', presentation: content.titlePresentation }, content.hero),
    );
    expect(html.indexOf(backdrop)).toBeLessThan(html.indexOf(mount));
    expect(html).toContain(motionButton);
  });
  it('uses the Episode leave policy and carries single-sided declarations across no-effect neighbours', async () => {
    // ARRANGE
    const leave = { effect: 'paper' as const };
    const enter = { effect: 'goo' as const };
    const record = episode({
      slug: 'ai-token-economy',
      messages: EPISODE,
      transitionPrecedence: 'leave',
      sections: [
        [
          { ...foundations, presentation: { leave } },
          { ...whyATemplate, presentation: { enter, leave } },
          { ...visual, presentation: { enter } },
          nextSteps,
        ],
      ],
    });
    const expected = [
      ['foundations', leave],
      ['foundations--why-a-template', leave],
    ];
    // ACT
    const content = await recordContent(record, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' });
    // ASSERT
    expect([...content.transitions].map(([host, edge]) => [host, edge.declaration])).toEqual(expected);
  });
  it('resolves incoming enter once while retaining the outgoing host and portable token scope', async () => {
    // ARRANGE
    const leave = { effect: 'paper' as const };
    const enter = { effect: 'wave' as const, className: 'portable', style: { '--slide-transition-bleed': '180px' } };
    const record = episode({
      slug: 'ai-token-economy',
      messages: EPISODE,
      sections: [
        [
          { ...foundations, presentation: { leave } },
          { ...whyATemplate, presentation: { enter, tone: 'inverse' } },
        ],
      ],
    });
    const expected = {
      id: 'foundations→foundations--why-a-template',
      outgoing: 'foundations',
      incoming: 'foundations--why-a-template',
      declaration: enter,
      targetSurface: 'var(--tone-paper)',
    };
    // ACT
    const content = await recordContent(record, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' });
    // ASSERT
    expect(content.transitions.get(expected.outgoing)).toEqual(expected);
  });
  it("reads the Episode's own title and caption in the page's locale", async () => {
    // ARRANGE
    const expected = { title: 'Seitenvorlage', caption: 'Die kleinste Episode.' };
    // ACT
    const { title, caption } = await recordContent(RECORD, 'de', {
      translatorOf: translatorOf('de'),
      id: 'ai-token-economy',
    });
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
    const { slides } = await recordContent(RECORD, 'de', { translatorOf: translatorOf('de'), id: 'ai-token-economy' });
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
    const record = episode({
      slug: 'ai-token-economy',
      messages: EPISODE,
      sections: [[foundations, captioned, visual]],
    });
    const expected = [
      { title: 'Foundations' },
      { title: 'Why start from a template?', caption: 'One spine.' },
      undefined,
    ];
    // ACT
    const { slides, header } = await recordContent(record, 'en', {
      translatorOf: translatorOf('en'),
      id: 'ai-token-economy',
    });
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
    const record = episode({ slug: 'ai-token-economy', messages: EPISODE, title: hero, sections: [[foundations]] });
    const expected = '<p>Rakete</p>';
    // ACT
    const { hero: scene } = await recordContent(record, 'de', {
      translatorOf: translatorOf('de'),
      id: 'ai-token-economy',
    });
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
    const record = episode({ slug: 'ai-token-economy', messages: EPISODE, title: hero, sections: [[foundations]] });
    const expected = 'Eine leere Pipeline.';
    // ACT
    const { caption } = await recordContent(record, 'de', { translatorOf: translatorOf('de'), id: 'ai-token-economy' });
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
    const record = episode({ slug: 'ai-token-economy', messages: EPISODE, sections: [[bold]] });
    const expected = { title: 'Foundations', caption: 'Revenue lands here.', captionEmphasis: [{ start: 8, end: 13 }] };
    // ACT
    const { slides } = await recordContent(record, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' });
    // ASSERT
    expect(slides[0].header).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a Slide slug used twice in one Episode, as when a copied Slide collides', async () => {
    // ARRANGE
    const record = episode({
      slug: 'ai-token-economy',
      messages: EPISODE,
      sections: [[foundations], [foundations]],
    });
    const expected = 'foundations';
    // ACT
    const build = recordContent(record, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' });
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
    const record = episode({ slug: 'ai-token-economy', messages: EPISODE, sections: [[foundations, titled]] });
    const expected = /header: 'authored'/;
    // ACT
    const { slides } = await recordContent(record, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' });
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
    const record = episode({ slug: 'ai-token-economy', messages: EPISODE, title: hero, sections: [[foundations]] });
    const expected = 'hero';
    // ACT
    const build = recordContent(record, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' });
    // ASSERT
    await expect(build).rejects.toThrow(expected);
  });
});

describe('edge cases', () => {
  it('keeps enter-only and leave-only choices independent from tone and decoration and omits undeclared edges', async () => {
    // ARRANGE
    const enter = { effect: 'dither' as const };
    const leave = { effect: 'liquid' as const };
    const record = episode({
      slug: 'ai-token-economy',
      messages: EPISODE,
      sections: [[foundations, { ...whyATemplate, presentation: { enter, leave } }, visual, nextSteps]],
    });
    const hosts = ['foundations', 'foundations--why-a-template'];
    const choices = [enter, leave];
    // ACT
    const content = await recordContent(record, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' });
    const plain = await recordContent(RECORD, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' });
    // ASSERT
    expect([...content.transitions.keys()]).toEqual(hosts);
    expect([...content.transitions.values()].map((edge) => edge.declaration)).toEqual(choices);
    expect(content.slides[1].presentation?.tone).toBeUndefined();
    expect(content.slides[1].presentation?.front).toBeUndefined();
    expect(plain.transitions.size).toBe(0);
  });
  it("labels a Context reference with the site-wide string in the page's locale", async () => {
    // ARRANGE
    const notes = { de: { title: 'Grundlagen', notes: { why: { header: 'h', description: 'd' } } } };
    const referring = slide({
      slug: 'foundations',
      messages: { en: { ...notes.de }, de: notes.de },
      notes: [{ slug: 'why', target: 'prose' }],
      content: (kit) => (kit as unknown as RuntimeKit).ref('why')('phrase'),
    });
    const record = episode({ slug: 'ai-token-economy', messages: EPISODE, sections: [[referring]] });
    const expected = 'öffnet Sprechernotiz';
    // ACT
    const { slides } = await recordContent(record, 'de', { translatorOf: translatorOf('de'), id: 'ai-token-economy' });
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
      slug: 'ai-token-economy',
      messages: EPISODE,
      header: 'authored',
      sections: [[foundations, titled]],
    });
    const expected =
      '<h3 data-target="title" class="font-semibold text-balance hyphens-auto text-subheading">Why a template</h3>';
    // ACT
    const { slides, header } = await recordContent(record, 'en', {
      translatorOf: translatorOf('en'),
      id: 'ai-token-economy',
    });
    // ASSERT
    expect(header).toBe('authored');
    expect(slides.map((placed) => placed.header)).toEqual([undefined, undefined]);
    expect(renderToStaticMarkup(slides[1].content)).toBe(expected);
  });

  it('types the header in by default, and takes the entrance the record names', async () => {
    // ARRANGE
    const record = episode({
      slug: 'ai-token-economy',
      messages: EPISODE,
      entrance: 'fade',
      sections: [[foundations]],
    });
    const expected = { byDefault: 'typewriter', named: 'fade' };
    // ACT
    const byDefault = (await recordContent(RECORD, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' }))
      .entrance;
    const named = (await recordContent(record, 'en', { translatorOf: translatorOf('en'), id: 'ai-token-economy' }))
      .entrance;
    // ASSERT
    expect({ byDefault, named }).toEqual(expected);
  });
});
