import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CheckedBox } from './checked-box.client';

const render = (values: Record<string, string>) =>
  load(
    renderToStaticMarkup(
      createElement(CheckedBox, {
        name: 'a.b.checked',
        label: 'I checked this result',
        slots: { values, onChange: vi.fn() },
      }),
    ),
  );

describe('success cases', () => {
  it('shows a ticked box under its label once the key holds text', () => {
    // ARRANGE
    const $ = render({ 'a.b.checked': 'checked' });
    // ACT
    const box = $('input[type="checkbox"]');
    // ASSERT
    expect(box.attr('checked')).toBeDefined();
    expect($('label').text()).toBe('I checked this result');
  });
});

describe('failure cases', () => {
  it('shows an empty box while the key holds nothing', () => {
    // ARRANGE
    const $ = render({});
    // ACT
    const box = $('input[type="checkbox"]');
    // ASSERT
    expect(box.attr('checked')).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('treats a key holding only blanks as not checked', () => {
    // ARRANGE
    const $ = render({ 'a.b.checked': '  ' });
    // ACT
    const box = $('input[type="checkbox"]');
    // ASSERT
    expect(box.attr('checked')).toBeUndefined();
  });
});
