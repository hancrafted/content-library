import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HandoffCard } from './handoff-card';

const render = (text: Parameters<typeof HandoffCard>[0]['text']) =>
  load(renderToStaticMarkup(createElement(HandoffCard, { title: 'Handoff card', text })));

describe('success cases', () => {
  it('shows its title above the text it carries into the next chat', () => {
    // ARRANGE
    const expected = ['Handoff card', 'Party for 200. Next: invitations.'];
    // ACT
    const $ = render('Party for 200. Next: invitations.');
    const lines = $('[data-handoff] p')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(lines).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('holds nothing focusable, since its motion mounts it afresh on every replay', () => {
    // ARRANGE
    const focusable = 'a, button, input, [tabindex]';
    // ACT
    const $ = render('Party for 200.');
    // ASSERT
    expect($(focusable)).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('keeps the rich text a Slide hands it, so the budget keeps its tint', () => {
    // ARRANGE
    const expected = 'budget 30,000 €';
    // ACT
    const $ = render(createElement('span', { 'data-budget': '' }, expected));
    // ASSERT
    expect($('[data-handoff] [data-budget]').text()).toBe(expected);
  });
});
