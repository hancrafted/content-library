import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InterviewChat, type InterviewChatCopy } from './interview-chat.client';

const GRILLING = 'https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling';
const TO_SPEC = 'https://github.com/mattpocock/skills/tree/main/skills/engineering/to-spec';

const COPY: InterviewChatCopy = {
  sparkle: null,
  open: 'See the chat',
  title: 'Interview · the worked chat',
  close: 'Close the chat',
  forgotten: 'The one you forgot',
  ai: 'AI',
  you: 'You',
  recommended: 'Recommended:',
  newTab: '(opens in a new tab)',
  turns: [
    { slug: 'start', speaker: 'you', text: 'Plan the party.', skill: { command: '/grilling', url: GRILLING } },
    { slug: 'q1', speaker: 'ai', text: 'Q1 One venue?', options: ['A) One', 'B) Five'], recommended: 'A' },
    { slug: 'a1', speaker: 'you', text: 'A.' },
    { slug: 'q2', speaker: 'ai', text: 'Q2 Peak or dwell?', options: ['A) Peak', 'B) Dwell'], recommended: 'A' },
    { slug: 'reframe', speaker: 'you', text: 'Explain it with an analogy?' },
    { slug: 'q3', speaker: 'ai', text: 'Q3 Last year?', forgotten: true },
    { slug: 'spec', speaker: 'you', text: 'Write the spec.', skill: { command: '/to-spec', url: TO_SPEC } },
  ],
};

function render(copy: InterviewChatCopy = COPY): string {
  return renderToStaticMarkup(createElement(InterviewChat, { copy }));
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

  it('lists the turns in order, each with its speaker', () => {
    // ARRANGE
    const expected = ['you', 'ai', 'you', 'ai', 'you', 'ai', 'you'];
    // ACT
    const speakers = [...render().matchAll(/data-speaker="(\w+)"/g)].map((match) => match[1]);
    // ASSERT
    expect(speakers).toEqual(expected);
  });

  it('links each skill command to its source in a new tab, and says so to a screen reader', () => {
    // ARRANGE
    const expected = [
      `<a href="${GRILLING}" target="_blank" rel="noopener noreferrer"`,
      `<a href="${TO_SPEC}" target="_blank" rel="noopener noreferrer"`,
    ];
    const label = `<span class="sr-only"> ${COPY.newTab}</span>`;
    // ACT
    const html = render();
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
    expect(html.split(label)).toHaveLength(expected.length + 1);
  });

  it("lists a question's two options and its recommendation", () => {
    // ARRANGE
    const expected = ['<li>A) One</li><li>B) Five</li>', `${COPY.recommended}</span> A`];
    // ACT
    const html = render();
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
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

  it('draws no options or recommendation for a turn that has none', () => {
    // ARRANGE
    const plain: InterviewChatCopy = { ...COPY, turns: [{ slug: 'a1', speaker: 'you', text: 'A.' }] };
    // ACT
    const html = render(plain);
    // ASSERT
    expect(html).not.toContain(COPY.recommended);
  });
});

describe('edge cases', () => {
  it('labels only the forgotten question, and names its speaker for a screen reader', () => {
    // ARRANGE
    const expected = [`${COPY.forgotten}${COPY.ai}: Q3 Last year?`];
    // ACT
    const forgotten = [...render().matchAll(/data-forgotten="true"[^>]*>(.*?)<\/li>/g)].map((match) =>
      match[1].replace(/<[^>]+>/g, ''),
    );
    // ASSERT
    expect(forgotten).toEqual(expected);
  });

  it('scrolls inside the dialog, so a long chat never runs past the viewport', () => {
    // ARRANGE
    const scroller = 'overflow-y-auto';
    // ACT
    const html = render();
    // ASSERT
    expect(html).toContain(scroller);
  });
});
