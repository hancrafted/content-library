import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { openYourTerminal } from './slide';

/*
 * Open your terminal (Spec Option 2a), read through the one interface the page reads a Slide by: localized into a
 * stand-in Guide on the shared Slide header. Its Scene renders as the static export renders it: before the viewer
 * picks, so on the toolbar's defaults (Mac, Claude Code). Which pick shows which view is `os-pick.pure.ts`'s.
 */

const SECTION = slide({
  slug: 'your-terminal',
  messages: { en: { title: 'Your terminal' }, de: { title: 'Dein Terminal' } },
  content: () => null,
});

const PLACED = placeSections<Slide>([[SECTION, openYourTerminal]]).flat();

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

/** The Help button and panel the Slide gives the header, as the header renders them. */
const help = (locale: Locale) =>
  load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).header?.action)));

describe('success cases', () => {
  it('lists the Spec title and shows it on screen, under the Spec caption', () => {
    // ARRANGE
    const expected = {
      title: 'Open your terminal',
      heading: 'Open your terminal',
      caption: 'Open it, look at it, done: a blinking cursor in an empty window means it worked.',
    };
    // ACT
    const slideText = localized('en');
    const shown = { title: slideText.title, heading: slideText.header?.title, caption: slideText.header?.caption };
    // ASSERT
    expect(shown).toEqual(expected);
  });

  it('speaks the three Spec Voice script items verbatim, in order', () => {
    // ARRANGE
    const expected = [
      {
        title: 'Not a personal failing',
        script:
          'If opening a terminal feels a little odd, that is a common reaction, and I would not read it as a sign that you are bad with computers. I think the fear comes from the blank window that gives you no hint what to press, and that is my hypothesis, not a proven fact. Nothing here asks you to prove anything, we only open the window and look at it.',
      },
      {
        title: 'One window, one cursor',
        script:
          'Pick your system in the toolbar, then open Terminal on a Mac, PowerShell on Windows, or the terminal on Linux. It takes one shortcut and a few letters. You will see a mostly empty window with a blinking cursor, and that is exactly what success looks like here. It is not frozen, it is waiting for you.',
      },
      {
        title: 'Stuck? Paste it',
        script:
          'If something looks different on your screen, you do not have to work it out alone. Press Help at the top right of the slide, paste what you see, and it wraps your system, your AI agent and the step into a prompt you can hand to a free ChatGPT or Gemini. Every step has that button, so asking for help is part of the route.',
      },
    ];
    // ACT
    const segments = localized('en').voiceScript.map(({ title, script }) => ({ title, script }));
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('carries the four Spec Speaker notes, each with its source', () => {
    // ARRANGE
    const expected = [
      { header: 'Hesitation is normal', urls: ['https://doi.org/10.1016/j.chb.2013.05.012'] },
      { header: 'Why the command line feels scary', urls: ['https://arxiv.org/abs/1905.13582'] },
      { header: 'Setup is the hard part', urls: ['https://doi.org/10.12688/f1000research.3-62.v2'] },
      {
        header: 'Feedback builds confidence',
        urls: ['https://ctiber.github.io/papers/2022/VBetAl_ITICSE_2022.pdf'],
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

  it('gives the header a Help button, closed, with the field, Copy prompt and the two chats in its panel', () => {
    // ARRANGE
    const expected = { button: 'Help', expanded: 'false', fields: 1, chats: ['ChatGPT', 'Gemini'] };
    // ACT
    const $ = help('en');
    const found = {
      button: $('[data-help-button]').text(),
      expanded: $('[data-help-button]').attr('aria-expanded'),
      fields: $('[data-help-panel] textarea').length,
      chats: $('[data-help-panel] a[data-chat]')
        .map((_, el) => $(el).attr('data-chat'))
        .get(),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('shows the Mac way in and the Mac prompt until the viewer picks, with Mac checked in the toolbar', () => {
    // ARRANGE
    const expected = {
      checked: 'Mac',
      prompt: 'you@MacBook ~ %',
      query: 'Terminal',
    };
    // ACT
    const $ = scene('en');
    const view = {
      checked: $('[data-pick="os"] input:checked').attr('aria-label'),
      prompt: $('[data-open-window] [data-prompt-line]').text(),
      query: $('[data-find] [data-query]').text(),
    };
    // ASSERT
    expect(view).toEqual(expected);
  });

  it('marks the open window, then each of the three reassurance lines, with its Speaker note', () => {
    // ARRANGE
    const expected = [
      'feedback-builds-confidence',
      'hesitation-is-normal',
      'why-the-command-line-feels-scary',
      'setup-is-the-hard-part',
    ];
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
  it('shows the Mac way in and this step in German, with the same notes and segments', () => {
    // ARRANGE
    const expected = {
      line: 'Auf dem Mac: Drück ⌘ Leertaste, tipp Terminal, drück Return.',
      button: 'Hilfe',
      notes: [
        'hesitation-is-normal',
        'why-the-command-line-feels-scary',
        'setup-is-the-hard-part',
        'feedback-builds-confidence',
      ],
      segments: ['not-a-personal-failing', 'one-window-one-cursor', 'stuck-paste-it'],
    };
    // ACT
    const $ = scene('de');
    const de = localized('de');
    const shape = {
      line: $('[data-os-line]').text(),
      button: help('de')('[data-help-button]').text(),
      notes: de.notes.map((note) => note.slug),
      segments: de.voiceScript.map((segment) => segment.slug),
    };
    // ASSERT
    expect(shape).toEqual(expected);
  });
});
