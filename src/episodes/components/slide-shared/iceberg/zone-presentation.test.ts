import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { zonePresentation, zoneTitlePresentation } from './zone-presentation';
import type { Zone } from './zones.pure';

const SKY_TOP = 'color-mix(in oklab, var(--zone-surface) 64%, var(--info))';

const SECTIONS: readonly Zone[] = [
  'surface',
  'surface',
  'sunlit',
  'sunlit',
  'twilight',
  'twilight',
  'midnight',
  'abyss',
];

const railOf = (rear: Parameters<typeof renderToStaticMarkup>[0]) => {
  const $ = load(renderToStaticMarkup(createElement('div', null, rear)));
  return {
    rails: $('[data-depth-rail]').length,
    phoneOnly: $('[data-depth-rail]').attr('data-phone-only'),
    lit: $('[data-depth-rail] [data-lit]')
      .toArray()
      .map((tile) => $(tile).attr('data-section')),
  };
};

describe('success cases', () => {
  it('keeps a page Slide on the page background, with a rail with its Section lit, on phones too, and no bubbles', () => {
    // ARRANGE
    const expected = {
      surface: undefined,
      enter: undefined,
      mobile: true,
      rail: { rails: 1, phoneOnly: undefined, lit: ['6'] },
    };
    // ACT
    const presentation = zonePresentation({
      sections: SECTIONS,
      section: 6,
      kind: 'page',
    });
    const seen = {
      surface: presentation.surface?.background,
      enter: presentation.enter,
      mobile: presentation.rearMobile,
      rail: railOf(presentation.rear),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('fills a section slide with its zone and descends into it through bubbles, its rail kept to phones', () => {
    // ARRANGE
    const expected = {
      enter: { effect: 'bubbles' },
      surface: 'var(--zone-sunlit)',
      rail: { rails: 1, phoneOnly: '', lit: ['2'] },
    };
    // ACT
    const presentation = zonePresentation({
      sections: SECTIONS,
      section: 2,
      kind: 'section',
    });
    const seen = {
      enter: presentation.enter,
      surface: presentation.surface?.background,
      rail: railOf(presentation.rear),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('fills a Surface section slide with the top of its sky, so the wave reads as one with the sky, its bubbles still tinted --zone-surface', () => {
    // ARRANGE
    const expected = { surface: SKY_TOP, bubbleTint: { '--slide-transition-bubble': 'var(--zone-surface)' } };
    // ACT
    const presentation = zonePresentation({
      sections: SECTIONS,
      section: 0,
      kind: 'section',
    });
    const seen = {
      surface: presentation.surface?.background,
      bubbleTint: (presentation.enter as { style?: unknown } | undefined)?.style,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('fills the Title slide with the top of the Surface sky, its text dark in both themes', () => {
    // ARRANGE
    const expected = { surface: SKY_TOP, foreground: 'var(--zone-abyss)' };
    // ACT
    const { surface } = zoneTitlePresentation();
    const seen = {
      surface: surface?.background,
      foreground: surface?.foreground,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('writes no text colour into a zone style: the Surface carries it, whole-Slide, with the 78% muted text', () => {
    // ARRANGE
    const expected = {
      style: [undefined, undefined],
      scope: 'slide',
      muted: 'color-mix(in oklab, var(--zone-abyss) 78%, transparent)',
    };
    // ACT
    const { style, surface } = zonePresentation({
      sections: SECTIONS,
      section: 0,
      kind: 'section',
    });
    const seen = {
      style: [style['--foreground'], style['--muted-foreground']],
      scope: surface?.textScope,
      muted: surface?.muted,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('keeps the scene behind a section slide alone: a page Slide draws only its rail, whatever scene it is handed', () => {
    // ARRANGE
    const expected = { scenes: 0, rails: 1 };
    const scene = createElement('svg', { 'data-test-scene': '' });
    // ACT
    const { rear } = zonePresentation({
      sections: SECTIONS,
      section: 3,
      kind: 'page',
      scene,
    });
    const $ = load(renderToStaticMarkup(createElement('div', null, rear)));
    const seen = {
      scenes: $('[data-test-scene]').length,
      rails: $('[data-depth-rail]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('refuses a Section the Episode does not have', () => {
    // ARRANGE
    const expected = /No Section 8 of 8/;
    // ACT
    const build = () => zonePresentation({ sections: SECTIONS, section: 8, kind: 'page' });
    // ASSERT
    expect(build).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws the scene of a section slide full-bleed behind it, under its rail, its text dark to the Sunlit and light from the Twilight down', () => {
    // ARRANGE
    const dark = 'var(--zone-abyss)';
    const light = 'var(--on-brand-accent)';
    const expected = {
      order: ['scene', 'rail'],
      foreground: [dark, dark, light, light, light],
    };
    const scene = createElement('svg', { 'data-test-scene': '' });
    // ACT
    const at = (section: number) => zonePresentation({ sections: SECTIONS, section, kind: 'section', scene });
    const $ = load(renderToStaticMarkup(createElement('div', null, at(0).rear)));
    const seen = {
      order: $('[data-test-scene], [data-depth-rail]')
        .toArray()
        .map((element) => ($(element).is('[data-test-scene]') ? 'scene' : 'rail')),
      foreground: [0, 2, 4, 6, 7].map((section) => at(section).surface?.foreground),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('lands a section slide with its zone under the page header, a page Slide where it always did', () => {
    // ARRANGE
    const expected = {
      section: { offset: '0px', before: 'var(--header-block)' },
      page: { offset: undefined, before: undefined },
    };
    // ACT
    const landing = (kind: 'section' | 'page') => {
      const { style } = zonePresentation({
        sections: SECTIONS,
        section: 3,
        kind,
      });
      return {
        offset: style['--slide-anchor-offset'],
        before: style['--slide-space-before'],
      };
    };
    const seen = { section: landing('section'), page: landing('page') };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('leaves a page Slide on the page background and text at every depth, the dark zones too', () => {
    // ARRANGE
    const expected = [{}, {}, {}, {}];
    // ACT
    const seen = [6, 7, 4, 0].map((section) => {
      const { style, surface } = zonePresentation({
        sections: SECTIONS,
        section,
        kind: 'page',
      });
      return { ...style, ...surface };
    });
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
