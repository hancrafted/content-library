import { localizeSlide, localizeTitleScene } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import {
  ROBOT_STORY,
  storyAgainstSlides,
  type DrawnSlide,
  type StoryFindings,
} from '@/episodes/components/slide-shared/waterline-echo/robot-story.pure';
import { episodeRef } from '@/episodes/lib/episode-folders';
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
 * Slides as they render. A Slide that adds or drops the robot adds or drops its row. Each Slide renders once; the
 * judgement is `storyAgainstSlides`, and the story's own rules are tested beside it.
 */

const EPISODE = episodeRef(
  'what-lies-below-the-waterline-of-sustainable-ai-skills',
  '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows',
).id;
const LABELS = { ref: 'opens speaker note', marker: (title: string) => `Speaker note: ${title}` };
const PLACED = placeSections<Slide>(episode.sections).flat();

const html = (node: ReactNode) => renderToStaticMarkup(createElement(Fragment, null, node));

function robotsIn(markup: string): readonly string[] {
  const $ = load(markup);
  return $('[data-robot]')
    .toArray()
    .map((robot) => $(robot).attr('data-robot-state') ?? 'unmarked');
}

function drawnSlides(): readonly DrawnSlide[] {
  const context = { episode: EPISODE, locale: 'en', referenceLabels: LABELS, header: 'shared' } as const;
  const title = localizeTitleScene(hero, { ...context, placed: [] });
  const pages = PLACED.map((entry) => {
    const own = localizeSlide(entry, { ...context, placed: PLACED });
    return { slug: entry.slide.slug, robots: robotsIn(html(own.content) + html(entry.slide.presentation?.rear)) };
  });
  return [{ slug: hero.slug, robots: robotsIn(html(title)) }, ...pages];
}

let rendered: StoryFindings | undefined;
function findings(): StoryFindings {
  rendered ??= storyAgainstSlides(drawnSlides());
  return rendered;
}

describe('success cases', () => {
  it("gives every Slide that draws the robot its row in the story, in the Episode's order", () => {
    // ARRANGE
    const expected = ROBOT_STORY.map(({ slide }) => slide);
    // ACT
    const { drawn } = findings();
    // ASSERT
    expect(drawn).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('fails a Slide that draws the robot in any state but its row', () => {
    // ARRANGE
    const expected: readonly string[] = [];
    // ACT
    const { strays } = findings();
    // ASSERT
    expect(strays).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('has no row for a Slide the Episode does not hold', () => {
    // ARRANGE
    const expected: readonly string[] = [];
    // ACT
    const { unheld } = findings();
    // ASSERT
    expect(unheld).toEqual(expected);
  });
});
