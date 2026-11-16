import { localizeTitleScene } from '@/episodes/components/slide-master/localized-slide';
import { titleLinesOf } from '@/episodes/components/slide-master/title-lines';
import { episodeRef } from '@/episodes/lib/episode-folders';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { hero } from './slide';

/*
 * The Title slide's hero Scene, picked Option B (plain numbered cards): the problem as an abstract picture. Four
 * ticked cards numbered 1 to 4 add up to a broken goal, and "Goal" is the only word on it. Read as the Title slide
 * renders it, with no Section placed beside it.
 */

const sceneOf = (locale: Locale) =>
  load(
    renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        localizeTitleScene(hero, {
          episode: episodeRef(
            'what-agentic-workflows-require',
            '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows',
          ).id,
          locale,
          placed: [],
          referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
          header: 'shared',
        }),
      ),
    ),
  );

const textsOf = ($: ReturnType<typeof sceneOf>, selector: string) =>
  $(selector)
    .toArray()
    .map((node) => $(node).text().replace(/\s+/g, ' ').trim());

describe('success cases', () => {
  it('shows four ticked cards, numbered 1 to 4, each done by a person', () => {
    // ARRANGE
    const expected = { cards: 4, numbers: ['1', '2', '3', '4'], people: 4 };
    // ACT
    const $ = sceneOf('en');
    const actual = {
      cards: $('[data-ticked-card]').length,
      numbers: textsOf($, '[data-card-number]'),
      people: $('[data-ticked-card] [aria-label="Done by a person"]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('ends the sum in a broken goal, the failure cross on its corner', () => {
    // ARRANGE
    const expected = { goal: ['Goal'], broken: ['Broken'] };
    // ACT
    const $ = sceneOf('en');
    const actual = {
      goal: textsOf($, '[data-broken-goal] [data-goal-label]'),
      broken: $('[data-broken-goal] [role="img"]')
        .toArray()
        .map((node) => $(node).attr('aria-label')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('gives the Title slide its short caption', () => {
    // ARRANGE
    const expected = 'Everyone delivered, none of it added up.';
    // ACT
    const actual = titleLinesOf(hero, 'en').caption;
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('failure cases', () => {
  it('shows no word but "Goal": no team name, no party, no contract', () => {
    // ARRANGE
    const expected = { words: ['Goal'], teams: 0, contract: 0 };
    // ACT
    const $ = sceneOf('en');
    const visible = $('[data-goal-sum]')
      .clone()
      .find('[role="img"][aria-label], [aria-hidden="true"], [data-card-number]')
      .remove()
      .end()
      .text()
      .replace(/\s+/g, ' ')
      .trim();
    const actual = {
      words: visible === '' ? [] : [visible],
      teams: $('[data-team]').length,
      contract: $('[data-contract]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('holds no h1 of its own: the shared header renders the Episode title', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const actual = sceneOf('en')('h1').length;
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('edge cases', () => {
  it('writes the one word and the caption in German on the German page', () => {
    // ARRANGE
    const expected = { goal: ['Ziel'], caption: 'Alle haben geliefert, nichts davon passte zusammen.' };
    // ACT
    const $ = sceneOf('de');
    const actual = { goal: textsOf($, '[data-goal-label]'), caption: titleLinesOf(hero, 'de').caption };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
