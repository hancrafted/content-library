import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { fiveMovesToBriefAFreelancerSection } from './five-moves-to-brief-a-freelancer';

const PLACED = placeSections<Slide>([fiveMovesToBriefAFreelancerSection]).flat();

function localizedOf(slug: string, locale: Locale) {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  const localized = localizeSlide(own, {
    episode: episodeRef('onboard-ai-every-time').id,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return localized;
}

const sceneOf = (slug: string, locale: Locale) => load(renderToStaticMarkup(localizedOf(slug, locale).content));

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

  it('mounts the Explorable on the BRIEF x PRICE Agent matrix in "Manage the price"', () => {
    // ARRANGE
    const expected = { explorable: 'brief-or-pay-the-price', level: 'agent' };
    // ACT
    const $ = sceneOf('manage-the-price', 'de');
    // ASSERT
    expect({
      explorable: $('[data-explorable]').attr('data-explorable'),
      level: $('[data-explorable]').attr('data-level'),
    }).toEqual(expected);
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

  it('circles the BRIEF moves each stage applies: B I, R I E, E F, E', () => {
    // ARRANGE
    const expected = ['BI', 'RIE', 'EF', 'E'];
    // ACT
    const $ = sceneOf('first-human-in-the-loop-agentic-workflow', 'de');
    const perStage = $('ol[data-view="stages"] > li')
      .map((_, stage) =>
        $(stage)
          .find('[data-move]')
          .map((__, circle) => $(circle).attr('data-move'))
          .get()
          .join(''),
      )
      .get();
    // ASSERT
    expect(perStage).toEqual(expected);
  });

  it('opens one speech bubble per stage, and the fresh-chat note from the caption', () => {
    // ARRANGE
    const expected = { perStage: [1, 1, 1, 1], caption: 'plan-then-fresh-session' };
    // ACT
    const $ = sceneOf('first-human-in-the-loop-agentic-workflow', 'de');
    const perStage = $('ol[data-view="stages"] > li')
      .map((_, stage) => $(stage).find('[data-context-ref]').length)
      .get();
    const caption = localizedOf('first-human-in-the-loop-agentic-workflow', 'de').header?.captionNote?.note;
    // ASSERT
    expect({ perStage, caption }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('renders no heading in a Scene, since the shared Slide header owns it', () => {
    // ARRANGE
    const slugs = ['five-moves-to-brief-a-freelancer', 'first-human-in-the-loop-agentic-workflow'];
    // ACT
    const withHeading = slugs.filter((slug) => sceneOf(slug, 'de')('h1, h2, h3').length > 0);
    // ASSERT
    expect(withHeading).toEqual([]);
  });
});

describe('edge cases', () => {
  it('spells the same acronym in English as in German on the section slide', () => {
    // ARRANGE
    const expected = 'BRIEF';
    // ACT
    const section = sceneOf('five-moves-to-brief-a-freelancer', 'en');
    // ASSERT
    expect(initialsOf(section, 'data-move-initial')).toBe(expected);
  });
});
