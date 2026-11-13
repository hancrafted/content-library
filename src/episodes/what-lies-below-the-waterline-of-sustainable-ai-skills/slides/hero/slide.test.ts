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
 * placed beside it. The scenery and figures are slots the later Build jobs fill (design-ADR-0025).
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

  it('names the five zones on the ruler from the Surface down, the Surface lit', () => {
    // ARRANGE
    const expected = { zones: ['Surface', 'Sunlit', 'Twilight', 'Midnight', 'Abyss'], lit: 'Surface' };
    // ACT
    const $ = sceneOf('en');
    const zones = $('[data-ruler-zone]')
      .toArray()
      .map((zone) => $(zone).find('[data-zone-name]').text());
    const lit = $('[data-ruler-zone][data-lit] [data-zone-name]').text();
    // ASSERT
    expect({ zones, lit }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('draws no ship, robot or scenery itself, leaving one slot for the dive scene', () => {
    // ARRANGE
    const expected = { scene: 1, svgPaths: 0 };
    // ACT
    const $ = sceneOf('en');
    const actual = { scene: $('[data-slot="dive-scene"]').length, svgPaths: $('path, polygon').length };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps the coding-agent inset of the three files hidden until the page switches to that view', () => {
    // ARRANGE
    const expected = {
      hidden: true,
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
    expect({ hidden: inset.hasClass('hidden'), files }).toEqual(expected);
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
