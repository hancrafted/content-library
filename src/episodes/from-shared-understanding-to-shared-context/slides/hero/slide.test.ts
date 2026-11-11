import { localizeTitleScene } from '@/episodes/components/slide-master/localized-slide';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { hero } from './slide';

/*
 * The Title slide's hero Scene, picked Option 0c: what you hand the agent sets the aim, AI speeds the throw, and every
 * document lands on the bull. Read as the Title slide renders it, with no Section placed beside it.
 */

const sceneOf = (locale: Locale) =>
  load(
    renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        localizeTitleScene(hero, {
          episode: 'from-shared-understanding-to-shared-context',
          locale,
          placed: [],
          referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
          header: 'shared',
        }),
      ),
    ),
  );

/** The centre of each document dart, from its path's top-left corner and its 20 by 24 page. */
function hitCentres($: ReturnType<typeof sceneOf>) {
  return $('[data-hit]')
    .toArray()
    .map((hit) => {
      const [x = 0, y = 0] = ($(hit).attr('d') ?? '').slice(1).split(/[ h]/).map(Number);
      return { x: x + 10, y: y + 12 };
    });
}

describe('success cases', () => {
  it('lands every document dart inside the innermost ring, the bull of the intent', () => {
    // ARRANGE
    const board = { cx: 364, cy: 220, innermostRing: 37.5 };
    const expected = [true, true, true, true];
    // ACT
    const hits = hitCentres(sceneOf('en'));
    const inside = hits.map(({ x, y }) => Math.hypot(x - board.cx, y - board.cy) < board.innermostRing);
    // ASSERT
    expect(inside).toEqual(expected);
  });

  it('names the handover, the aim, the AI, the speed and the intent in English', () => {
    // ARRANGE
    const expected = ['The intent', 'What you', 'hand the agent', 'sets the aim', 'AI', 'every throw faster'];
    // ACT
    const $ = sceneOf('en');
    const words = $('text, tspan')
      .toArray()
      .filter((node) => $(node).children().length === 0)
      .map((node) => $(node).text());
    // ASSERT
    expect(words).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('declares no Speaker note and no Voice script, which belong to the record on a Title slide', () => {
    // ARRANGE
    const expected = { notes: 0, segments: 0 };
    // ACT
    const actual = { notes: hero.notes.length, segments: hero.segments.length };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('breaks the German handover onto two lines, as the English does', () => {
    // ARRANGE
    const expected = ['Was Du dem', 'Agenten übergibst'];
    // ACT
    const $ = sceneOf('de');
    const lines = $('tspan')
      .toArray()
      .map((line) => $(line).text());
    // ASSERT
    expect(lines).toEqual(expected);
  });
});
