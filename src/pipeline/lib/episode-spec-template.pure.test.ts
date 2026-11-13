import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { filledMarkup, fillIn, templateOf, type Slot } from './episode-spec-template.pure.ts';

/*
 * The Spec template's slots at their seam: markup in, markup out. A `data-slot` element takes markup, is handed over
 * to a function or is dropped, and a slot the assembler does not know throws.
 */

const NOTHING = () => undefined;
const PAGE = '<main><h1 data-slot="heading">Old</h1><p data-slot="lede">Old</p></main>';
const ITEM_TEMPLATE = '<template data-template="item"><article><h3 data-slot="title"></h3></article></template>';

describe('success cases', () => {
  describe('fillIn', () => {
    it('replaces the content of a slot holding markup and removes its data-slot attribute', () => {
      // ARRANGE
      const $ = load(PAGE, null, false);
      const slots = { heading: 'The <em>title</em>', lede: 'A lede.' };
      const expected = '<main><h1>The <em>title</em></h1><p>A lede.</p></main>';
      // ACT
      fillIn($, slots);
      // ASSERT
      expect($.html()).toBe(expected);
    });

    it('hands the element of a slot given a function over, to set attributes', () => {
      // ARRANGE
      const $ = load(PAGE, null, false);
      const heading: Slot = (element) => void element.attr('id', 'episode');
      // ACT
      fillIn($, { heading, lede: 'A lede.' });
      // ASSERT
      expect($('h1').attr('id')).toBe('episode');
      expect($('h1').text()).toBe('Old');
    });
  });

  describe('templateOf', () => {
    it('returns the markup of the named template, trimmed', () => {
      // ARRANGE
      const $ = load(ITEM_TEMPLATE);
      const expected = '<article><h3 data-slot="title"></h3></article>';
      // ACT
      const markup = templateOf($, 'item');
      // ASSERT
      expect(markup).toBe(expected);
    });
  });

  describe('filledMarkup', () => {
    it('fills the slots, hands the one root to finish and prints it', () => {
      // ARRANGE
      const markup = '<article><h3 data-slot="title"></h3></article>';
      const expected = '<article id="slide-1"><h3>Spent attention</h3></article>';
      // ACT
      const html = filledMarkup(markup, { title: 'Spent attention' }, (root) => void root.attr('id', 'slide-1'));
      // ASSERT
      expect(html).toBe(expected);
    });
  });
});

describe('failure cases', () => {
  describe('fillIn', () => {
    it('throws naming a slot the assembler does not fill', () => {
      // ARRANGE
      const $ = load('<p data-slot="mystery"></p>', null, false);
      const message = /names the slot "mystery"/;
      // ACT
      const fill = () => fillIn($, { heading: 'x' });
      // ASSERT
      expect(fill).toThrow(message);
    });
  });

  describe('templateOf', () => {
    it('throws naming the template a page lacks', () => {
      // ARRANGE
      const $ = load(ITEM_TEMPLATE);
      const message = /no <template data-template="option">/;
      // ACT
      const read = () => templateOf($, 'option');
      // ASSERT
      expect(read).toThrow(message);
    });
  });

  describe('filledMarkup', () => {
    it('throws on a slot of its markup that the slots do not name', () => {
      // ARRANGE
      const markup = '<article><h3 data-slot="title"></h3><p data-slot="extra"></p></article>';
      const message = /names the slot "extra"/;
      // ACT
      const fill = () => filledMarkup(markup, { title: 'x' }, NOTHING);
      // ASSERT
      expect(fill).toThrow(message);
    });
  });
});

describe('edge cases', () => {
  describe('fillIn', () => {
    it('removes a slot given no value or an empty one, leaving its siblings', () => {
      // ARRANGE
      const $ = load(PAGE, null, false);
      const expected = '<main></main>';
      // ACT
      fillIn($, { heading: undefined, lede: '' });
      // ASSERT
      expect($.html()).toBe(expected);
    });

    it('treats a slot named like an Object property as unknown unless the caller names it', () => {
      // ARRANGE
      const $ = load('<p data-slot="constructor"></p>', null, false);
      const message = /names the slot "constructor"/;
      // ACT
      const fill = () => fillIn($, {});
      // ASSERT
      expect(fill).toThrow(message);
    });
  });
});
