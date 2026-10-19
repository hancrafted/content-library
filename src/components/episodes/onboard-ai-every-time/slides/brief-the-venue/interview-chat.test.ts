import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InterviewChat, type InterviewChatCopy } from './interview-chat.client';

const COPY: InterviewChatCopy = {
  open: 'See the chat',
  title: 'Interview · the worked chat',
  close: 'Close the chat',
  forgotten: 'The one you forgot',
  ai: 'AI',
  you: 'You',
  turns: ['Q1?', 'A1.', 'Q2?', 'A2.', 'Q3?', 'A3.'],
};

function render(): string {
  return renderToStaticMarkup(createElement(InterviewChat, { copy: COPY }));
}

describe('success cases', () => {
  it('opens a native dialog from a button, so the chat sits in the top layer above the chrome', () => {
    // ARRANGE
    const expected = ['aria-haspopup="dialog"', '<dialog'];
    // ACT
    const html = render();
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
  });

  it('lists the six turns in order, the AI asking and you answering', () => {
    // ARRANGE
    const expected = ['ai', 'you', 'ai', 'you', 'ai', 'you'];
    // ACT
    const speakers = [...render().matchAll(/data-speaker="(\w+)"/g)].map((match) => match[1]);
    // ASSERT
    expect(speakers).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('takes no z-index, since a Slide wrapper is isolated and would trap one under the chrome (FE-009 section 8)', () => {
    // ARRANGE
    const zIndex = /\bz-(\d|\[)/;
    // ACT
    const html = render();
    // ASSERT
    expect(html).not.toMatch(zIndex);
  });
});

describe('edge cases', () => {
  it('labels only the last question as the one you forgot, and names its speaker for a screen reader', () => {
    // ARRANGE
    const expected = [`${COPY.forgotten}${COPY.ai}: Q3?`];
    // ACT
    const forgotten = [...render().matchAll(/data-forgotten="true"[^>]*>(.*?)<\/li>/g)].map((match) =>
      match[1].replace(/<[^>]+>/g, ''),
    );
    // ASSERT
    expect(forgotten).toEqual(expected);
  });
});
