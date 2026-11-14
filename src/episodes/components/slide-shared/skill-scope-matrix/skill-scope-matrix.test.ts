import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SkillScopeMatrix, SkillScopeSquare, type Square, type SquareId } from './skill-scope-matrix';

/*
 * The skill scope matrix of Slide 18, and one square of it cropped out for a later Slide that comes back to it: the
 * same square card, with a locator naming where it sits.
 */

const square = (id: SquareId, care: Square['care']): Square => ({
  id,
  care,
  careLabel: `care ${care} of 4`,
  head: `head ${id}`,
  sub: `sub ${id}`,
  coding: { head: `coding ${id}`, sub: `coding sub ${id}` },
  picture: 'fleet',
  label: { chat: `label ${id}`, coding: `file ${id}` },
});

const axis = (label: string) => ({ label, hint: `${label} hint` });

const crop = (shown: Square) =>
  load(
    renderToStaticMarkup(
      createElement(SkillScopeSquare, {
        back: 'Back to the matrix',
        locator: 'The shared, general square',
        care: 'care',
        axes: { who: 'Shared', where: 'General' },
        square: { ...shown, focus: true },
      }),
    ),
  );

describe('success cases', () => {
  it('crops one square out of the matrix: its card, ringed, and the locator lighting its place', () => {
    // ARRANGE
    const expected = { cards: ['sg'], focus: ['sg'], lit: ['sg'], care: '4', head: 'head sg' };
    // ACT
    const $ = crop(square('sg', 4));
    const ids = (selector: string, attribute: string) =>
      $(selector)
        .toArray()
        .map((element) => $(element).attr(attribute));
    const seen = {
      cards: ids('[data-square]', 'data-square'),
      focus: ids('[data-square][data-focus]', 'data-square'),
      lit: ids('[data-locator][data-focal]', 'data-locator'),
      care: $('[data-square]').attr('data-care'),
      head: $('[data-square] [data-view="chat"]').first().text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a matrix missing one of its four squares', () => {
    // ARRANGE
    const props = {
      label: 'Skill scope matrix',
      care: 'care',
      who: [axis('Personal'), axis('Shared')] as const,
      where: [axis('Project'), axis('General')] as const,
      squares: [square('pp', 1), square('pg', 2), square('sp', 3)],
    };
    const expected = /no square "sg"/;
    // ACT
    const render = () => renderToStaticMarkup(createElement(SkillScopeMatrix, props));
    // ASSERT
    expect(render).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('dims the other three places on the locator, in the matrix’s row order', () => {
    // ARRANGE
    const expected = ['pp', 'pg', 'sp'];
    // ACT
    const $ = crop(square('sg', 4));
    const dimmed = $('[data-locator]:not([data-focal])')
      .toArray()
      .map((cell) => $(cell).attr('data-locator'));
    // ASSERT
    expect(dimmed).toEqual(expected);
  });
});
