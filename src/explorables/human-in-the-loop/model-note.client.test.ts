import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { UiWords } from './human-in-the-loop.types';
import { ModelNote } from './model-note.client';

const words = {
  model: 'Model: {tier}',
  modelInfo: 'What this model tier means',
  modelHigh: 'High · deep thinking',
  modelHighTip: 'Reasoning.',
} as UiWords;

describe('success cases', () => {
  it('shows the tier beside a `?` button that names it', () => {
    // ARRANGE
    const $ = load(renderToStaticMarkup(createElement(ModelNote, { words, tier: 'high' })));
    // ACT
    const text = $('[data-model-note]').text();
    const name = $('button[data-control="model-info"]').attr('aria-label');
    // ASSERT
    expect(text).toBe('Model: High · deep thinking');
    expect(name).toBe('What this model tier means: Model: High · deep thinking');
  });
});

describe('failure cases', () => {
  it('draws the note of the tier asked for, not of another', () => {
    // ARRANGE
    const $ = load(renderToStaticMarkup(createElement(ModelNote, { words, tier: 'high' })));
    // ACT
    const tier = $('[data-model-note]').attr('data-model-note');
    // ASSERT
    expect(tier).toBe('high');
  });
});

describe('edge cases', () => {
  it('keeps the tooltip closed until the viewer asks for it', () => {
    // ARRANGE
    const $ = load(renderToStaticMarkup(createElement(ModelNote, { words, tier: 'high' })));
    // ACT
    const shown = $('[role="tooltip"]').length;
    // ASSERT
    expect(shown).toBe(0);
  });
});
