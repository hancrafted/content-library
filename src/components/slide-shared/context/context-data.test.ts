import { describe, expect, it } from 'vitest';
import { toClaudeLog } from './claude-log-writer.pure';
import { fromClaudeLog, type LogOptions } from './claude-log.pure';
import { CONTROL_IDS, offers } from './context-controls.pure';
import { CONTEXT_PRESETS, MINI_PRESETS, contextData, rawConfigs } from './context-data';
import { presetProblems } from './context-presets.pure';
import { attentionAt } from './context-usage.pure';
import { framesOf } from './context.pure';
import type { Chat } from './context.types';
import logDe from './summer-party.de.jsonl';
import logEn from './summer-party.jsonl';

/** Every key path of a parsed YAML tree, arrays by index. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

/** The options the build reads a log with: the config's starting instructions and memory, as the chat holds them. */
function optionsOf(chat: Chat): LogOptions {
  const [start] = chat.steps;
  const memory = chat.steps.find((step) => step.kind === 'memory')?.blocks[0]?.tokens;
  return { id: 'summer-party', start: { id: start?.id ?? '', blocks: start?.blocks ?? [] }, memory };
}

describe('success cases', () => {
  it.each([
    ['English', logEn],
    ['German', logDe],
  ])('reads back the %s summer-party log it wrote, strictly equal', (_name, log) => {
    // ARRANGE
    const options = optionsOf(contextData('en').chats['summer-compact'] ?? { id: '', steps: [] });
    const chat = fromClaudeLog(log, options);
    // ACT
    const again = fromClaudeLog(toClaudeLog(chat), options);
    // ASSERT
    expect(chat.steps.length).toBeGreaterThan(1);
    expect(again).toStrictEqual(chat);
  });

  it("splits the Brief's 100 units of attention 20/50/30 over start, middle and end at step 21", () => {
    // ARRANGE
    const data = contextData('en');
    const chat = data.chats['summer-party'] ?? { id: '', steps: [] };
    const override = data.attention['summer-party']?.['21'];
    const expected = { total: 100, start: 20, middle: 50, end: 30 };
    // ACT
    const units = attentionAt(chat, framesOf(chat), {
      step: 21,
      windowTokens: 200000,
      notes: data.notes,
      override,
    }).map((a) => a.units);
    const sum = (part: readonly number[]) => part.reduce((a, b) => a + b, 0);
    const split = { start: sum(units.slice(0, 3)), middle: sum(units.slice(3, -3)), end: sum(units.slice(-3)) };
    // ASSERT
    expect(sum(Object.values(override ?? {}))).toBe(expected.total);
    expect(sum(units)).toBe(expected.total);
    expect(split).toEqual({ start: expected.start, middle: expected.middle, end: expected.end });
  });

  it('offers the 200K | 1M switch on Slide 5 only', () => {
    // ARRANGE
    const expected = ['slide-5'];
    // ACT
    const switching = Object.values(contextData('en').presets)
      .filter((preset) => offers(preset, 'window'))
      .map((preset) => preset.id);
    // ASSERT
    expect(switching).toEqual(expected);
  });

  it('draws Slides 5, 6 and the three Slide 9 stills without motion, since the Spec gives them motion none', () => {
    // ARRANGE
    const expected = [
      ['slide-5', 'off'],
      ['slide-6', 'off'],
      ['slide-9-before', 'off'],
      ['slide-9-chat', 'off'],
      ['slide-9-after', 'off'],
    ];
    // ACT
    const motions = Object.values(contextData('en').presets)
      .filter((preset) => preset.motion === 'off')
      .map((preset) => [preset.id, preset.motion]);
    // ASSERT
    expect(motions).toEqual(expected);
  });

  it('hides the toolbar on Slide 3 and draws its context component 30% lower than the default', () => {
    // ARRANGE
    const expected = { shown: [], height: 26.6 };
    // ACT
    const slide3 = contextData('en').presets['slide-3'];
    // ASSERT
    const shown = slide3 ? CONTROL_IDS.filter((id) => offers(slide3, id)) : ['missing'];
    expect({ shown, height: slide3?.height }).toEqual(expected);
  });

  it('keeps the default 38rem height on every other Preset', () => {
    // ARRANGE
    const expected = { 'slide-3': 26.6 };
    // ACT
    const heights = Object.fromEntries(
      Object.values(contextData('en').presets)
        .filter((preset) => preset.height !== 38)
        .map((preset) => [preset.id, preset.height]),
    );
    // ASSERT
    expect(heights).toEqual(expected);
  });

  it('names every Preset of the config, and builds each in both locales', () => {
    // ARRANGE
    const expected = { presets: [...CONTEXT_PRESETS].sort(), minis: [...MINI_PRESETS].sort() };
    // ACT
    const en = contextData('en');
    const de = contextData('de');
    // ASSERT
    expect(Object.keys(en.presets).sort()).toEqual(expected.presets);
    expect(Object.keys(de.presets).sort()).toEqual(expected.presets);
    expect(Object.keys(en.minis).sort()).toEqual(expected.minis);
  });

  it('keeps the German words and story under exactly the English keys', () => {
    // ARRANGE
    const { en, de } = rawConfigs();
    const pick = (config: unknown) => {
      const { words, story } = config as { words: unknown; story: unknown };
      return keyPaths({ words, story });
    };
    // ACT
    const english = pick(en);
    const german = pick(de);
    // ASSERT
    expect(german).toEqual(english);
  });

  it('reads the same steps and sizes from the English and the German log', () => {
    // ARRANGE
    const sizes = (locale: 'en' | 'de') =>
      contextData(locale).chats['summer-compact']?.steps.map((step) => [step.id, step.blocks]);
    // ACT
    const english = sizes('en');
    const german = sizes('de');
    // ASSERT
    expect(german).toEqual(english);
  });
});

describe('failure cases', () => {
  it('refuses a window switch with one window size', () => {
    // ARRANGE
    const data = contextData('en');
    const slide3 = data.presets['slide-3'];
    const expected = 'slide-3: the window switch needs two window sizes';
    // ACT
    const problems = slide3
      ? presetProblems({ ...slide3, controls: { window: { show: true } } }, data.chats['summer-party'])
      : [];
    // ASSERT
    expect(problems).toContain(expected);
  });

  it('refuses an Attention layout that is not list, pinned or compressed', () => {
    // ARRANGE
    const data = contextData('en');
    const slide3 = data.presets['slide-3'];
    const expected = 'slide-3: unknown attention layout "tiled"';
    const attention = { layout: 'tiled' } as never;
    // ACT
    const problems = slide3 ? presetProblems({ ...slide3, attention }, data.chats['summer-party']) : [];
    // ASSERT
    expect(problems).toContain(expected);
  });

  it('refuses a height that is not a positive number of rem', () => {
    // ARRANGE
    const data = contextData('en');
    const slide3 = data.presets['slide-3'];
    const expected = 'slide-3: the height must be a positive number of rem';
    // ACT
    const problems = slide3 ? presetProblems({ ...slide3, height: 0 }, data.chats['summer-party']) : [];
    // ASSERT
    expect(problems).toContain(expected);
  });

  it('refuses an order that lists a part twice or leaves one out', () => {
    // ARRANGE
    const data = contextData('en');
    const slide3 = data.presets['slide-3'];
    const expected = 'slide-3: order must list every part once, got chat, chat, timeline, context, preview, panel';
    const order = ['chat', 'chat', 'timeline', 'context', 'preview', 'panel'] as const;
    // ACT
    const problems = slide3 ? presetProblems({ ...slide3, order }, data.chats['summer-party']) : [];
    // ASSERT
    expect(problems).toEqual([expected]);
  });

  it('names a step outside the timeline and a pinned part not in the chat', () => {
    // ARRANGE
    const data = contextData('en');
    const slide3 = data.presets['slide-3'];
    const chat = data.chats['summer-party'];
    const expected = [
      'slide-3: step 40 is outside the timeline (1–21)',
      'slide-3: pinned part "m99" is not in the chat',
    ];
    // ACT
    const problems = slide3 ? presetProblems({ ...slide3, step: 40, pinned: 'm99' }, chat) : [];
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('refuses a chat that fills the buffer without a compaction', () => {
    // ARRANGE
    const data = contextData('en');
    const slide3 = data.presets['slide-3'];
    const chat = data.chats['summer-compact'];
    const expected = 'slide-3: the chat enters the buffer at step 23 without a compaction';
    // ACT
    const problems = slide3 && chat ? presetProblems(slide3, { ...chat, steps: chat.steps.slice(0, 23) }) : [];
    // ASSERT
    expect(problems).toContain(expected);
  });
});

describe('edge cases', () => {
  it('lays Attention out as a list by default and compressed on Slide 4, with the chat fading on Slide 5', () => {
    // ARRANGE
    const data = contextData('en');
    const expected = { slide3: 'list', slide4: 'compressed', fade5: true, attention4: true, panel4: false };
    // ACT
    const actual = {
      slide3: data.presets['slide-3']?.attention.layout,
      slide4: data.presets['slide-4']?.attention.layout,
      fade5: data.presets['slide-5']?.fade,
      attention4: data.presets['slide-4']?.show.attention,
      panel4: data.presets['slide-4']?.show.panel,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('ends the summer party at 64% of 200K, and fills the buffer right before the compaction', () => {
    // ARRANGE
    const data = contextData('en');
    const expected = { percent: 64, endsOn: 'm24', limit: 183500 };
    // ACT
    const party = data.chats['summer-party'] ?? { id: '', steps: [] };
    const compact = data.chats['summer-compact'] ?? { id: '', steps: [] };
    const percent = Math.round(((framesOf(party).at(-1)?.used ?? 0) / 200000) * 100);
    const beforeCompaction = framesOf(compact)[22]?.used;
    // ASSERT
    expect(percent).toBe(expected.percent);
    expect(party.steps.at(-1)?.id).toBe(expected.endsOn);
    expect(beforeCompaction).toBeGreaterThan(expected.limit);
  });
});
