import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InView } from './in-view';
import { ViewToggle } from './view-toggle';

/*
 * The page-level Chat app / Coding agent switch (design-ADR 0025, Interaction 1): one switch the whole Episode page
 * follows, Chat app first. The view is transient, held in memory (FE-001 §1.3, Han's decision), so a reload opens
 * in Chat app again.
 */

const LABELS = { label: 'View', chat: 'Chat app', coding: 'Coding agent' };

describe('success cases', () => {
  it('offers the two views as a pressed pair, Chat app pressed in the static page', () => {
    // ARRANGE
    const expected = [
      { name: 'Chat app', pressed: 'true' },
      { name: 'Coding agent', pressed: 'false' },
    ];
    // ACT
    const $ = load(renderToStaticMarkup(createElement(ViewToggle, { labels: LABELS })));
    const buttons = $('[data-view-toggle] button')
      .toArray()
      .map((button) => ({ name: $(button).text(), pressed: $(button).attr('aria-pressed') }));
    // ASSERT
    expect(buttons).toEqual(expected);
  });

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
  it('names the pair for assistive tech as one group', () => {
    // ARRANGE
    const expected = { role: 'group', name: 'View' };
    // ACT
    const $ = load(renderToStaticMarkup(createElement(ViewToggle, { labels: LABELS })));
    const seen = { role: $('[data-view-toggle]').attr('role'), name: $('[data-view-toggle]').attr('aria-label') };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
