import { localizeSlide, type LocalizedSlide } from '@/components/slide-master/localized-slide';
import { slide, type Slide } from '@/components/slide-master/slide';
import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { everydayHabits } from './slide';

/*
 * Everyday habits (Spec Option 10a), read through the one interface the page reads a Slide by: localized into an
 * Episode on the shared Slide header, its text, notes and Voice script as the drawer gets them and its Scene as the
 * page renders it. The section slide is a stand-in, so the test reaches no Episode file.
 */

const SECTION = slide({
  slug: 'managing-the-attention-span',
  messages: { en: { title: 'Managing the attention span' }, de: { title: 'Die Aufmerksamkeitsspanne managen' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, everydayHabits]]).flat();
  return localizeSlide(placed[1] as never, {
    episode: 'ai-attention-span',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
    research: [],
  });
}

const scene = (locale: Locale) => load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).content)));

describe('success cases', () => {
  it('speaks one voice segment per card, in card order, the new sixth one about /context', () => {
    // ARRANGE
    const expected = [
      'break-it-down',
      'one-chat-one-job',
      'ask-for-a-handoff',
      'read-and-correct-it',
      'start-the-next-chat-with-it',
      'check-the-context',
    ];
    // ACT
    const segments = localized('en').voiceScript.map(({ slug }) => slug);
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('shows six numbered cards in Han\'s order and no "You know these already" chips', () => {
    // ARRANGE
    const expected = {
      en: [
        'Break it down',
        'New job, fresh chat',
        'Ask for a handoff',
        'Read it, correct it',
        'Start the next chat with it',
        'Check the context if you can',
      ],
      de: [
        'Zerleg es',
        'Neuer Job, neuer Chat',
        'Bitte um eine Übergabe',
        'Lies sie, korrigiere sie',
        'Beginne den nächsten Chat damit',
        'Prüfe den Kontext, wenn Du kannst',
      ],
      chips: 0,
    };
    // ACT
    const titles = (locale: Locale) =>
      scene(locale)('ol > li > p:first-of-type')
        .map((_, el) => scene(locale)(el).text())
        .get();
    // ASSERT
    expect({
      en: titles('en'),
      de: titles('de'),
      chips: scene('en').text().includes('You know these already') ? 1 : 0,
    }).toEqual(expected);
  });

  it('writes the sixth card with /context as code', () => {
    // ARRANGE
    const expected = '/context';
    // ACT
    const code = scene('en')('ol > li:nth-child(6) code').text();
    // ASSERT
    expect(code).toBe(expected);
  });

  it('carries the three Spec Speaker notes, each with its source', () => {
    // ARRANGE
    const expected = [
      { header: 'Length itself hurts', urls: ['https://arxiv.org/abs/2510.05381'] },
      { header: 'One job per chat', urls: ['https://www.trychroma.com/research/context-rot'] },
      { header: 'A short recap helped', urls: ['https://arxiv.org/abs/2510.05381'] },
    ];
    // ACT
    const notes = localized('en').notes.map((note) => ({
      header: note.header,
      urls: (note.sources ?? []).map((source) => source.url),
    }));
    // ASSERT
    expect(notes).toEqual(expected);
  });

  it('puts a Context marker on each habit, opening the note the build notes name, in habit order', () => {
    // ARRANGE
    const expected = ['one-job-per-chat', 'a-short-recap-helped', 'length-itself-hurts'];
    // ACT
    const $ = scene('en');
    const markers = $('[data-context-ref]')
      .map((_, el) => $(el).attr('data-context-ref'))
      .get();
    // ASSERT
    expect(markers).toEqual(expected);
  });

  it('mounts the cornerstone mini bars for the old chat and the fresh one, either side of the handoff card', () => {
    // ARRANGE
    const expected = ['slide-10-old', 'slide-10-fresh'];
    // ACT
    const $ = scene('en');
    const minis = $('[data-bars]')
      .map((_, el) => $(el).attr('data-bars'))
      .get();
    // ASSERT
    expect(minis).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('renders no heading in its Scene, since the shared Slide header shows the title', () => {
    // ARRANGE
    const headings = 'h1, h2, h3';
    // ACT
    const $ = scene('en');
    // ASSERT
    expect($(headings)).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('shows the handoff card with the budget in its tint in both locales', () => {
    // ARRANGE
    const expected = { en: 'budget 30,000 €', de: 'Budget 30.000 €' };
    // ACT
    const budgets = {
      en: scene('en')('[data-handoff] [data-budget]').text(),
      de: scene('de')('[data-handoff] [data-budget]').text(),
    };
    // ASSERT
    expect(budgets).toEqual(expected);
  });

  it('keeps the same notes and segments in German, under German headers', () => {
    // ARRANGE
    const expected = {
      notes: ['length-itself-hurts', 'one-job-per-chat', 'a-short-recap-helped'],
      headers: ['Die Länge allein schadet', 'Ein Job pro Chat', 'Eine kurze Zusammenfassung half'],
      segments: [
        'break-it-down',
        'one-chat-one-job',
        'ask-for-a-handoff',
        'read-and-correct-it',
        'start-the-next-chat-with-it',
        'check-the-context',
      ],
    };
    // ACT
    const de = localized('de');
    const shape = {
      notes: de.notes.map((note) => note.slug),
      headers: de.notes.map((note) => note.header),
      segments: de.voiceScript.map((segment) => segment.slug),
    };
    // ASSERT
    expect(shape).toEqual(expected);
  });
});
