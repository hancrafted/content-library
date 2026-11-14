import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { itemMarkup, optionsMarkup, type Item } from './episode-spec-items.pure.ts';

/*
 * The Spec's items and Options at their seam: a template and the content in, the cloned markup out. The items fill
 * the item and Option `<template>`s of the Spec template, and a slot the template names that the assembler does not
 * know throws.
 */

const ITEM_TEMPLATE = `<article data-spec="slide" data-fidelity data-depth="simple">
  <h3 data-slot="title"></h3>
  <span data-slot="number"></span>
  <p data-slot="purpose"></p>
  <div data-slot="options"></div>
  <textarea data-slot="note"></textarea>
</article>`;
const OPTION_TEMPLATE = `<figure data-spec="option" data-option data-recommended="false">
  <div data-slot="stage"></div>
  <span data-slot="id"></span>
  <figcaption data-slot="caption"></figcaption>
  <input type="checkbox" data-slot="pick" />
  <div data-slot="build-notes"></div>
</figure>`;
const FRAGMENT = `<figure data-spec="option" data-option="1a" data-recommended>
  <div data-spec="mock">Mock 1a</div>
  <figcaption><b>1a</b> A reason.</figcaption>
  <div data-spec="build-notes">Parts for 1a.</div>
</figure>
<figure data-spec="option" data-option="1b">
  <div data-spec="mock">Mock 1b</div>
  <figcaption><b>1b</b> Another.</figcaption>
</figure>`;
const SLUG = 'spent';
const NUMBER = 3;
const TITLE_NUMBER = 0;
const FIDELITY = 'mock';
const [FIRST, SECOND] = ['1a', '1b'] as const;
const SLIDE: Item = {
  id: SLUG,
  role: 'slide',
  number: NUMBER,
  title: 'Spent attention',
  purpose: 'The window fills.',
  options: '<figure data-option="1a"></figure>',
  notePlaceholder: 'Note on Slide 3',
};
describe('success cases', () => {
  describe('itemMarkup', () => {
    it('fills the item template: its slots, its ids, the fidelity and the Slide number', () => {
      // ARRANGE
      const slide = SLIDE;
      const attributes = { id: SLUG, 'data-item': SLUG, 'data-number': String(NUMBER), 'data-fidelity': FIDELITY };
      const noteName = `note:${SLUG}`;
      // ACT
      const $ = load(itemMarkup(slide, ITEM_TEMPLATE), null, false);
      // ASSERT
      expect($('article').attr()).toMatchObject(attributes);
      expect($('h3').text()).toBe(slide.title);
      expect($('span').text()).toBe(String(NUMBER));
      expect($('textarea').attr('name')).toBe(noteName);
      expect($('textarea').attr('placeholder')).toBe(slide.notePlaceholder);
    });
  });

  describe('optionsMarkup', () => {
    it('fills the Option template once per fragment Option: id, stage, caption, build notes and pick', () => {
      // ARRANGE
      const source = { slug: SLUG, html: FRAGMENT, template: OPTION_TEMPLATE, locked: undefined };
      const expected = { mock: 'Mock 1a', caption: 'A reason.', notes: 'Parts for 1a.' };
      const pick = { name: `pick:${SLUG}`, value: FIRST };
      const optionCount = 2;
      // ACT
      const $ = load(optionsMarkup(source), null, false);
      const first = $(`figure[data-option="${FIRST}"]`);
      // ASSERT
      expect($('figure[data-option]').length).toBe(optionCount);
      expect(first.find('[data-spec="mock"]').text()).toBe(expected.mock);
      expect(first.find('figcaption').text()).toContain(expected.caption);
      expect(first.find('[data-spec="build-notes"]').text()).toBe(expected.notes);
      expect(first.find('input').attr()).toMatchObject(pick);
    });

    it('marks data-recommended true or false and ticks and marks only the locked Option', () => {
      // ARRANGE
      const source = { slug: SLUG, html: FRAGMENT, template: OPTION_TEMPLATE, locked: SECOND };
      const attribute = (id: string, name: string) => $(`[data-option="${id}"]`).attr(name);
      // ACT
      const $ = load(optionsMarkup(source), null, false);
      // ASSERT
      expect(attribute(FIRST, 'data-recommended')).toBe(String(true));
      expect(attribute(SECOND, 'data-recommended')).toBe(String(false));
      expect(attribute(SECOND, 'data-picked')).toBeDefined();
      expect($(`[data-option="${SECOND}"] input`).attr('checked')).toBeDefined();
      expect(attribute(FIRST, 'data-picked')).toBeUndefined();
      expect($(`[data-option="${FIRST}"] input`).attr('checked')).toBeUndefined();
    });

    it('ticks the recommended Option, and marks none picked, when no Option is locked', () => {
      // ARRANGE
      const source = { slug: SLUG, html: FRAGMENT, template: OPTION_TEMPLATE, locked: undefined };
      // ACT
      const $ = load(optionsMarkup(source), null, false);
      const ticked = $('input[checked]')
        .toArray()
        .map((box) => $(box).attr('value'));
      // ASSERT
      expect(ticked).toEqual([FIRST]);
      expect($('[data-picked]').length).toBe(0);
    });
  });
});

describe('failure cases', () => {
  describe('itemMarkup', () => {
    it('throws on a slot of the item template the assembler does not know', () => {
      // ARRANGE
      const template = `${ITEM_TEMPLATE.replace('</article>', '')}<aside data-slot="sidebar"></aside></article>`;
      const message = /names the slot "sidebar"/;
      // ACT
      const fill = () => itemMarkup(SLIDE, template);
      // ASSERT
      expect(fill).toThrow(message);
    });
  });

  describe('optionsMarkup', () => {
    it('throws on a slot of the Option template the assembler does not know', () => {
      // ARRANGE
      const template = OPTION_TEMPLATE.replace('</figure>', '<em data-slot="badge"></em></figure>');
      const source = { slug: SLUG, html: FRAGMENT, template, locked: undefined };
      const message = /names the slot "badge"/;
      // ACT
      const fill = () => optionsMarkup(source);
      // ASSERT
      expect(fill).toThrow(message);
    });
  });
});

describe('edge cases', () => {
  describe('itemMarkup', () => {
    it('gives the Title slide the number 0, no data-number and a note only once it has Options', () => {
      // ARRANGE
      const title: Item = { id: 'top', role: 'title-slide', title: 'Title slide', notePlaceholder: 'Note' };
      // ACT
      const $ = load(itemMarkup(title, ITEM_TEMPLATE), null, false);
      // ASSERT
      expect($('article').attr('data-spec')).toBe(title.role);
      expect($('article').attr('data-number')).toBeUndefined();
      expect($('span').text()).toBe(String(TITLE_NUMBER));
      expect($('textarea').length).toBe(0);
    });
  });

  describe('optionsMarkup', () => {
    it('locks nothing, and ticks the recommended Option, when the locked Option is not in the fragment', () => {
      // ARRANGE
      const source = { slug: SLUG, html: FRAGMENT, template: OPTION_TEMPLATE, locked: 'not-an-option' };
      // ACT
      const $ = load(optionsMarkup(source), null, false);
      // ASSERT
      expect($('[data-picked]').length).toBe(0);
      expect($('input[checked]').attr('value')).toBe(FIRST);
    });

    it('carries a fragment figure attribute the template does not own over to the Option', () => {
      // ARRANGE
      const kept = 'kept';
      const html = `<figure data-spec="option" data-option="1a" data-note="${kept}"><div data-spec="mock">M</div></figure>`;
      const source = { slug: SLUG, html, template: OPTION_TEMPLATE, locked: undefined };
      // ACT
      const $ = load(optionsMarkup(source), null, false);
      // ASSERT
      expect($('figure').attr('data-note')).toBe(kept);
    });
  });
});
