import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { overview } from './slide';

/*
 * Overview (Spec Option 1b), read through the one interface the page reads a Slide by: localized into a stand-in Guide
 * on the shared Slide header, its notes and Voice script as the drawer gets them and its Scene as the page renders it.
 * The section slides are stand-ins, so the test reaches no Guide file; the two skip links land on them.
 */

const standIn = (slug: string, title: string) =>
  slide({ slug, messages: { en: { title }, de: { title } }, content: () => null });

const PLACED = placeSections<Slide>([
  [standIn('your-terminal', 'Your terminal'), overview],
  [standIn('your-folder', 'Your folder')],
  [standIn('the-technical-route', 'The technical route')],
]).flat();

function localized(locale: Locale): LocalizedSlide {
  return localizeSlide(PLACED[1] as never, {
    episode: 'get-workshop-ready',
    route: '/guides/get-workshop-ready',
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const scene = (locale: Locale) => load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).content)));

describe('success cases', () => {
  it('lists the Spec title in the table of contents and shows its own heading and the Hook on screen', () => {
    // ARRANGE
    const expected = {
      title: 'Overview',
      heading: 'Eight steps to your first skill',
      caption: "You've never opened a terminal. By the end of this page you'll have run your first skill in one.",
    };
    // ACT
    const slideText = localized('en');
    const shown = { title: slideText.title, heading: slideText.header?.title, caption: slideText.header?.caption };
    // ASSERT
    expect(shown).toEqual(expected);
  });

  it('speaks the two Spec Voice script items verbatim, in order', () => {
    // ARRANGE
    const expected = [
      {
        title: 'Four pieces, one chain',
        script:
          'Here is the whole route in four pieces: a terminal, an AI agent, a folder and a skill. Each piece only works because the one before it works, so when the last one runs, you know the whole chain holds. It takes about twenty minutes, and you can stop after any step and come back.',
      },
      {
        title: 'Skip what you have',
        script:
          'If you already have an AI agent installed, jump straight to step five, because nothing before it changes for you. And if you would rather build the setup yourself than download it, the last Section is for you, so skip to the end.',
      },
    ];
    // ACT
    const segments = localized('en').voiceScript.map(({ title, script }) => ({ title, script }));
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('carries the three Spec Speaker notes, each with its sources', () => {
    // ARRANGE
    const expected = [
      { header: 'Say how many steps', urls: ['https://www.w3.org/WAI/tutorials/forms/multi-page/'] },
      { header: 'A head start finishes more', urls: ['https://doi.org/10.1086/500480'] },
      {
        header: 'Minimal still needs a way out',
        urls: ['https://doi.org/10.1006/imms.1993.1081', 'https://doi.org/10.1207/S15326985EP3801_4'],
      },
    ];
    // ACT
    const notes = localized('en').notes.map((note) => ({
      header: note.header,
      urls: (note.sources ?? []).map((source) => source.url),
    }));
    // ASSERT
    expect(notes).toEqual(expected);
  });

  it('draws the route as four pieces holding the seven steps in order, step 1 done and step 2 in focus', () => {
    // ARRANGE
    const expected = {
      pieces: ['terminal', 'agent', 'folder', 'skill'],
      states: ['current', 'upcoming', 'upcoming', 'upcoming'],
      steps: [
        ['1', 'done'],
        ['2', 'current'],
        ['3', 'upcoming'],
        ['4', 'upcoming'],
        ['5', 'upcoming'],
        ['6', 'upcoming'],
        ['7', 'upcoming'],
      ],
    };
    // ACT
    const $ = scene('en');
    const shape = {
      pieces: $('[data-piece]')
        .map((_, el) => $(el).attr('data-piece'))
        .get(),
      states: $('[data-piece]')
        .map((_, el) => $(el).attr('data-state'))
        .get(),
      steps: $('[data-step]')
        .map((_, el) => [[$(el).attr('data-step'), $(el).attr('data-state')]])
        .get(),
    };
    // ASSERT
    expect(shape).toEqual(expected);
  });

  it('jumps the AI agent piece to the folder Section and sends the technical route to the last Section', () => {
    // ARRANGE
    const expected = {
      agent: '/guides/get-workshop-ready#your-folder',
      technical: '/guides/get-workshop-ready#the-technical-route',
    };
    // ACT
    const $ = scene('en');
    const links = {
      agent: $('[data-skip="agent"]').attr('href'),
      technical: $('[data-skip="technical"]').attr('href'),
    };
    // ASSERT
    expect(links).toEqual(expected);
  });

  it('puts a Context marker beside the step count, after step 1 and in the Stuck note, in that order', () => {
    // ARRANGE
    const expected = ['say-how-many-steps', 'a-head-start-finishes-more', 'minimal-still-needs-a-way-out'];
    // ACT
    const $ = scene('en');
    const markers = $('[data-context-ref]')
      .map((_, el) => $(el).attr('data-context-ref'))
      .get();
    // ASSERT
    expect(markers).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('renders no heading and no toolbar in its Scene, since the header shows the title and nothing differs by pick', () => {
    // ARRANGE
    const absent = 'h1, h2, h3, [role="radiogroup"]';
    // ACT
    const $ = scene('en');
    // ASSERT
    expect($(absent)).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('keeps the same notes, segments and step count in German, under German words', () => {
    // ARRANGE
    const expected = {
      heading: 'Acht Schritte zu Deinem ersten Skill',
      notes: ['say-how-many-steps', 'a-head-start-finishes-more', 'minimal-still-needs-a-way-out'],
      segments: ['four-pieces-one-chain', 'skip-what-you-have'],
      steps: 7,
    };
    // ACT
    const de = localized('de');
    const shape = {
      heading: de.header?.title,
      notes: de.notes.map((note) => note.slug),
      segments: de.voiceScript.map((segment) => segment.slug),
      steps: scene('de')('[data-step]').length,
    };
    // ASSERT
    expect(shape).toEqual(expected);
  });
});
