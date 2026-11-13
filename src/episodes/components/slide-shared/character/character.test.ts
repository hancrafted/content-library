import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Character, type CharacterProps } from './character';
import type { Preset } from './preset';
import { aiAgent } from './shared-presets';

/*
 * The Character a Scene places: one body plan in a pose, a motion that plays once on the active Slide, and the emote at
 * its own head, mirrored with the figure but never its words.
 */

const captainLike: Preset = {
  kind: 'human',
  build: 'slim',
  skin: 'light',
  hair: 'long',
  headwear: 'captain-cap',
  outfit: 'officer',
};

const render = (props: CharacterProps) => {
  const $ = load(renderToStaticMarkup(createElement('svg', null, createElement(Character, props))));
  const root = $('[data-character]');
  return {
    pose: root.attr('data-pose'),
    kind: root.attr('data-kind'),
    style: root.attr('style'),
    flip: $('[data-figure]').attr('transform'),
    emoteAt: $('[data-emote]').attr('transform'),
    mark: $('[data-emote-mark]').attr('data-emote-mark'),
    says: $('[data-says]').text(),
    moving: $('[data-motion]')
      .toArray()
      .map((group) => `${$(group).attr('data-group')}:${$(group).attr('data-motion')}`),
    paths: $('[data-figure] path').length,
  };
};

describe('success cases', () => {
  it('draws the preset in its pose with the emote of its mood at the top of its head', () => {
    // ARRANGE
    const expected = { pose: 'point', kind: 'human', emoteAt: 'translate(1 -106)', mark: 'question' };
    // ACT
    const { pose, kind, emoteAt, mark } = render({ preset: captainLike, pose: 'point', mood: 'confused' });
    // ASSERT
    expect({ pose, kind, emoteAt, mark }).toEqual(expected);
  });

  it('moves only the parts its motion names, pivoting inside the figure', () => {
    // ARRANGE
    const expected = {
      wave: ['front-arm:wave'],
      nod: ['head-back:nod', 'head:nod'],
      turn: ['head-back:turn-to', 'head:turn-to'],
    };
    // ACT
    const seen = {
      wave: render({ preset: aiAgent, motion: 'wave' }).moving,
      nod: render({ preset: captainLike, motion: 'nod' }).moving,
      turn: render({ preset: captainLike, motion: 'turn-to' }).moving,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('times the emote after its own motion', () => {
    // ARRANGE
    const expected = '--emote-delay:1300ms';
    // ACT
    const { style } = render({ preset: aiAgent, motion: 'wave', mood: 'happy' });
    // ASSERT
    expect(style).toBe(expected);
  });
});

describe('failure cases', () => {
  it('refuses a motion it does not know', () => {
    // ARRANGE
    const motion = 'moonwalk' as CharacterProps['motion'];
    const expected = /moonwalk/;
    // ACT
    const draw = () => render({ preset: aiAgent, motion });
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('mirrors the body when flipped, and moves the emote to the mirrored head without mirroring its words', () => {
    // ARRANGE
    const says = 'Same dive as yesterday?';
    const expected = { flip: 'scale(-1 1)', emoteAt: 'translate(-1 -106)', says };
    // ACT
    const { flip, emoteAt, says: shown } = render({ preset: captainLike, flip: true, says });
    // ASSERT
    expect({ flip, emoteAt, says: shown }).toEqual(expected);
  });

  it('stands still, with no emote, when given only a preset', () => {
    // ARRANGE
    const expected = { pose: 'stand', moving: [], emoteAt: undefined, style: undefined };
    // ACT
    const { pose, moving, emoteAt, style } = render({ preset: aiAgent });
    // ASSERT
    expect({ pose, moving, emoteAt, style }).toEqual(expected);
  });
});
