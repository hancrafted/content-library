import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ModelNote } from './model-note.client';
import type { ModelWords } from './model-tier.pure';
import type { ModelTier } from './workflow-schema.types';

const words: ModelWords = {
  model: 'Model: {tier}',
  modelInfo: 'What this model tier means',
  modelHigh: 'High · deep thinking',
  modelHighTip: 'Reasoning.',
  modelMedium: 'Medium · everyday',
  modelMediumTip: 'Doing the work.',
  modelLow: 'Low · quick',
  modelLowTip: 'Exploring.',
};
const render = (tier: ModelTier) => load(renderToStaticMarkup(createElement(ModelNote, { words, tier })));

describe('success cases', () => {
  it('shows the tier beside a `?` button that names it', () => {
    // ARRANGE
    const label = 'Model: High · deep thinking';
    const name = `What this model tier means: ${label}`;
    const $ = render('high');
    // ACT
    const text = $('[data-model-note]').text();
    const ariaLabel = $('button[data-control="model-info"]').attr('aria-label');
    // ASSERT
    expect(text).toBe(label);
    expect(ariaLabel).toBe(name);
  });
});

describe('failure cases', () => {
  it('draws nothing for a tier outside high, medium and low, which the loader never lets through', () => {
    // ARRANGE
    const unknown = 'ultra' as ModelTier;
    // ACT
    const draw = () => render(unknown);
    // ASSERT
    expect(draw).toThrow(TypeError);
  });
});

describe('edge cases', () => {
  it('keeps the tooltip closed until the viewer asks for it', () => {
    // ARRANGE
    const none = 0;
    const $ = render('low');
    // ACT
    const shown = $('[role="tooltip"]').length;
    // ASSERT
    expect(shown).toBe(none);
  });
});
