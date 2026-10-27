import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PresetReadme, type PresetReadmeProps } from './preset-readme';

const PROPS: PresetReadmeProps = {
  heading: 'Read me',
  preset: 'slide-5',
  items: [
    { label: 'Shows', text: 'The window as a bar.' },
    { label: 'Try', text: 'Switch to 1M.' },
    { label: 'Notice', text: 'No line is crossed.' },
  ],
};

const render = (props: PresetReadmeProps) => load(renderToStaticMarkup(createElement(PresetReadme, props)));

describe('success cases', () => {
  it('reads as a labelled region: heading, Preset id, then each item as a term and its text in order', () => {
    // ARRANGE
    const expected = [
      ['Shows', 'The window as a bar.'],
      ['Try', 'Switch to 1M.'],
      ['Notice', 'No line is crossed.'],
    ];
    // ACT
    const $ = render(PROPS);
    const heading = $('section h4');
    const rows = $('dl > div')
      .map((_, el) => [[$(el).find('dt').text(), $(el).find('dd').text()]])
      .get();
    // ASSERT
    expect($('section').attr('aria-labelledby')).toBe(heading.attr('id'));
    expect(heading.text()).toBe('Read me');
    expect($('code').text()).toBe('slide-5');
    expect(rows).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('renders no rows, and still names its region, when a Slide hands it no items', () => {
    // ARRANGE
    const props = { ...PROPS, items: [] };
    // ACT
    const $ = render(props);
    // ASSERT
    expect($('dl > div')).toHaveLength(0);
    expect($('h4').text()).toBe('Read me');
  });
});

describe('edge cases', () => {
  it('omits the Preset id when the Slide names none', () => {
    // ARRANGE
    const props = { ...PROPS, preset: undefined };
    // ACT
    const $ = render(props);
    // ASSERT
    expect($('code')).toHaveLength(0);
  });
});
