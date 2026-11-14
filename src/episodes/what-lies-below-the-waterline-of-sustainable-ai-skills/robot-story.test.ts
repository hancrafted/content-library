import { localizeSlide, localizeTitleScene } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { ROBOT_STORY } from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { placeSections } from '@/episodes/lib/episode.pure';
import { load } from 'cheerio';
import { createElement, Fragment, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatLiesBelowTheWaterlineOfSustainableAiSkills as episode } from './episode';
import { hero } from './slides/hero/slide';

/*
 * The robot story table against the Episode itself (feedback 3, decision 42): every Slide that draws the robot has its
 * row, in the Episode's order, so the story's rule that the robot never climbs back out of the water holds for the
 * Slides as they render. A Slide that adds or drops the robot adds or drops its row.
 */

const EPISODE = 'what-lies-below-the-waterline-of-sustainable-ai-skills';
const LABELS = { ref: 'opens speaker note', marker: (title: string) => `Speaker note: ${title}` };
const PLACED = placeSections<Slide>(episode.sections).flat();

const html = (node: ReactNode) => renderToStaticMarkup(createElement(Fragment, null, node));
const drawsRobot = (markup: string) => load(markup)('[data-robot]').length > 0;

/** The slugs of every Slide whose content or rear decoration draws the robot, Title slide first. */
function slidesWithRobot(): readonly string[] {
  const title = localizeTitleScene(hero, {
    episode: EPISODE,
    locale: 'en',
    placed: [],
    referenceLabels: LABELS,
    header: 'shared',
  });
  const pages = PLACED.filter((entry) => {
    const own = localizeSlide(entry, {
      episode: EPISODE,
      locale: 'en',
      placed: PLACED,
      referenceLabels: LABELS,
      header: 'shared',
    });
    return drawsRobot(html(own.content) + html(entry.slide.presentation?.rear));
  }).map((entry) => entry.slide.slug);
  return [...(drawsRobot(html(title)) ? [hero.slug] : []), ...pages];
}

describe('success cases', () => {
  it("gives every Slide that draws the robot its row in the story, in the Episode's order", () => {
    // ARRANGE
    const expected = ROBOT_STORY.map(({ slide }) => slide);
    // ACT
    const drawn = slidesWithRobot();
    // ASSERT
    expect(drawn).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('has no row for a Slide the Episode does not hold', () => {
    // ARRANGE
    const held = new Set([hero.slug, ...PLACED.map(({ slide }) => slide.slug)]);
    // ACT
    const strays = ROBOT_STORY.filter(({ slide }) => !held.has(slide)).map(({ slide }) => slide);
    // ASSERT
    expect(strays).toEqual([]);
  });
});

describe('edge cases', () => {
  it('lists each Slide once, even a Slide that draws the robot twice', () => {
    // ARRANGE
    const slugs = ROBOT_STORY.map(({ slide }) => slide);
    // ACT
    const repeated = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    // ASSERT
    expect(repeated).toEqual([]);
  });
});
