import { localizeTitleScene } from '@/episodes/components/slide-master/localized-slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { hero } from './slide';

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
const sceneOf = (locale: Locale) =>
  load(
    renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        localizeTitleScene(hero, {
          episode: episodeRef(
            'what-lies-below-the-waterline-of-sustainable-ai-skills',
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

  it('names only the Surface on the depth gauge, in its plain word', () => {
    // ARRANGE
    const expected = { zones: ['Surface'], current: ['surface'], reading: 'Surface' };
    // ACT
    const $ = sceneOf('en');
    const seen = {
      zones: $('[data-depth-gauge] [data-zone-label]')
        .toArray()
        .map((zone) => $(zone).text()),
      current: $('[data-depth-gauge] [data-gauge-zone][data-current]')
        .toArray()
        .map((zone) => $(zone).attr('data-gauge-zone')),
      reading: $('[data-depth-gauge] [data-gauge-reading]').text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws the whole depth full-bleed in the Backdrop and keeps every word a reader needs out of it', () => {
    // ARRANGE
    const expected = { drawings: 1, wordsInBackdrop: 0, gauge: 1, pill: 1, described: 1 };
    // ACT
    const $ = sceneOf('en');
    const backdrop = $('[data-slot="slide-backdrop"]');
    const seen = {
      drawings: backdrop.find('svg[data-hero-depth]').length,
      wordsInBackdrop: backdrop.find('[data-depth-gauge], [data-you-are-here], [data-view-toggle], p, button').length,
      gauge: $('[data-hero-overlay] [data-depth-gauge]').length,
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

  it("drifts the sky's clouds in three layers, far, mid and near, as the Section titles' sky does (decision 9)", () => {
    // ARRANGE
    const expected = ['far', 'mid', 'near'];
    // ACT
    const $ = sceneOf('en');
    const layers = [
      ...new Set(
        $('[data-hero-depth] [data-cloud]')
          .toArray()
          .map((cloud) => $(cloud).attr('data-cloud-layer')),
      ),
    ].sort();
    // ASSERT
    expect(layers).toEqual(expected);
  });

  it('ends the Abyss on the faceted seabed, across the drawing and mirrored across the bleed each side', () => {
    // ARRANGE
    const expected = { seabeds: 3, abyssLast: 'abyss' };
    // ACT
    const $ = sceneOf('en');
    const seen = {
      seabeds: $('[data-hero-depth] [data-seabed]').length,
      abyssLast: $('[data-depth-band]').last().attr('data-depth-band'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('draws the water under the waterline at half the facet density before feedback 2, its bleed faceted too', () => {
    // ARRANGE
    const trianglesPerDrawing = 40;
    const drawingWidths = 3;
    const expected = trianglesPerDrawing * drawingWidths;
    // ACT
    const $ = sceneOf('en');
    const triangles = $('[data-depth-band] [data-band="water"] polygon').length;
    // ASSERT
    expect(triangles).toBe(expected);
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

  it('rocks the ship and flies its pennant, the Surface loop, and nothing else of the cast', () => {
    // ARRANGE
    const expected = ['ambient', 'ambient'];
    // ACT
    const $ = sceneOf('en');
    const rocking = $('[data-ship] [data-motion]')
      .toArray()
      .map((part) => $(part).attr('data-motion'));
    // ASSERT
    expect(rocking).toEqual(expected);
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

  it('leaves the page-wide view control to persistent chrome rather than the removable hero', () => {
    // ARRANGE
    const selector = '[data-view-toggle]';
    // ACT
    const $ = sceneOf('en');
    const controls = $(selector).length;
    // ASSERT
    expect(controls).toBe(0);
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
