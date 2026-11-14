import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatLiesBelowTheWaterlineOfSustainableAiSkills } from '../episode';

/*
 * The section slides of "What lies below the waterline of sustainable AI skills", as the approved Spec gives them: one
 * per Section, in Spec order, each titled by its Section's h2, carrying its Voice script segments, and each Scene one
 * echo of picked Title-slide Option 0a: the Section's card at its zone's depth, drawn by ZoneScene with the robot on
 * its cable and the whole depth ruler, the Section's tile lit (design-ADR-0025).
 */

const EPISODE = 'what-lies-below-the-waterline-of-sustainable-ai-skills';
const SECTIONS = whatLiesBelowTheWaterlineOfSustainableAiSkills.sections;
const OPENERS = SECTIONS.map(([opener]) => opener as Slide);
const PLACED = placeSections<Slide>(SECTIONS.map(([opener]) => [opener as Slide])).flat();

/** A section slide's Scene as the page renders it under the shared Slide header. */
function sceneOf(slug: string, locale: Locale = 'en') {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No section slide "${slug}".`);
  const localized = localizeSlide(own, {
    episode: EPISODE,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

/** A section slide's title and Voice script segment titles in one locale. */
function scriptOf(slide: Slide, locale: Locale) {
  const messages = slide.messages[locale] as {
    title: string;
    voiceScript: { segments: Record<string, { title: string; script: string }> };
  };
  return {
    title: messages.title,
    segments: slide.segments.map(({ slug }) => messages.voiceScript.segments[slug]?.title),
  };
}

describe('success cases', () => {
  it('opens the eight Sections in Spec order, each titled and scripted as the Spec writes it', () => {
    // ARRANGE
    const expected = [
      { title: 'A thought experiment', segments: ['You are the captain', 'One settled condition'] },
      { title: 'What a skill is', segments: ['Surface first', 'The mechanics, plainly'] },
      { title: 'When to write one', segments: ['Sunlight', 'Borrowed principles', 'Why a rule of thumb'] },
      { title: 'The description', segments: ['The label decides', 'Name, description'] },
      { title: 'What context goes inside', segments: ['Twilight', 'A decision, not a law'] },
      { title: 'What context stays beside', segments: ['Beside, not inside', 'Where it gets shared'] },
      { title: 'Sharing it', segments: ['Midnight', 'Three jobs'] },
      { title: 'Keeping it alive', segments: ['The Abyss', 'Nobody sees it'] },
    ];
    // ACT
    const actual = OPENERS.map((slide) => scriptOf(slide, 'en'));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('holds each Section in its own placement marker, its section slide alone', () => {
    // ARRANGE
    const expected = [3, 1, 1, 4, 1, 1, 1, 5];
    // ACT
    const actual = SECTIONS.map((section) => section.length);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('sets each section slide at its zone, as the Brief assigns the Sections to depths', () => {
    // ARRANGE
    const expected = ['surface', 'surface', 'sunlit', 'sunlit', 'twilight', 'twilight', 'midnight', 'abyss'];
    // ACT
    const actual = OPENERS.map(({ slug }) => sceneOf(slug)('[data-scene]').attr('data-depth-zone'));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('leads each card with its AI statement, as the echoes of Option 0a do', () => {
    // ARRANGE
    const expected = [
      'Unless you write it down, every conversation with AI starts from zero',
      'A skill is a name, a description and instructions',
      'The third time, write the skill down',
      'The description is all the AI sees',
      'Domain knowledge goes inside, tied to the step that needs it',
      'Project details stay beside the skill',
      'A shared skill needs an owner, a version, a review date',
      'Keeping a skill right costs you every month',
    ];
    // ACT
    const actual = OPENERS.map(({ slug }) => sceneOf(slug)('[data-ai-statement]').text());
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the grounding line on When to write one alone', () => {
    // ARRANGE
    const expected = [0, 0, 1, 0, 0, 0, 0, 0];
    // ACT
    const actual = OPENERS.map(({ slug }) => sceneOf(slug)('[data-grounding]').length);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('declares no Speaker note on a section slide, since the picked Option shows no Context marker', () => {
    // ARRANGE
    const expected = [0, 0, 0, 0, 0, 0, 0, 0];
    // ACT
    const actual = OPENERS.map((slide) => slide.notes.length);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('lights only its own Section on the ruler, never a neighbour', () => {
    // ARRANGE
    const expected = [['0'], ['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7']];
    // ACT
    const actual = OPENERS.map(({ slug }) => {
      const $ = sceneOf(slug);
      return $('[data-tile][data-lit]')
        .toArray()
        .map((tile) => $(tile).attr('data-section'));
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('scripts every German section slide segment by segment, as English does', () => {
    // ARRANGE
    const expected = [
      ['Du bist der Kapitän', 'Eine feste Eigenschaft'],
      ['Erst die Oberfläche', 'Die Mechanik, ganz nüchtern'],
      ['Sonnenlicht', 'Geliehene Prinzipien', 'Warum eine Faustregel'],
      ['Das Etikett entscheidet', 'Name, Beschreibung'],
      ['Dämmerung', 'Eine Entscheidung, kein Gesetz'],
      ['Daneben, nicht darin', 'Wo er geteilt wird'],
      ['Mitternacht', 'Drei Aufgaben'],
      ['Die Tiefsee', 'Niemand sieht es'],
    ];
    // ACT
    const actual = OPENERS.map((slide) => scriptOf(slide, 'de').segments);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps both view lines on each card, the analogy for Chat app and the file line for Coding agent', () => {
    // ARRANGE
    const expected = [
      {
        chat: ['Your pilot is the AI model: ten years of skill, no memory of yesterday.'],
        coding: ['Each session begins with a fresh context window'],
      },
      {
        chat: ['A procedure card: title, use-when line, steps.'],
        coding: ['SKILL.md, plus scripts/ references/ assets/'],
      },
      {
        chat: ['Explain the sample, refine it, write the card.'],
        coding: ['Ask the agent to turn this conversation into a skill'],
      },
      {
        chat: ['The index is open, every card behind it closed.'],
        coding: ['SKILL.md: name and description load first'],
      },
      {
        chat: ['The card in its sleeve: each extra tied to its step.'],
        coding: ['references/ and assets/ load when a step needs them'],
      },
      {
        chat: ["Same card, any site: today's dive plan says 120 m."],
        coding: ['The step reads a project file, such as CONTEXT.md, when it runs'],
      },
      { chat: ["The card in the institute's fleet manual."], coding: ['metadata: owner, version, review date'] },
      {
        chat: ['A card with a running tag, like a loan statement.'],
        coding: ['Same in both views: the tag is the upkeep'],
      },
    ];
    // ACT
    const actual = OPENERS.map(({ slug }) => {
      const $ = sceneOf(slug);
      const lines = (view: string) =>
        $(`[data-view="${view}"]`)
          .toArray()
          .map((line) => $(line).text());
      return { chat: lines('chat'), coding: lines('coding') };
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names the five zones on every ruler by their ocean terms, read from each Slide in its own words', () => {
    // ARRANGE
    const terms = [
      'the sea surface and the air above it',
      'epipelagic',
      'mesopelagic',
      'bathypelagic',
      'abyssopelagic',
    ];
    const expected = [terms, terms, terms, terms, terms, terms, terms, terms];
    // ACT
    const actual = OPENERS.map(({ slug }) => {
      const $ = sceneOf(slug);
      return $('[data-ocean-term]')
        .toArray()
        .map((term) => $(term).text());
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names the zone over each card in German too', () => {
    // ARRANGE
    const expected = [
      'Oberfläche',
      'Oberfläche',
      'Sonnenlichtzone',
      'Sonnenlichtzone',
      'Dämmerzone',
      'Dämmerzone',
      'Mitternachtszone',
      'Abyssal',
    ];
    // ACT
    const actual = OPENERS.map(({ slug }) => sceneOf(slug, 'de')('[data-echo-zone]').text());
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
