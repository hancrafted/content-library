import { localizeTitleScene } from '@/episodes/components/slide-master/localized-slide';
import { titleLinesOf } from '@/episodes/components/slide-master/title-lines';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { hero } from './slide';

/*
 * The Title slide's hero Scene, picked Option 0b: the party board zoomed onto one seam, Food & drinks handing
 * "31 vegetarian" to the venue's kitchen, with the contract card as the focal part and the goal note at the right
 * edge. Read as the Title slide renders it, with no Section placed beside it.
 */

const sceneOf = (locale: Locale) =>
  load(
    renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        localizeTitleScene(hero, {
          episode: 'what-agentic-workflows-require',
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
  it('hands 31 vegetarian from Food & drinks to the venue kitchen across one seam', () => {
    // ARRANGE
    const expected = {
      teams: ['Food & drinks', 'Venue kitchen'],
      facts: ['Dinner for 200', 'Menu at 19:00'],
      details: ['31 vegetarian', 'how: the kitchen’s choice'],
    };
    // ACT
    const $ = sceneOf('en');
    const actual = {
      teams: textsOf($, '[data-seam-card] [data-team]'),
      facts: textsOf($, '[data-seam-card] [data-fact]'),
      details: textsOf($, '[data-seam-card] [data-detail]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('puts the contract at the seam, with the definition set off', () => {
    // ARRANGE
    const expected = {
      label: ['Contract at the seam'],
      terms: ['Receives', 'Delivers', 'Checked by'],
      values: [
        '200 guests, 31 vegetarian, defined as no meat, fish or eggs',
        'dinner for 200 at 19:00',
        'the menu against the definition',
      ],
      definition: ['no meat, fish or eggs'],
    };
    // ACT
    const $ = sceneOf('en');
    const actual = {
      label: textsOf($, '[data-contract] [data-contract-label]'),
      terms: textsOf($, '[data-contract] dt'),
      values: textsOf($, '[data-contract] dd'),
      definition: textsOf($, '[data-contract] dd b'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('ends the board in the goal note', () => {
    // ARRANGE
    const expected = { label: ['Goal'], text: ['20 June: everyone celebrates together and gets home safely'] };
    // ACT
    const $ = sceneOf('en');
    const actual = { label: textsOf($, '[data-goal] span'), text: textsOf($, '[data-goal] p') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('gives the Title slide its caption from the Hero motif', () => {
    // ARRANGE
    const expected =
      'Everyone delivered exactly what was asked, and none of it added up: an agentic workflow is a goal broken into handoffs you can check, designed around the goal, not the org chart.';
    // ACT
    const actual = titleLinesOf(hero, 'en').caption;
    // ASSERT
    expect(actual).toBe(expected);
  });
});

describe('failure cases', () => {
  it('marks the agent on the Food & drinks card and the kitchen as external, never the other way round', () => {
    // ARRANGE
    const expected = { agent: ['Food & drinks'], external: ['Venue kitchen'] };
    // ACT
    const $ = sceneOf('en');
    const teamOf = (selector: string) =>
      $(selector)
        .toArray()
        .map((card) => $(card).find('[data-team]').text().trim());
    const actual = {
      agent: teamOf('[data-seam-card][data-agent]'),
      external: teamOf('[data-seam-card][data-external]'),
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
  it('writes the board in German on the German page', () => {
    // ARRANGE
    const expected = {
      teams: ['Essen & Getränke', 'Location-Küche'],
      terms: ['Erhält', 'Liefert', 'Geprüft durch'],
      external: ['extern'],
    };
    // ACT
    const $ = sceneOf('de');
    const actual = {
      teams: textsOf($, '[data-seam-card] [data-team]'),
      terms: textsOf($, '[data-contract] dt'),
      external: textsOf($, '[data-external-tag]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
