import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatYoureLookingAt } from './slide';

/*
 * What you're looking at, read through the one interface the page reads a Slide by: localized into a stand-in Guide on
 * the shared Slide header. Its Scene renders as the static export renders it: before the viewer points at anything,
 * so on the first part (the prompt) and the toolbar's defaults (Mac, Claude Code). Which part is active is
 * `anatomy.pure.ts`'s.
 */

const SECTION = slide({
  slug: 'your-terminal',
  messages: { en: { title: 'Your terminal' }, de: { title: 'Dein Terminal' } },
  content: () => null,
});

const PLACED = placeSections<Slide>([[SECTION, whatYoureLookingAt]]).flat();

function localized(locale: Locale): LocalizedSlide {
  return localizeSlide(PLACED[1] as never, {
    episode: 'setup-ai-agent-and-starter-folder',
    route: '/guides/setup-ai-agent-and-starter-folder',
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const scene = (locale: Locale) => load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).content)));

const help = (locale: Locale) =>
  load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).header?.action)));

describe('success cases', () => {
  it('lists the title and shows it on screen with its caption', () => {
    // ARRANGE
    const expected = { title: "What you're looking at", heading: "What you're looking at" };
    // ACT
    const slideText = localized('en');
    const shown = { title: slideText.title, heading: slideText.header?.title };
    // ASSERT
    expect(shown).toEqual(expected);
  });

  it('draws the five parts, each with a button in the window and a callout, and starts on the prompt', () => {
    // ARRANGE
    const expected = {
      buttons: ['close', 'command', 'output', 'prompt', 'cursor'],
      callouts: ['close', 'command', 'output', 'prompt', 'cursor'],
      pressed: ['prompt'],
      explanation:
        'Prompt. This says "I\'m ready for your next command". The letters in front show who and where you are; you can ignore them.',
    };
    // ACT
    const $ = scene('en');
    const found = {
      buttons: $('button[data-part]')
        .map((_, el) => $(el).attr('data-part'))
        .get(),
      callouts: $('[data-callout]')
        .map((_, el) => $(el).attr('data-callout'))
        .get(),
      pressed: $('button[data-part][aria-pressed="true"]')
        .map((_, el) => $(el).attr('data-part'))
        .get(),
      explanation: $('[data-explanation]').text(),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('shows the Mac prompt until the viewer picks, and starts the tour with Previous off and Next on', () => {
    // ARRANGE
    const expected = { prompt: 'you@MacBook ~ %', previousOff: true, nextOff: false };
    // ACT
    const $ = scene('en');
    const found = {
      prompt: $('[data-anatomy] .font-mono span').first().text(),
      previousOff: $('[data-step="previous"]').is(':disabled'),
      nextOff: $('[data-step="next"]').is(':disabled'),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('says you cannot break anything and how to leave', () => {
    // ARRANGE
    const expected =
      "You can't break anything hereClosing the window ends it. To leave, close the window like any other.";
    // ACT
    const text = scene('en')('[data-target="safe"]').text().replace(/\s+/g, ' ').trim();
    // ASSERT
    expect(text).toContain(expected);
  });

  it('gives the header a Help button and carries the one Speaker note and three Voice script segments', () => {
    // ARRANGE
    const expected = {
      button: 'Help',
      notes: [{ header: 'Try it and see', urls: ['https://ctiber.github.io/papers/2022/VBetAl_ITICSE_2022.pdf'] }],
      segments: ['five-parts', 'point-at-anything', 'you-cant-break-it'],
    };
    // ACT
    const en = localized('en');
    const found = {
      button: help('en')('[data-help-button]').text(),
      notes: en.notes.map((note) => ({ header: note.header, urls: (note.sources ?? []).map((source) => source.url) })),
      segments: en.voiceScript.map((segment) => segment.slug),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('renders no heading and no AI agent group, since none is picked yet', () => {
    // ARRANGE
    const expected = { headings: 0, disabled: { os: 'false', agent: undefined } };
    // ACT
    const $ = scene('en');
    const found = {
      headings: $('h1, h2, h3').length,
      disabled: {
        os: $('[data-pick="os"]').attr('aria-disabled'),
        agent: $('[data-pick="agent"]').attr('aria-disabled'),
      },
    };
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('shows the same five parts and the same notes and segments in German', () => {
    // ARRANGE
    const expected = {
      explanation: 'Eingabezeile.',
      parts: 5,
      button: 'Hilfe',
      notes: ['try-and-see-what-happens'],
      segments: ['five-parts', 'point-at-anything', 'you-cant-break-it'],
    };
    // ACT
    const $ = scene('de');
    const de = localized('de');
    const found = {
      explanation: $('[data-explanation] .font-semibold').text(),
      parts: $('button[data-part]').length,
      button: help('de')('[data-help-button]').text(),
      notes: de.notes.map((note) => note.slug),
      segments: de.voiceScript.map((segment) => segment.slug),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });
});
