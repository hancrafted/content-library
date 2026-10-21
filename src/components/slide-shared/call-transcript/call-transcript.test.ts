import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CallTranscript, callBubbleClass, type CallLine } from './call-transcript';

const LINES: readonly CallLine[] = [
  { who: 'you', text: 'Party for 40 on 27 June.', light: 'lit' },
  { who: 'sister', text: 'Budget?', light: 'faded' },
  { who: 'you', text: 'Pepper is allergic to nuts.', light: 'standout' },
  { who: 'ai', text: 'Noted.', light: 'lit' },
  { who: 'tool', text: 'Searched the web', light: 'faded' },
];

const render = (lines: readonly CallLine[], size?: 'md' | 'sm') =>
  load(renderToStaticMarkup(createElement(CallTranscript, { lines, label: 'Phone call', size })));
const classes = (value: string | undefined) => (value ?? '').split(/\s+/);

describe('success cases', () => {
  it('renders the call as an ordered list, one item per line in order, with who and light', () => {
    // ARRANGE
    const expected = {
      label: 'Phone call',
      items: LINES.map((line, i) => [line.who, line.light, String(i), line.text]),
    };
    // ACT
    const $ = render(LINES);
    const items = $('ol > li')
      .map((_, el) => [[$(el).attr('data-who'), $(el).attr('data-light'), $(el).attr('data-index'), $(el).text()]])
      .get();
    // ASSERT
    expect($('ol').attr('aria-label')).toBe(expected.label);
    expect(items).toEqual(expected.items);
  });

  it('puts your messages right, the sister left in a card, the standout in a primary ring', () => {
    // ARRANGE
    const expected = { you: 'self-end', sister: 'bg-card', standout: 'ring-primary' };
    // ACT
    const you = classes(callBubbleClass('you', 'lit'));
    const sister = classes(callBubbleClass('sister', 'lit'));
    const standout = classes(callBubbleClass('you', 'standout'));
    // ASSERT
    expect(you).toContain(expected.you);
    expect(sister).toContain(expected.sister);
    expect(standout).toContain(expected.standout);
  });
});

describe('failure cases', () => {
  it('renders an empty call as an empty list, not an error', () => {
    // ARRANGE
    const lines: readonly CallLine[] = [];
    // ACT
    const $ = render(lines);
    // ASSERT
    expect($('ol')).toHaveLength(1);
    expect($('li')).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('fades a line to 40% and your faded bubble to the lighter grey', () => {
    // ARRANGE
    const expected = { opacity: 'opacity-40', fill: 'bg-foreground/5', lit: 'bg-foreground/10' };
    // ACT
    const faded = classes(callBubbleClass('you', 'faded'));
    // ASSERT
    expect(faded).toContain(expected.opacity);
    expect(faded).toContain(expected.fill);
    expect(faded).not.toContain(expected.lit);
  });

  it('sets the small size in caption type with the tighter gap', () => {
    // ARRANGE
    const expected = { text: 'text-caption', gap: 'gap-1.5' };
    // ACT
    const $ = render(LINES, 'sm');
    // ASSERT
    expect(classes($('li').first().attr('class'))).toContain(expected.text);
    expect(classes($('ol').attr('class'))).toContain(expected.gap);
  });
});
