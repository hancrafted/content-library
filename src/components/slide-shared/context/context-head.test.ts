import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Context } from './context';
import { contextData, type ContextPresetId } from './context-data';
import { createState, reduce } from './context-state.pure';

/* The context-window head: `Context window (64%)   128K of [200K | 1M] · eye · side column · </>`. */

const render = (preset: ContextPresetId, locale = 'en') =>
  load(renderToStaticMarkup(createElement(Context, { preset, locale })));
const head = ($: ReturnType<typeof render>) => $('section[aria-label="Context window"] > div').first();
const buttons = ($: ReturnType<typeof render>) =>
  head($)
    .find('button[data-control]')
    .map((_, el) => ({
      control: $(el).attr('data-control'),
      label: $(el).attr('aria-label'),
      tip: $(el).attr('data-tip'),
      pressed: $(el).attr('aria-pressed'),
    }))
    .get();
const setup = (id: ContextPresetId) => {
  const { presets, chats } = contextData('en');
  const preset = presets[id]!;
  return { preset, context: { preset, steps: chats[preset.chat]!.steps.length } };
};

describe('success cases', () => {
  it('names the part and its fill, then the plain window size when the Preset has no switch', () => {
    // ARRANGE
    const expected = /^Context window \(\d+(\.\d)?%\)\s*\d+(\.\d)?K of 200K/;
    // ACT
    const text = head(render('slide-4')).text();
    // ASSERT
    expect(text).toMatch(expected);
  });

  it('draws the 200K | 1M switch in the head when the window control is shown', () => {
    // ARRANGE
    const expected = ['200K', '1M'];
    // ACT
    const $ = render('slide-5');
    const options = head($)
      .find('[role="group"] button')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(options).toEqual(expected);
  });

  it('gives each head icon button a tooltip, an aria-label and aria-pressed', () => {
    // ARRANGE
    const expected = [
      { control: 'zone', label: 'Smart zone', pressed: 'true' },
      { control: 'windowTechnical', label: 'Technical window', pressed: 'false' },
    ];
    // ACT
    const actual = buttons(render('slide-4'));
    // ASSERT
    expect(actual.map(({ control, label, pressed }) => ({ control, label, pressed }))).toEqual(expected);
    expect(actual.every((b) => b.tip)).toBe(true);
  });

  it('flips the smart-zone column in state, and the Preset starts it off on Slide 9', () => {
    // ARRANGE
    const { preset, context } = setup('slide-4');
    const state = createState(preset);
    // ACT
    const flipped = reduce(state, { type: 'TOGGLE_ZONE' }, context);
    const slide9 = createState(setup('slide-9-before').preset);
    // ASSERT
    expect([state.zone, flipped.zone, slide9.zone]).toEqual([true, false, false]);
  });

  it('takes the local Technical toggle without changing the toolbar value', () => {
    // ARRANGE
    const { preset, context } = setup('slide-4');
    const state = createState(preset);
    const expected = ['simple', 'technical'];
    // ACT
    const next = reduce(state, { type: 'SET_PART_MODE', part: 'context-window', value: 'technical' }, context);
    // ASSERT
    expect([next.depth, next.renderModes['context-window']]).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows no percent and no used-of-window figure on the "You can\'t watch the meter" Presets', () => {
    // ARRANGE
    const presets: ContextPresetId[] = ['slide-9-before', 'slide-9-after'];
    const title = 'Context window';
    // ACT
    const texts = presets.map((id) => head(render(id)).text());
    // ASSERT
    texts.forEach((text) => {
      expect(text).toContain(title);
      expect(text).not.toMatch(/%|\d+K of/);
    });
  });

  it('shows the percent and the figure again when the Preset keeps the meter control on', () => {
    // ARRANGE
    const expected = [false, true];
    // ACT
    const actual = ['slide-9-before', 'slide-4'].map((id) => /%/.test(head(render(id as ContextPresetId)).text()));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws no head icon buttons on a Preset that hides every control', () => {
    // ARRANGE
    const expected: unknown[] = [];
    // ACT
    const actual = buttons(render('slide-3'));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('hides the smart-zone labels from the bar when the zone is off', () => {
    // ARRANGE
    const expected = { zone: 'off', labels: 0 };
    // ACT
    const $ = render('slide-9-before');
    const zone = $('section[aria-label="Context window"]').attr('data-zone');
    // ASSERT
    expect({ zone, labels: $('[class*="labelLimit"]').length }).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('draws no eye button: the category is its own part, shown from the toolbar chips', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const found = buttons(render('slide-4')).some((b) => b.control === 'preview');
    // ASSERT
    expect(found).toBe(expected);
  });

  it('gives conversation and category their own local Technical, each leaving the toolbar value alone', () => {
    // ARRANGE
    const { preset, context } = setup('slide-4');
    const state = createState(preset);
    // ACT
    const next = (['conversation', 'category'] as const).map((part) =>
      reduce(state, { type: 'SET_PART_MODE', part, value: 'technical' }, context),
    );
    // ASSERT
    expect(next.map((n) => [n.depth, n.renderModes.conversation, n.renderModes.category])).toEqual([
      ['simple', 'technical', undefined],
      ['simple', undefined, 'technical'],
    ]);
  });
});
