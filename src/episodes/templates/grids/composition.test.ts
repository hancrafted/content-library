import { idsOf, renderedSlides, twiceRendered } from '@/episodes/lib/composed-page-render';
import { describe, expect, it } from 'vitest';
import { grids } from './episode';

/*
 * A copied Slide must never break `aria-labelledby` (#51): the same layout may sit twice on one page, so every DOM id
 * a Slide renders comes from `useId`. The Episode-level checks (`episode-checks.test.ts`) hold that no id repeats; this
 * holds that the grid's labels still point into their own copy, and that the Master slide renders every grid layout.
 */

describe('success cases', () => {
  it('points every aria-labelledby of a twice-rendered grid Slide at an id in its own copy', () => {
    // ARRANGE
    const grid = renderedSlides(grids).find(({ slug }) => slug === 'grid-2x2');
    if (grid === undefined) throw new Error('No grid-2x2 Slide in grids.');
    const expected = 8;
    // ACT
    const html = twiceRendered(grids.slug, grids, grid);
    const labels = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map(([, id]) => id);
    const dangling = labels.filter((id) => !idsOf(html).includes(id));
    // ASSERT
    expect(new Set(labels).size).toBe(expected);
    expect(dangling).toEqual([]);
  });
});

describe('failure cases', () => {
  it('renders no grid Slide whose labels point outside the page', () => {
    // ARRANGE
    const html = renderedSlides(grids).map((slide) => twiceRendered(grids.slug, grids, slide));
    // ACT
    const dangling = html.flatMap((page) =>
      [...page.matchAll(/aria-labelledby="([^"]+)"/g)].map(([, id]) => id).filter((id) => !idsOf(page).includes(id)),
    );
    // ASSERT
    expect(dangling).toEqual([]);
  });
});

describe('edge cases', () => {
  it('renders every grid layout, so an empty walk cannot pass', () => {
    // ARRANGE
    const expected = 11;
    // ACT
    const count = renderedSlides(grids).length;
    // ASSERT
    expect(count).toBe(expected);
  });
});
