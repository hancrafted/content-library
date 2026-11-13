import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Zone } from './ruler.pure';
import { zonePresentation } from './zone-presentation';

/*
 * The `presentation` a Slide takes from the Section it names (design guide, Iceberg): its zone's surface, light text
 * on the dark zones, the bubbles ink into a section slide, and the slim rail, which a section slide shows on phones
 * only, beside the whole ruler it carries on wider screens.
 */

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

/** The rail a presentation draws behind its Slide, read as the page renders it. */
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
  it('gives a page Slide its zone surface and a rail with its Section lit, on phones too, and no bubbles', () => {
    // ARRANGE
    const expected = {
      surface: 'var(--zone-midnight)',
      enter: undefined,
      mobile: true,
      rail: { rails: 1, phoneOnly: undefined, lit: ['6'] },
    };
    // ACT
    const presentation = zonePresentation({ sections: SECTIONS, section: 6, kind: 'page' });
    const seen = {
      surface: presentation.style['--slide-surface'],
      enter: presentation.enter,
      mobile: presentation.rearMobile,
      rail: railOf(presentation.rear),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('descends into a section slide through bubbles, its rail kept to phones where the whole ruler is hidden', () => {
    // ARRANGE
    const expected = {
      enter: { effect: 'bubbles' },
      surface: 'var(--zone-sunlit)',
      rail: { rails: 1, phoneOnly: '', lit: ['2'] },
    };
    // ACT
    const presentation = zonePresentation({ sections: SECTIONS, section: 2, kind: 'section' });
    const seen = {
      enter: presentation.enter,
      surface: presentation.style['--slide-surface'],
      rail: railOf(presentation.rear),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
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
  it('turns text light on the two dark zones in both themes, and leaves the page text alone above them', () => {
    // ARRANGE
    const expected = ['var(--on-brand-accent)', 'var(--on-brand-accent)', undefined, undefined];
    // ACT
    const seen = [6, 7, 4, 0].map(
      (section) => zonePresentation({ sections: SECTIONS, section, kind: 'page' }).style['--foreground'],
    );
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
