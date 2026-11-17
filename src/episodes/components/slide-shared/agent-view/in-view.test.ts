import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InView } from './in-view';

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
describe('success cases', () => {
  it('marks words that belong to one view, so the switch shows only that view', () => {
    // ARRANGE
    const expected = { chat: 'chat', coding: 'coding' };
    // ACT
    const $ = load(
      renderToStaticMarkup(
        createElement(
          'div',
          null,
          createElement(InView, { view: 'chat', as: 'p', children: 'A procedure card' }),
          createElement(InView, { view: 'coding', as: 'p', children: 'SKILL.md' }),
        ),
      ),
    );
    const seen = {
      chat: $('p').first().attr('data-view'),
      coding: $('p').last().attr('data-view'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never drops the coding-agent words from the static page, so print and find-in-page still reach them', () => {
    // ARRANGE
    const expected = { text: 'SKILL.md', hiddenAttribute: undefined };
    // ACT
    const $ = load(renderToStaticMarkup(createElement(InView, { view: 'coding', as: 'p', children: 'SKILL.md' })));
    const seen = { text: $('p').text(), hiddenAttribute: $('p').attr('hidden') };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps inline view alternatives inside a surrounding sentence', () => {
    // ARRANGE
    const expected = { text: 'Read the cardSKILL.md.', blocks: 0 };
    // ACT
    const $ = load(
      renderToStaticMarkup(
        createElement(
          'p',
          null,
          'Read ',
          createElement(InView, { view: 'chat', children: 'the card' }),
          createElement(InView, { view: 'coding', children: 'SKILL.md' }),
          '.',
        ),
      ),
    );
    const seen = { text: $('p').text(), blocks: $('p div').length };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
