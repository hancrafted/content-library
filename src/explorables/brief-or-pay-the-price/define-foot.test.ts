import { load } from 'cheerio';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { explorableData } from './brief-or-pay-the-price-data';
import type { ViewId } from './brief-or-pay-the-price.types';
import { start, step } from './explorable-state.pure';
import type { LevelActions } from './level-actions';
import { LEVEL } from './levels.client';

const none = () => undefined;
const ACTIONS: LevelActions = {
  onShowAll: none,
  onReset: none,
  onWorkflow: none,
  onCloseCell: none,
  onCell: none,
  onNode: none,
  onStep: none,
  onPlay: none,
  onTick: none,
};

const resetLabel = (locale: 'en' | 'de', view: ViewId) => {
  const data = explorableData(locale);
  const state = step(start({ price: 5, brief: 5, brace: 5, 'stages:drive': 5 }, 'drive'), { type: 'view', view });
  const props = {
    data,
    state,
    actions: ACTIONS,
    handlers: { onOpen: none, onLeave: none, onTurn: none },
    matrixHandlers: { onLight: none, onUnlight: none, onOpenCell: none },
    labels: { backs: data.words.backs, turn: data.words.chrome.turn },
  };
  return load(renderToStaticMarkup(LEVEL.define(props)))('[data-reset]').text();
};

describe('success cases', () => {
  it('says "Reset to day one" on PRICE, in en and de', () => {
    // ARRANGE
    const seen = { en: resetLabel('en', 'price'), de: resetLabel('de', 'price') };
    // ACT
    // ASSERT
    expect(seen).toEqual({ en: 'Reset to day one', de: 'Zurück auf Tag eins' });
  });
});

describe('failure cases', () => {
  it.each(['brief', 'stages', 'brace'] as const)('says only "Reset" on %s, "Zurücksetzen" in de', (view) => {
    // ARRANGE
    const seen = [resetLabel('en', view), resetLabel('de', view)];
    // ACT
    // ASSERT
    expect(seen).toEqual(['Reset', 'Zurücksetzen']);
  });
});

describe('edge cases', () => {
  it('draws one reset button on every Definition tab', () => {
    // ARRANGE
    const views = ['price', 'brief', 'stages', 'brace'] as const;
    // ACT
    const labels = views.map((view) => resetLabel('en', view));
    // ASSERT
    expect(labels.every((label) => label !== '')).toBe(true);
  });
});
