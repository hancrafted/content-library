import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { fiveMovesToBriefAFreelancerSection } from './five-moves-to-brief-a-freelancer';

/*
 * The Section "How do we work with this freelancer?" as the CyberForum webinar presents it, read through the page's own
 * interface: each Slide localized into this Episode and its Scene rendered. German keeps the English acronyms, so the
 * moves spell BRIEF and the traits PRICE; the Workflow is the summer party, drawn in stages.
 */

const PLACED = placeSections<Slide>([fiveMovesToBriefAFreelancerSection]).flat();

/** A Slide's Scene as the page renders it, with the shared Slide header. */
function sceneOf(slug: string, locale: Locale) {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  const localized = localizeSlide(own, {
    episode: episodeRef('onboard-ai-every-time', '2026-10-28-cyberforum-akademie-intro-agentic-workflow').id,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(localized.content));
}

/** The letters a Scene sets off as an acronym, in reading order. */
const initialsOf = ($: ReturnType<typeof sceneOf>, attribute: string): string =>
  $(`[${attribute}]`)
    .map((_, letter) => $(letter).text())
    .get()
    .join('');

describe('success cases', () => {
  it('spells BRIEF on the moves of the section slide in German', () => {
    // ARRANGE
    const expected = 'BRIEF';
    // ACT
    const $ = sceneOf('five-moves-to-brief-a-freelancer', 'de');
    // ASSERT
    expect(initialsOf($, 'data-move-initial')).toBe(expected);
  });

  it('spells BRIEF down the moves of "Manage the price" in German', () => {
    // ARRANGE
    const expected = 'BRIEF';
    // ACT
    const $ = sceneOf('manage-the-price', 'de');
    // ASSERT
    expect(initialsOf($, 'data-move-initial')).toBe(expected);
  });

  it('spells PRICE across the traits of "Manage the price" in German', () => {
    // ARRANGE
    const expected = 'PRICE';
    // ACT
    const $ = sceneOf('manage-the-price', 'de');
    // ASSERT
    expect(initialsOf($, 'data-trait-initial')).toBe(expected);
  });

  it('draws the summer-party Workflow in the Stages view, with the Interview chat and its forgotten question', () => {
    // ARRANGE
    const expected = { workflow: 'summer-party', stages: 1, chat: 1 };
    // ACT
    const $ = sceneOf('first-human-in-the-loop-agentic-workflow', 'en');
    // ASSERT
    expect({
      workflow: $('[data-human-in-the-loop]').attr('data-human-in-the-loop'),
      stages: $('ol[data-view="stages"]').length,
      chat: $('dialog [data-forgotten="true"]').length,
    }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('renders no heading in a Scene, since the shared Slide header owns it', () => {
    // ARRANGE
    const slugs = ['five-moves-to-brief-a-freelancer', 'manage-the-price', 'first-human-in-the-loop-agentic-workflow'];
    // ACT
    const withHeading = slugs.filter((slug) => sceneOf(slug, 'de')('h1, h2, h3').length > 0);
    // ASSERT
    expect(withHeading).toEqual([]);
  });
});

describe('edge cases', () => {
  it('spells the same acronyms in English as in German', () => {
    // ARRANGE
    const expected = { moves: 'BRIEF', traits: 'PRICE', section: 'BRIEF' };
    // ACT
    const matrix = sceneOf('manage-the-price', 'en');
    const section = sceneOf('five-moves-to-brief-a-freelancer', 'en');
    // ASSERT
    expect({
      moves: initialsOf(matrix, 'data-move-initial'),
      traits: initialsOf(matrix, 'data-trait-initial'),
      section: initialsOf(section, 'data-move-initial'),
    }).toEqual(expected);
  });
});
