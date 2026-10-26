import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { UiWords } from './human-in-the-loop.types';
import type { TeachingProps } from './progress-controls.types';
import { ResetConfirm } from './teaching-controls.client';

const words = {
  resetConfirm: 'Reset?',
  resetDownload: 'Download progress',
  resetNow: 'Reset now',
  resetCancel: 'Cancel',
};
const noop = () => undefined;
const teaching = { show: true, resetShow: true, on: true, locked: true, hasWork: true };
const render = (over: Partial<TeachingProps>, confirming = true) =>
  load(
    renderToStaticMarkup(
      createElement(ResetConfirm, {
        words: words as UiWords,
        teaching,
        onTeaching: noop,
        onReset: noop,
        confirming,
        onConfirming: noop,
        ...over,
      }),
    ),
  );

describe('success cases', () => {
  it('offers the download of the run, then Reset now and Cancel, while confirming', () => {
    // ARRANGE
    const $ = render({ onDownloadRun: noop });
    // ACT
    const buttons = $('button')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(buttons).toEqual(['Download progress', 'Reset now', 'Cancel']);
  });
});

describe('failure cases', () => {
  it('offers no download where the run cannot be saved to a file, as for an uploaded Workflow', () => {
    // ARRANGE
    const $ = render({ onDownloadRun: undefined });
    // ACT
    const buttons = $('button')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(buttons).toEqual(['Reset now', 'Cancel']);
  });
});

describe('edge cases', () => {
  it('draws nothing while not confirming, or where the Preset hides Reset', () => {
    // ARRANGE
    const idle = render({ onDownloadRun: noop }, false);
    const hidden = render({ onDownloadRun: noop, teaching: { ...teaching, resetShow: false } });
    // ACT
    const drawn = [idle('[data-reset-confirm]').length, hidden('[data-reset-confirm]').length];
    // ASSERT
    expect(drawn).toEqual([0, 0]);
  });
});
