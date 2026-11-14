import { localizeTitleScene } from '@/episodes/components/slide-master/localized-slide';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { hero } from './slide';

/*
 * The Title slide's hero Scene, picked Option 0a: the research ship on the waterline has lowered its diving robot to
 * hang just above the water, where the ruler marks the Surface. Read as the Title slide renders it, with no Section
 * placed beside it. The whole depth is one full-bleed drawing in the Backdrop, so the title and lede sit in its sky
 * (Han's feedback 1); the ruler, the pill and the view switch stay reader content over it. The scenery comes from
 * the Iceberg style, the ship, crew and robot from the cast (design-ADR-0025).
 */

const sceneOf = (locale: Locale) =>
  load(
    renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        localizeTitleScene(hero, {
          episode: 'what-lies-below-the-waterline-of-sustainable-ai-skills',
          locale,
          placed: [],
          referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
          header: 'shared',
        }),
      ),
    ),
  );

describe('success cases', () => {
  it('marks where the robot hangs with the one pill, at the Surface', () => {
    // ARRANGE
    const expected = ['you are here · Surface'];
    // ACT
    const $ = sceneOf('en');
    const pills = $('[data-you-are-here]')
      .toArray()
      .map((pill) => $(pill).text());
    // ASSERT
    expect(pills).toEqual(expected);
  });

  it('names the five zones on the ruler down the left, from the Surface down, the Surface lit', () => {
    // ARRANGE
    const expected = {
      zones: ['Surface', 'Sunlit', 'Twilight', 'Midnight', 'Abyss'],
      lit: ['surface'],
    };
    // ACT
    const $ = sceneOf('en');
    const seen = {
      zones: $('[data-hero-ruler] [data-ruler-zone] [data-zone-label]')
        .toArray()
        .map((zone) => $(zone).text()),
      lit: $('[data-hero-ruler] [data-ruler-zone][data-lit]')
        .toArray()
        .map((zone) => $(zone).attr('data-ruler-zone')),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws the whole depth full-bleed in the Backdrop and keeps every word a reader needs out of it', () => {
    // ARRANGE
    const expected = { drawings: 1, wordsInBackdrop: 0, ruler: 1, pill: 1, described: 1 };
    // ACT
    const $ = sceneOf('en');
    const backdrop = $('[data-slot="slide-backdrop"]');
    const seen = {
      drawings: backdrop.find('svg[data-hero-depth]').length,
      wordsInBackdrop: backdrop.find('[data-hero-ruler], [data-you-are-here], [data-view-toggle], p, button').length,
      ruler: $('[data-hero-overlay] [data-hero-ruler]').length,
      pill: $('[data-hero-overlay] [data-you-are-here]').length,
      described: $('[data-hero-overlay] [data-hero-label]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws the Surface with the ship on the waterline, its crew on the bridge and the robot on its cable', () => {
    // ARRANGE
    const expected = { zone: 'surface', ship: 1, crew: 2, robot: 1, iceberg: 'whole', zones: 4 };
    // ACT
    const $ = sceneOf('en');
    const seen = {
      zone: $('[data-scene]').attr('data-depth-zone'),
      ship: $('[data-ship]').length,
      crew: $('[data-ship] [data-slot="bridge"] > g').length,
      robot: $('[data-robot]').length,
      iceberg: $('[data-iceberg]').attr('data-iceberg'),
      zones: $('[data-depth-band]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps the drawing and its words out of any frame, so the entrance lift never holds them to an inset box', () => {
    // ARRANGE
    const expected = { inFrame: 0, beside: 2 };
    // ACT
    const $ = sceneOf('en');
    const seen = {
      inFrame: $('article').length,
      beside: $('body').children('[data-slot="slide-backdrop"], [data-hero-overlay]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('rocks the ship, the Surface loop, and nothing else of the cast', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const rocking = sceneOf('en')('[data-ship] [data-motion="ambient"]').length;
    // ASSERT
    expect(rocking).toBe(expected);
  });
});

describe('edge cases', () => {
  it('holds the coding-agent inset of the three files, shown only in that view', () => {
    // ARRANGE
    const expected = {
      view: 'coding',
      files: ['SKILL.md', 'references/ scripts/ assets/', 'a project file, such as CONTEXT.md'],
    };
    // ACT
    const $ = sceneOf('en');
    const inset = $('[data-view="coding"]');
    const files = inset
      .find('[data-file-name]')
      .toArray()
      .map((file) => $(file).text());
    // ASSERT
    expect({ view: inset.attr('data-view'), files }).toEqual(expected);
  });

  it('holds the page one view switch, Chat app first', () => {
    // ARRANGE
    const expected = ['Chat app', 'Coding agent'];
    // ACT
    const $ = sceneOf('en');
    const options = $('[data-view-toggle] button')
      .toArray()
      .map((button) => $(button).text());
    // ASSERT
    expect(options).toEqual(expected);
  });

  it('marks the Surface in German too', () => {
    // ARRANGE
    const expected = 'Du bist hier · Oberfläche';
    // ACT
    const pill = sceneOf('de')('[data-you-are-here]').text();
    // ASSERT
    expect(pill).toBe(expected);
  });
});
