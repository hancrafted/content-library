import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ComparePanel } from './compare-panel';

const render = (props: Omit<Parameters<typeof ComparePanel>[0], 'children'>) =>
  load(renderToStaticMarkup(createElement(ComparePanel, { ...props, children: createElement('i', null, 'bars') })));

describe('success cases', () => {
  it('draws the after panel lit, its title beside the marker it is given', () => {
    // ARRANGE
    const expected = { title: 'A workflow', marker: 1, lit: true };
    // ACT
    const $ = render({ title: 'A workflow', tone: 'after', marker: createElement('button', { type: 'button' }) });
    const panel = $('body > div');
    const shown = {
      title: panel.children('p').first().children('span').text(),
      marker: panel.find('button').length,
      lit: panel.hasClass('border-primary'),
    };
    // ASSERT
    expect(shown).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('draws the before panel muted and unlit', () => {
    // ARRANGE
    const expected = { muted: true, lit: false };
    // ACT
    const panel = render({ title: 'One chat for everything', tone: 'before' })('body > div');
    const shown = { muted: panel.hasClass('bg-muted'), lit: panel.hasClass('border-primary') };
    // ASSERT
    expect(shown).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps its content right under the title, the title first', () => {
    // ARRANGE
    const expected = { title: 'One chat for everything', content: 'bars' };
    // ACT
    const panel = render({ title: 'One chat for everything', tone: 'before' })('body > div');
    const shown = { title: panel.children().eq(0).text(), content: panel.children().eq(1).text() };
    // ASSERT
    expect(shown).toEqual(expected);
  });
});
