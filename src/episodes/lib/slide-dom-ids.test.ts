import { EPISODES_PATH_SLUGS, type EpisodesPathSlug } from '@/content-store/catalogue/record-routes';
import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { headerModeOf, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { findPageRecord } from './tooling-pages';

/*
 * A copied Slide must never break `aria-labelledby` (#51): the same layout
 * may sit twice on one page, so every DOM id a Slide renders comes from
 * `useId`, not from a string written in its Scene. Each Slide's Scene is
 * rendered twice into one page with its own kit; no id may repeat.
 */

interface PlacedSlide {
  readonly episode: EpisodesPathSlug;
  readonly slide: Slide;
}

/** Every Slide of every registered Episode and tooling page. */
function allSlides(): PlacedSlide[] {
  return EPISODES_PATH_SLUGS.flatMap((episode) =>
    findPageRecord(episode)
      .sections.flat()
      .map((slide) => ({ episode, slide })),
  );
}

/** The Slide's Scene as the page renders it in English, localized into its own Episode. */
function scene({ episode, slide }: PlacedSlide) {
  const placed = placeSections<Slide>(findPageRecord(episode).sections).flat();
  const own = placed.find((entry) => entry.slide === slide);
  if (own === undefined) throw new Error(`No Slide "${slide.slug}" in "${episode}".`);
  const header = headerModeOf(findPageRecord(episode));
  return localizeSlide(own, {
    episode,
    locale: 'en',
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header,
  }).content;
}

/** Every `id="..."` in rendered markup, in document order. */
function idsOf(html: string): string[] {
  return [...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
}

/** The ids that appear more than once. */
function repeated(ids: readonly string[]): string[] {
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}

describe('success cases', () => {
  it('points every aria-labelledby of a twice-rendered grid Slide at an id in its own copy', () => {
    // ARRANGE
    const grid = allSlides().find(({ episode, slide }) => episode === 'slide-master' && slide.slug === 'grid-2x2');
    if (grid === undefined) throw new Error('No grid-2x2 Slide in slide-master.');
    const expected = 8;
    // ACT
    const html = renderToStaticMarkup(createElement(Fragment, null, scene(grid), scene(grid)));
    const labels = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map(([, id]) => id);
    const dangling = labels.filter((id) => !idsOf(html).includes(id));
    // ASSERT
    expect(new Set(labels).size).toBe(expected);
    expect(dangling).toEqual([]);
  });
});

describe('failure cases', () => {
  it.each(allSlides().map((placed) => [`${placed.episode}/${placed.slide.slug}`, placed] as const))(
    'repeats no DOM id when %s sits twice on one page',
    (_, placed) => {
      // ARRANGE
      const page = createElement(Fragment, null, scene(placed), scene(placed));
      const expected: string[] = [];
      // ACT
      const ids = idsOf(renderToStaticMarkup(page));
      // ASSERT
      expect(repeated(ids)).toEqual(expected);
    },
  );
});

describe('edge cases', () => {
  it('walks every slide-master Slide, so an empty walk cannot pass', () => {
    // ARRANGE
    const expected = 20;
    // ACT
    const count = allSlides().filter((placed) => placed.episode === 'slide-master').length;
    // ASSERT
    expect(count).toBe(expected);
  });
});
