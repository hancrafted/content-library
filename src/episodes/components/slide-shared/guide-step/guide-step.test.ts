import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DoneStrip, MoreHelp } from './guide-step';

/* The step frame's two pieces as the static export renders them: the result strip and the closed help. */

describe('success cases', () => {
  it('renders the done strip with its label and result', () => {
    // ARRANGE
    const expected = { label: 'Done looks like', result: 'The prompt comes back.' };
    // ACT
    const $ = load(
      renderToStaticMarkup(createElement(DoneStrip, { label: expected.label, children: expected.result })),
    );
    const found = { label: $('[data-done-strip] p').text(), result: $('[data-done-strip] div').text() };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('renders the help closed, with its title as the summary', () => {
    // ARRANGE
    const title = 'What might happen';
    // ACT
    const $ = load(renderToStaticMarkup(createElement(MoreHelp, { title, children: 'Body' })));
    const found = { summary: $('summary').text(), open: $('details').attr('open') };
    // ASSERT
    expect(found).toEqual({ summary: title, open: undefined });
  });
});

describe('failure cases', () => {
  it('keeps the help body in the markup though it is closed, so print and search still reach it', () => {
    // ARRANGE
    const body = 'Red text? Press Help.';
    // ACT
    const $ = load(renderToStaticMarkup(createElement(MoreHelp, { title: 'More', children: body })));
    // ASSERT
    expect($('details').text()).toContain(body);
  });
});

describe('edge cases', () => {
  it('renders the done strip without a result body', () => {
    // ARRANGE
    const label = 'Done looks like';
    // ACT
    const $ = load(renderToStaticMarkup(createElement(DoneStrip, { label, children: null })));
    // ASSERT
    expect($('[data-done-strip] p').text()).toBe(label);
  });
});
