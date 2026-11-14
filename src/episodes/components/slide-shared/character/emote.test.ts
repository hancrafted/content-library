import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { EmoteProps } from './actor';
import { Emote } from './emote';

/*
 * The emote every actor shows at its head anchor: one cartoon mark per mood, and a speech bubble for `says`. A figure
 * passes its own anchor, so the mark and the bubble follow the head in every pose.
 */

const emote = (props: EmoteProps) => {
  const $ = load(renderToStaticMarkup(createElement('svg', null, createElement(Emote, props))));
  return {
    marks: $('[data-emote-mark]')
      .toArray()
      .map((mark) => $(mark).attr('data-emote-mark')),
    transform: $('[data-emote]').attr('transform'),
    bubble: $('[data-says]').text(),
    bubbleCount: $('[data-says]').length,
    lineBreaks: $('[data-says] br').length,
    bubbleAt: $('[data-says-bubble] > g').attr('transform'),
    bubbleScaled: $('[data-says-bubble] > g > g').attr('class'),
    motions: $('[data-motion]')
      .toArray()
      .map((part) => $(part).attr('data-motion')),
    $,
  };
};

describe('success cases', () => {
  it('draws the mark of each mood: a question, an exclamation, a sparkle, a thought with dots, an empty thought', () => {
    // ARRANGE
    const at = { x: 0, y: 0 };
    const expected = ['question', 'exclamation', 'sparkle', 'thought-dots', 'thought-empty'];
    // ACT
    const marks = (['confused', 'surprised', 'happy', 'thinking', 'blank'] as const).flatMap(
      (mood) => emote({ mood, at }).marks,
    );
    // ASSERT
    expect(marks).toEqual(expected);
  });

  it('places the emote at the head anchor it is given', () => {
    // ARRANGE
    const at = { x: 12, y: -106 };
    const expected = 'translate(12 -106)';
    // ACT
    const { transform } = emote({ mood: 'happy', at });
    // ASSERT
    expect(transform).toBe(expected);
  });

  it('wraps what the actor says inside one bubble, as text, with no hard line breaks', () => {
    // ARRANGE
    const says = 'Why do I explain the same dive every morning?';
    // ACT
    const { bubble, lineBreaks } = emote({ says, at: { x: 0, y: 0 } });
    // ASSERT
    expect({ bubble, lineBreaks }).toEqual({ bubble: says, lineBreaks: 0 });
  });

  it('marks the mark and the bubble as emote motion, so the Scene can tell when each pop has ended', () => {
    // ARRANGE
    const props = { mood: 'surprised', says: 'A whale!', at: { x: 0, y: 0 } } as const;
    const expected = ['emote', 'emote'];
    // ACT
    const { motions } = emote(props);
    // ASSERT
    expect(motions).toEqual(expected);
  });

  it('keeps a facing-left bubble off the back of the head: it rises on the left', () => {
    // ARRANGE
    const props = { says: 'Same as yesterday?', at: { x: 0, y: 0 }, facing: 'left' } as const;
    const expected = 'translate(-10 -14)';
    // ACT
    const { bubbleAt } = emote(props);
    // ASSERT
    expect(bubbleAt).toBe(expected);
  });

  it('draws the words at the figure scale a Scene can turn down with --says-scale, so a close-up keeps its bubble', () => {
    // ARRANGE
    const props = { says: 'Nice to meet you.', at: { x: 0, y: 0 } };
    const expected = 'saysScale';
    // ACT
    const { bubbleScaled } = emote(props);
    // ASSERT
    expect(bubbleScaled).toContain(expected);
  });
});

describe('failure cases', () => {
  it('draws nothing when the actor has neither a mood nor words', () => {
    // ARRANGE
    const props = { at: { x: 0, y: 0 } };
    // ACT
    const { marks, bubbleCount, transform } = emote(props);
    // ASSERT
    expect({ marks, bubbleCount, transform }).toEqual({ marks: [], bubbleCount: 0, transform: undefined });
  });
});

describe('edge cases', () => {
  it('shows a thought and words together, the bubble past the thought cloud so they never overlap', () => {
    // ARRANGE
    const props = { mood: 'thinking', says: 'Hm.', at: { x: 0, y: 0 } } as const;
    const expected = { marks: ['thought-dots'], bubbleCount: 1, bubbleAt: 'translate(34 -6)' };
    // ACT
    const { marks, bubbleCount, bubbleAt } = emote(props);
    // ASSERT
    expect({ marks, bubbleCount, bubbleAt }).toEqual(expected);
  });

  it('treats blank words as no words, so no empty bubble pops in', () => {
    // ARRANGE
    const props = { says: '   ', at: { x: 0, y: 0 } };
    // ACT
    const { bubbleCount } = emote(props);
    // ASSERT
    expect(bubbleCount).toBe(0);
  });
});
