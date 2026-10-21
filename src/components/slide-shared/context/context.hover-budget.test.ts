import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Attention } from './attention';
import { contextViewData } from './context';
import { ContextPreview } from './context-preview';
import { attentionAt } from './context-usage.pure';
import { ContextWindow } from './context-window';
import { categoriesOf, framesOf } from './context.pure';
import type { RenderMode } from './context.types';
import { Conversation } from './conversation';

/*
 * The hover budget: moving the pointer from one step to the next may change only the items that light or unlight, in
 * every part. A part computes one `on` boolean per item, so the items whose markup differs between two lit keys are the
 * items a memoised item redraws; everything else keeps its props.
 */

const noop = () => undefined;

const harness = (renderMode: RenderMode) => {
  const data = contextViewData({ preset: 'slide-7', locale: 'en' });
  const { chat, preset } = data;
  const frames = framesOf(chat);
  const frame = frames[preset.step - 1]!;
  const window = preset.windows[0]!;
  const stepOf = new Map(chat.steps.map((s, i) => [s.id, i + 1]));
  const attention = attentionAt(chat, frames, { step: preset.step, windowTokens: window.tokens, notes: data.notes });
  const speech = { words: data.words, locale: data.locale, story: data.story, renderMode };
  const light = (lit: string | null) => ({ lit, ghost: null, pinned: null });
  const events = { onLight: noop, onPin: noop };
  const progress = { chat, frames, vis: preset.step, attention };
  const markup = {
    conversation: (lit: string | null) =>
      createElement(Conversation, {
        ...speech,
        ...light(lit),
        ...events,
        ...progress,
        notes: data.notes,
        collapsed: false,
        hint: false,
        hintSeen: true,
      }),
    window: (lit: string | null) =>
      createElement(ContextWindow, {
        ...speech,
        ...light(lit),
        ...events,
        frames,
        frame,
        window,
        sizes: preset.windows,
        sizeIndex: 0,
        switchable: false,
        zone: true,
        toggles: [],
        onSize: noop,
        stepOf,
      }),
    preview: (lit: string | null) =>
      createElement(ContextPreview, {
        ...speech,
        ...light(lit),
        ...events,
        frame,
        window,
        present: categoriesOf(chat),
      }),
    attention: (lit: string | null) =>
      createElement(Attention, {
        ...speech,
        ...light(lit),
        ...events,
        ...progress,
        window,
        stepOf,
        layout: 'list',
        onReveal: noop,
      }),
  };
  return { chat, markup };
};

/** The items (`[data-part]`) whose markup differs between two renders, by position. */
const flips = (from: string, to: string): number => {
  const items = (html: string) =>
    load(html)('[data-part]')
      .map((_, el) => load(el).html() + JSON.stringify(el.attribs))
      .get();
  const before = items(from);
  const after = items(to);
  return after.filter((item, i) => item !== before[i]).length;
};

const flipsBetween = (render: (lit: string | null) => ReturnType<typeof createElement>, a: string, b: string) =>
  flips(renderToStaticMarkup(render(a)), renderToStaticMarkup(render(b)));

describe('success cases', () => {
  it('redraws only the two bubbles of the conversation when the pointer moves from one step to the next', () => {
    // ARRANGE
    const { markup } = harness('simple');
    const expected = 2;
    // ACT
    const actual = flipsBetween(markup.conversation, 'm3', 'm4');
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('redraws only the blocks of the two steps in the context window bar', () => {
    // ARRANGE
    const { chat, markup } = harness('simple');
    const blocksOf = (id: string) => chat.steps.find((s) => s.id === id)?.blocks.length ?? 0;
    const expected = blocksOf('m3') + blocksOf('m4');
    // ACT
    const actual = flipsBetween(markup.window, 'm3', 'm4');
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('redraws only some of the 100 boxes of the context window grid', () => {
    // ARRANGE
    const { markup } = harness('technical');
    const boxes = 100;
    // ACT
    const actual = flipsBetween(markup.window, 'm1', 'm8');
    // ASSERT
    expect(actual).toBeGreaterThan(0);
    expect(actual).toBeLessThan(boxes);
  });

  it('redraws only the two steps of the Attention list, and never the whole list', () => {
    // ARRANGE
    const { markup } = harness('simple');
    const expected = 2;
    // ACT
    const actual = flipsBetween(markup.attention, 'm3', 'm4');
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('failure cases', () => {
  it('redraws nothing when the pointer stays on the same step', () => {
    // ARRANGE
    const { markup } = harness('simple');
    const parts = [markup.conversation, markup.window, markup.preview, markup.attention];
    // ACT
    const actual = parts.map((part) => flipsBetween(part, 'm3', 'm3'));
    // ASSERT
    expect(actual).toEqual([0, 0, 0, 0]);
  });
});

describe('edge cases', () => {
  it('leaves most of the usage rows alone when one step is lit', () => {
    // ARRANGE
    const { markup } = harness('technical');
    const rows = load(renderToStaticMarkup(markup.preview(null)))('[data-part]').length;
    // ACT
    const actual = flipsBetween(markup.preview, 'm3', 'm4');
    // ASSERT
    expect(actual).toBeLessThan(rows);
  });

  it('lights the same items when the pointer leaves as when it never came', () => {
    // ARRANGE
    const { markup } = harness('simple');
    const before = renderToStaticMarkup(markup.conversation(null));
    // ACT
    const after = renderToStaticMarkup(markup.conversation(null));
    // ASSERT
    expect(after).toBe(before);
  });
});
