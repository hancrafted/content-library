import { isSelfContainedSlide, type SelfContainedSlide } from '@/components/slide-master/slide';
import { ownTranslator, slideKit } from '@/components/slide-master/slide-kit';
import { EPISODE_SLUGS, type EpisodeSlug } from '@/lib/routes';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { findEpisode } from './registry';

/*
 * A copied Slide must never break `aria-labelledby` (#51): the same layout
 * may sit twice on one page, so every DOM id a Slide renders comes from
 * `useId`, not from a string written in its Scene. Each Slide's Scene is
 * rendered twice into one page with its own kit; no id may repeat.
 */

interface PlacedSlide {
  readonly episode: EpisodeSlug;
  readonly slide: SelfContainedSlide;
}

/** Every self-contained Slide of every registered Episode. */
function selfContainedSlides(): PlacedSlide[] {
  return EPISODE_SLUGS.flatMap((episode) =>
    findEpisode(episode)
      .sections.flat()
      .filter(isSelfContainedSlide)
      .map((slide) => ({ episode, slide })),
  );
}

/** The Slide's Scene as the page renders it in English, with a kit the container would build. */
function scene({ episode, slide }: PlacedSlide) {
  const slugs = findEpisode(episode)
    .sections.flat()
    .map(({ slug }) => slug);
  const kit = slideKit(
    { episode, locale: 'en', anchors: new Map(slugs.map((slug) => [slug, slug])), refLabel: 'opens speaker note' },
    {
      t: ownTranslator(slide.messages.en, 'en'),
      level: 'h3',
      notes: slide.notes.map(({ slug }) => slug),
      slideId: slide.slug,
    },
  );
  return slide.content(kit);
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
    const grid = selfContainedSlides().find(
      ({ episode, slide }) => episode === 'slide-master' && slide.slug === 'grid-2x2',
    );
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
  it.each(selfContainedSlides().map((placed) => [`${placed.episode}/${placed.slide.slug}`, placed] as const))(
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
  it('walks every slide-master and slide-layouts Slide, so an empty walk cannot pass', () => {
    // ARRANGE
    const expected = { 'slide-layouts': 3, 'slide-master': 20 };
    // ACT
    const slides = selfContainedSlides();
    const count = (episode: EpisodeSlug) => slides.filter((placed) => placed.episode === episode).length;
    // ASSERT
    expect({ 'slide-layouts': count('slide-layouts'), 'slide-master': count('slide-master') }).toEqual(expected);
  });
});
