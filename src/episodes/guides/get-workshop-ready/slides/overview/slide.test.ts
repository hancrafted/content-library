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
 * Overview (Spec Option 1a, the checklist of feedback round 2), read through the one interface the page reads a Slide by: localized into a stand-in Guide
 * on the shared Slide header, its notes and Voice script as the drawer gets them and its Scene as the page renders it.
 * The section slides are stand-ins, so the test reaches no Guide file; the card and the technical link land on them.
 */

const standIn = (slug: string, title: string) =>
  slide({ slug, messages: { en: { title }, de: { title } }, content: () => null });

const PLACED = placeSections<Slide>([
  [standIn('your-terminal', 'Your terminal'), standIn('open-your-terminal', 'Open your terminal'), overview],
  [standIn('your-ai-agent', 'Your AI agent'), standIn('install-your-ai-agent', 'Install your AI agent')],
  [standIn('your-folder', 'Your folder'), standIn('download-and-unzip-the-starter-folder', 'Download')],
  [standIn('your-first-skill', 'Your first skill'), standIn('run-your-first-skill', 'Run your first skill')],
  [standIn('the-technical-route', 'The technical route')],
]).flat();

function localized(locale: Locale): LocalizedSlide {
  return localizeSlide(PLACED.find((placed) => placed.slide.slug === 'overview') as never, {
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
      heading: 'Four steps to your first skill',
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
        title: 'Four steps, one chain',
        script:
          'Here is the whole route in four steps: a terminal, an AI agent, a folder and a skill. Each step only works because the one before it works, so when the last one runs, you know the whole chain holds. It takes about twenty minutes. Tick what you already have, and the card on the right tells you which step to start at.',
      },
      {
        title: 'Skip what you have',
        script:
          'Tick the boxes you already have, like an installed AI agent, and the card jumps you to the first step that is still open. And if you would rather build the setup yourself than download it, the last Section is for you, so skip to the end.',
      },
    ];
    // ACT
    const segments = localized('en').voiceScript.map(({ title, script }) => ({ title, script }));
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('carries the one Speaker note that stays, with its sources', () => {
    // ARRANGE
    const expected = [
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

  it('lists four steps with their boxes: 1, 2, 2, 3, 3 and 4 in order, and starts at step 1', () => {
    // ARRANGE
    const expected = { steps: ['1', '2', '3', '4'], boxes: [1, 2, 2, 3, 3, 4].length, start: '1' };
    // ACT
    const $ = scene('en');
    const shape = {
      steps: $('[data-step]')
        .map((_, el) => $(el).attr('data-step'))
        .get(),
      boxes: $('input[type="checkbox"]').length,
      start: $('[data-start-at]').attr('data-start-at'),
    };
    // ASSERT
    expect(shape).toEqual(expected);
  });

  it('links the start card to step 1 and the technical route to the last Section', () => {
    // ARRANGE
    const expected = {
      start: '/guides/get-workshop-ready#your-terminal--open-your-terminal',
      technical: '/guides/get-workshop-ready#the-technical-route',
    };
    // ACT
    const $ = scene('en');
    const links = { start: $('[data-start-at]').attr('href'), technical: $('[data-skip="technical"]').attr('href') };
    // ASSERT
    expect(links).toEqual(expected);
  });

  it('puts a Context marker in the Stuck note only', () => {
    // ARRANGE
    const expected = ['minimal-still-needs-a-way-out'];
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
  it('renders no heading, no toolbar and no "Jump to step 5" skip link in its Scene, since the header shows the title and nothing differs by pick', () => {
    // ARRANGE
    const absent = 'h1, h2, h3, [role="radiogroup"], [data-skip="agent"]';
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
      heading: 'Vier Schritte zu Deinem ersten Skill',
      notes: ['minimal-still-needs-a-way-out'],
      segments: ['four-pieces-one-chain', 'skip-what-you-have'],
      steps: 4,
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
