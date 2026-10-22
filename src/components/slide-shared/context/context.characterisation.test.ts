import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Context } from './context';
import { CONTEXT_PRESETS, contextData, type ContextPresetId } from './context-data';
import { createState, litKey, matcher, reduce, visibleStep } from './context-state.pure';

/* Characterisation of today's behaviour, pinned before the Context rename (ticket T1). */

const render = (preset: ContextPresetId, locale = 'en') =>
  load(renderToStaticMarkup(createElement(Context, { preset, locale })));

const fingerprint = (preset: ContextPresetId) => {
  const $ = render(preset);
  return {
    sections: $('section')
      .map((_, el) => $(el).attr('aria-label'))
      .get(),
    lit: $('[data-on]').length,
    toolbar: $('[role="toolbar"] button')
      .map((_, el) => `${$(el).text().trim()}:${$(el).attr('aria-pressed') ?? '-'}`)
      .get(),
    sliders: $('input[type="range"]').length,
  };
};

const setup = (id: ContextPresetId) => {
  const { presets, chats } = contextData('en');
  const preset = presets[id]!;
  const chat = chats[preset.chat]!;
  return { preset, chat, context: { preset, steps: chat.steps.length } };
};

describe('success cases', () => {
  describe('server render per Preset', () => {
    it('draws the fingerprint of every Preset', () => {
      // ARRANGE
      const expected = {
        'slide-3': {
          lit: 1,
          sections: ['Chat'],
          sliders: 1,
          toolbar: [
            'Conversation:true',
            'Timeline:true',
            'Context window:false',
            'Context category:false',
            'Details:false',
            'Attention:false',
            ':false',
          ],
        },
        'slide-4': {
          lit: 0,
          sections: ['Chat', 'Context window', 'Attention'],
          sliders: 1,
          toolbar: [
            'Conversation:true',
            'Timeline:true',
            'Context window:true',
            'Context category:false',
            'Details:false',
            'Attention:true',
            ':false',
            ':-',
          ],
        },
        'slide-5': { lit: 0, sections: ['Context window', 'Attention'], sliders: 1, toolbar: [] },
        'slide-6': { lit: 0, sections: ['Context window'], sliders: 0, toolbar: [] },
        'slide-7': {
          lit: 22,
          sections: ['Chat', 'Context window', 'Details'],
          sliders: 1,
          toolbar: [
            'Conversation:true',
            'Timeline:true',
            'Context window:true',
            'Context category:true',
            'Details:true',
            'Attention:false',
            ':true',
            ':-',
          ],
        },
        'slide-7-parts': { lit: 5, sections: ['Context window', 'Details'], sliders: 0, toolbar: [] },
        'slide-8': {
          lit: 29,
          sections: ['Context window', 'Details'],
          sliders: 1,
          toolbar: [
            'Conversation:false',
            'Timeline:true',
            'Context window:true',
            'Context category:true',
            'Details:true',
            'Attention:false',
            ':true',
            ':-',
          ],
        },
        'slide-9-after': { lit: 2, sections: ['Context window'], sliders: 0, toolbar: [] },
        'slide-9-before': { lit: 4, sections: ['Context window'], sliders: 0, toolbar: [] },
        'slide-9-chat': { lit: 0, sections: ['Chat'], sliders: 0, toolbar: [] },
        'gallery-full': {
          lit: 0,
          sections: ['Chat', 'Context window', 'Details', 'Attention'],
          sliders: 1,
          toolbar: [
            'Conversation:true',
            'Timeline:true',
            'Context window:true',
            'Context category:true',
            'Details:true',
            'Attention:true',
            ':false',
            ':-',
          ],
        },
      };
      // ACT
      const actual = Object.fromEntries(CONTEXT_PRESETS.map((id) => [id, fingerprint(id)]));
      // ASSERT
      expect(actual).toEqual(expected);
    });
  });

  describe('hover lighting across parts', () => {
    it('lights one step from one key, and a category lights every block of it', () => {
      // ARRANGE
      const { preset, chat, context } = setup('slide-7');
      const hovered = reduce(createState(preset), { type: 'HOVER', part: 'm3' }, context);
      const category = reduce(createState(preset), { type: 'HOVER', part: 'cat:user' }, context);
      const lit = (key: string | null) => {
        const match = matcher(key);
        return chat.steps.filter((s) => s.blocks.some((b) => match(s.id, b.cat))).map((s) => s.id);
      };
      const hoveredStep = ['m3'];
      // ACT
      const one = lit(litKey(hovered));
      const many = lit(litKey(category));
      // ASSERT
      expect(one).toEqual(hoveredStep);
      expect(many).toEqual(chat.steps.filter((s) => s.blocks.some((b) => b.cat === 'user')).map((s) => s.id));
    });

    it('prefers hover over pin, and clears both on Escape', () => {
      // ARRANGE
      const { preset, context } = setup('slide-7');
      const pinned = reduce(createState(preset), { type: 'PIN', part: 'm2' }, context);
      const hovered = reduce(pinned, { type: 'HOVER', part: 'm3' }, context);
      const expected = ['m2', 'm3', null];
      // ACT
      const escaped = reduce(hovered, { type: 'ESC' }, context);
      // ASSERT
      expect([litKey(pinned), litKey(hovered), litKey(escaped)]).toEqual(expected);
    });
  });

  describe('pin and step', () => {
    it('pins on the first click and unpins on the second', () => {
      // ARRANGE
      const { preset, context } = setup('slide-7');
      const first = reduce(createState(preset), { type: 'PIN', part: 'm5' }, context);
      const expected = ['m5', null];
      // ACT
      const second = reduce(first, { type: 'PIN', part: 'm5' }, context);
      // ASSERT
      expect([first.pinned, second.pinned]).toEqual(expected);
    });

    it('previews a step while scrubbing, commits it on release, and clamps to the chat', () => {
      // ARRANGE
      const { preset, chat, context } = setup('slide-7');
      const step = 4;
      const previewed = reduce(createState(preset), { type: 'PREVIEW', step }, context);
      // ACT
      const committed = reduce(previewed, { type: 'COMMIT', step }, context);
      const over = reduce(committed, { type: 'COMMIT', step: 9999 }, context);
      // ASSERT
      expect([visibleStep(previewed), previewed.step === preset.step]).toEqual([step, true]);
      expect([committed.step, committed.previewStep]).toEqual([step, null]);
      expect(over.step).toBe(chat.steps.length);
    });
  });

  describe('the context category', () => {
    it('is a part of its own, a sibling of the context window and not inside it', () => {
      // ARRANGE
      const group = '[aria-label="Usage by category"]';
      // ACT
      const $ = render('slide-8');
      // ASSERT
      expect($(`section[aria-label="Context window"] ${group}`)).toHaveLength(0);
      expect($(`section[aria-label="Context window"]`).next(group)).toHaveLength(1);
    });
  });

  describe('toolbar toggles', () => {
    it('flips a part, and the depth where the Preset offers them', () => {
      // ARRANGE
      const { preset, context } = setup('slide-7');
      const state = createState(preset);
      // ACT
      const part = reduce(state, { type: 'TOGGLE_PART', part: 'panel' }, context);
      const technical = 'technical';
      const depth = reduce(state, { type: 'SET_DEPTH', value: technical }, context);
      // ASSERT
      expect(part.parts.panel).toBe(!state.parts.panel);
      expect(depth.depth).toBe(technical);
    });
  });
});

describe('failure cases', () => {
  it('ignores the timeline on a locked Preset', () => {
    // ARRANGE
    const { preset, context } = setup('slide-6');
    const state = createState(preset);
    // ACT
    const next = reduce(state, { type: 'COMMIT', step: 2 }, context);
    // ASSERT
    expect(next).toBe(state);
  });
  it('refuses a toggle on a Preset whose controls are hidden', () => {
    // ARRANGE
    const { preset, context } = setup('slide-5');
    const state = createState(preset);
    // ACT
    const next = reduce(state, { type: 'SET_DEPTH', value: 'technical' }, context);
    // ASSERT
    expect(next).toBe(state);
  });
});

describe('edge cases', () => {
  it('has the same Presets as the config', () => {
    // ARRANGE
    const expected = Object.keys(contextData('en').presets).sort();
    // ACT
    const actual = [...CONTEXT_PRESETS].sort();
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
