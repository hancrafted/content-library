import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GuideHelp, type HelpWords } from './guide-help';

/*
 * A Slide's Help as the static export renders it: the button, and the panel closed until it is pressed. The prompt
 * wrapping is `help-prompt.pure.ts`'s; opening and copying need a browser.
 */

const WORDS: HelpWords = {
  button: 'Help',
  label: 'Your question, or the error you see',
  placeholder: 'Paste your error…',
  copy: 'Copy prompt',
  copied: 'Prompt copied',
  prompt: 'Computer: {os}. AI agent: {agent}. Step: {step}. {error}',
  noError: '(nothing pasted)',
  chats: { openAIChats: 'Open an AI chat', openAIChatTip: 'Open an empty {chat} chat', newTab: 'opens in a new tab' },
};

const help = () => load(renderToStaticMarkup(createElement(GuideHelp, { step: 'Step 3: Install', words: WORDS })));

describe('success cases', () => {
  it('shows a Help button that controls the panel and starts collapsed', () => {
    // ARRANGE
    const $ = help();
    const panelId = $('[data-help-panel]').attr('id');
    const expected = { text: 'Help', expanded: 'false', controls: panelId };
    // ACT
    const button = $('[data-help-button]');
    const found = {
      text: button.text(),
      expanded: button.attr('aria-expanded'),
      controls: button.attr('aria-controls'),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('puts a field, Copy prompt and the ChatGPT and Gemini buttons in the panel', () => {
    // ARRANGE
    const expected = { fields: 1, copy: 'Copy prompt', chats: ['ChatGPT', 'Gemini'] };
    // ACT
    const $ = help();
    const found = {
      fields: $('[data-help-panel] textarea').length,
      copy: $('[data-help-panel] [data-copied]').attr('aria-label'),
      chats: $('[data-help-panel] a[data-chat]')
        .map((_, link) => $(link).attr('data-chat'))
        .get(),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps the panel hidden until the button is pressed, so the Scene is not pushed down on load', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const hidden = help()('[data-help-panel]').attr('hidden') !== undefined;
    // ASSERT
    expect(hidden).toBe(expected);
  });
});

describe('edge cases', () => {
  it('names the field for assistive tech with its own label, not the placeholder', () => {
    // ARRANGE
    const expected = 'Your question, or the error you see';
    // ACT
    const $ = help();
    const label = $(`label[for="${$('[data-help-panel] textarea').attr('id')}"]`).text();
    // ASSERT
    expect(label).toBe(expected);
  });
});
