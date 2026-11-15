import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { UiWords } from './human-in-the-loop.types';
import { EditToggle, PromptEditor } from './prompt-editor.client';

const words = { editPrompt: 'Edit prompt', editReset: 'Reset to default', close: 'Close' } as UiWords;
const noop = () => undefined;
const editor = (edited: boolean) =>
  load(
    renderToStaticMarkup(
      createElement(PromptEditor, {
        words,
        text: '## Role',
        edited,
        onText: noop,
        onReset: noop,
        onClose: noop,
      }),
    ),
  );

describe('success cases', () => {
  it('shows the prompt in a textarea under Reset and Close', () => {
    // ARRANGE
    const $ = editor(true);
    // ACT
    const buttons = $('button')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(buttons).toEqual(['Reset to default', 'Close']);
    expect($('textarea').text()).toBe('## Role');
  });

  it('draws the pencil as a pressed toggle named Edit prompt while the editor is open', () => {
    // ARRANGE
    const html = renderToStaticMarkup(createElement(EditToggle, { words, open: true, onToggle: noop }));
    // ACT
    const $ = load(html);
    // ASSERT
    expect($('button').attr('aria-label')).toBe('Edit prompt');
    expect($('button').attr('aria-pressed')).toBe('true');
  });
});

describe('failure cases', () => {
  it('disables Reset while there is no edit', () => {
    // ARRANGE
    const $ = editor(false);
    // ACT
    const disabled = $('[data-control="edit-reset"]').attr('disabled');
    // ASSERT
    expect(disabled).toBeDefined();
  });
});

describe('edge cases', () => {
  it('shows Close even while there is no edit', () => {
    // ARRANGE
    const $ = editor(false);
    // ACT
    const close = $('[data-control="edit-close"]').attr('disabled');
    // ASSERT
    expect(close).toBeUndefined();
  });
});
