import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoadOnClick } from './load-on-click.client';

const props = {
  src: 'https://directpoll.com/r/abc123',
  buttonLabel: 'Show live results',
  hint: 'Loads from directpoll.com only after the click.',
  fallbackNote: 'Results in the second tab',
  newTabHint: 'opens in a new tab',
  title: 'Live results',
};

describe('success cases', () => {
  it('shows the button and the hint before the click', () => {
    // ARRANGE
    const expected = ['Show live results', 'Loads from directpoll.com only after the click.'];
    // ACT
    const html = renderToStaticMarkup(createElement(LoadOnClick, props));
    // ASSERT
    expect(expected.every((text) => html.includes(text))).toBe(true);
  });
});

describe('failure cases', () => {
  it('requests nothing from directpoll before the click: no iframe and no URL in the markup', () => {
    // ARRANGE
    const forbidden = ['<iframe', 'directpoll.com/r/abc123'];
    // ACT
    const html = renderToStaticMarkup(createElement(LoadOnClick, props));
    // ASSERT
    expect(forbidden.filter((text) => html.includes(text))).toEqual([]);
  });
});

describe('edge cases', () => {
  it('keeps the button a plain button that submits nothing', () => {
    // ARRANGE
    const expected = 'type="button"';
    // ACT
    const html = renderToStaticMarkup(createElement(LoadOnClick, props));
    // ASSERT
    expect(html).toContain(expected);
  });
});
