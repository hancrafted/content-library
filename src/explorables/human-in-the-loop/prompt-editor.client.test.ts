import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ExplainButton } from './explain-button.client';
import type { UiWords } from './human-in-the-loop.types';
import { CopyPrompt, EditToggle, PromptEditor } from './prompt-editor.client';
import type { StepKit } from './step-kit.types';

const words = {
  editPrompt: 'Edit prompt',
  editReset: 'Reset to default',
  close: 'Close',
  copyPrompt: 'Copy prompt',
  copied: 'Copied',
  copyExplanation: 'Copy explanation prompt',
  copyExplanationTip: 'Explains the prompt.',
  typeFirst: 'Type your notes first',
} as UiWords;
const copyPrompt = (blocked: boolean) =>
  load(
    renderToStaticMarkup(
      createElement(CopyPrompt, { words, edited: false, lead: false, blocked, onCopy: () => Promise.resolve(true) }),
    ),
  );
const explain = (blocked: boolean) =>
  load(
    renderToStaticMarkup(
      createElement(ExplainButton, { kit: { words } as StepKit, blocked, onCopy: () => Promise.resolve(true) }),
    ),
  );
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

  it('keeps Copy prompt and Copy explanation prompt enabled while no blank field waits for text', () => {
    // ARRANGE
    const open = [copyPrompt(false), explain(false)];
    // ACT
    const disabled = open.map(($) => $('button').attr('disabled'));
    // ASSERT
    expect(disabled).toEqual([undefined, undefined]);
  });
});

describe('failure cases', () => {
  it('disables Copy prompt and says why, so no raw marker is copied', () => {
    // ARRANGE
    const $ = copyPrompt(true);
    // ACT
    const button = $('button');
    const reason = $(`#${button.attr('aria-describedby')}`).text();
    // ASSERT
    expect(button.attr('disabled')).toBeDefined();
    expect(reason).toBe('Type your notes first');
  });

  it('disables Copy explanation prompt and says why', () => {
    // ARRANGE
    const $ = explain(true);
    // ACT
    const button = $('button');
    const reason = $(`#${button.attr('aria-describedby')}`).text();
    // ASSERT
    expect(button.attr('disabled')).toBeDefined();
    expect(reason).toBe('Type your notes first');
  });

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
