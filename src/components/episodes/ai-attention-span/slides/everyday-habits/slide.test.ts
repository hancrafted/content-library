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
  });
}

const scene = (locale: Locale) => load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).content)));

describe('success cases', () => {
  it('speaks the Spec Voice script verbatim, segment by segment', () => {
    // ARRANGE
    const expected = [
      {
        title: 'Break it down',
        script:
          'Break it down. You know this one already: you split a big task into small steps, and each step is small enough to hold in view.',
      },
      {
        title: 'Fresh start',
        script:
          'Fresh start. You know this one too: a fresh start spends the whole window on the work in front of you, and none of it on what happened an hour ago.',
      },
      {
        title: 'One chat, one job',
        script:
          "One chat, one job. When the topic changes, open a new chat, so that the hotel question doesn't have to carry the catering PDF along.",
      },
      {
        title: 'Ask for a handoff',
        script:
          'Ask for a handoff. After real progress, or before a coffee break, stop and ask the AI for a handoff: a short card with the goal, what is decided and what comes next.',
      },
      {
        title: 'Read and correct it',
        script:
          'Then read it and correct what is wrong. A summary can leave things out or get one wrong, and you are the one accountable for what the next chat believes.',
      },
      {
        title: 'Start the next chat with it',
        script:
          'And start the next chat with it. Paste the handoff in as the first message, and the new chat starts small and sharp, with the venue, the caterer, the budget and the next step, and nothing else.',
      },
    ];
    // ACT
    const segments = localized('en').voiceScript.map(({ title, script }) => ({ title, script }));
    // ASSERT
    expect(segments).toEqual(expected);
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
    const minis = $('[data-mini]')
      .map((_, el) => $(el).attr('data-mini'))
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
    const expected = { en: 'budget 40,000 €', de: 'Budget 40.000 €' };
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
        'fresh-start',
        'one-chat-one-job',
        'ask-for-a-handoff',
        'read-and-correct-it',
        'start-the-next-chat-with-it',
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
