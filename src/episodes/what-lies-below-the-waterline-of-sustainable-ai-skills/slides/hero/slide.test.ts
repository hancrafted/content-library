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
 * placed beside it. The scenery comes from ZoneScene, the ship, crew and robot from the cast (design-ADR-0025).
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

  it('names the five zones on the ruler from the Surface down, the first Section lit on the Surface', () => {
    // ARRANGE
    const expected = {
      zones: ['Surface', 'Sunlit', 'Twilight', 'Midnight', 'Abyss'],
      litBand: 'surface',
      litSection: '0',
    };
    // ACT
    const $ = sceneOf('en');
    const zones = $('[data-ruler-zone] [data-zone-label]')
      .toArray()
      .map((zone) => $(zone).text());
    const lit = $('[data-tile][data-lit]');
    const seen = {
      zones,
      litBand: lit.closest('[data-ruler-zone]').attr('data-ruler-zone'),
      litSection: lit.attr('data-section'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws the Surface with the ship on the waterline, its crew on the bridge and the robot on its cable', () => {
    // ARRANGE
    const expected = { zone: 'surface', ship: 1, crew: 2, robot: 1, iceberg: 'whole' };
    // ACT
    const $ = sceneOf('en');
    const seen = {
      zone: $('[data-scene]').attr('data-depth-zone'),
      ship: $('[data-ship]').length,
      crew: $('[data-ship] [data-slot="bridge"] > g').length,
      robot: $('[data-robot]').length,
      iceberg: $('[data-iceberg]').attr('data-iceberg'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
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
