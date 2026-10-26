import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { theWorkflowForBiggerProjects } from './slide';

/*
 * The workflow for bigger projects (Spec Option 11c), read through the one interface the page reads a Slide by:
 * localized into an Episode on the shared Slide header, its text, notes and Voice script as the drawer gets them and
 * its Scene as the page renders it. The section slide is a stand-in, so the test reaches no Episode file.
 */

const SECTION = slide({
  slug: 'managing-the-attention-span',
  messages: { en: { title: 'Managing the attention span' }, de: { title: 'Die Aufmerksamkeitsspanne managen' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, theWorkflowForBiggerProjects]]).flat();
  return localizeSlide(placed[1] as never, {
    episode: episodeRef('ai-attention-span', '2026-10-23-axel-agentic-workflow').id,
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
        title: 'One chat is too small',
        script:
          "Say you are planning your company's next summer party: 200 employees across five offices in Europe. Sometimes the project is bigger than one chat can hold: the whole summer party, with venues, catering, hotels and invitations. One chat would fill up, whatever window size you give it.",
      },
      {
        title: 'Break it down first',
        script:
          'So you break it down first. Work backward from the outcome, what do I need to run this party, and then what do I need for that, until the next step is clear. You can ask the AI to help you with that.',
      },
      {
        title: 'One planner',
        script:
          'Then one chat stays the planner. It keeps only the plan and the results, so it stays small and has room to spare.',
      },
      {
        title: 'A fresh chat per step',
        script:
          'Each step goes to a fresh chat: venues, catering, invitations. That chat reads its files and fills up as much as it needs, hands the result back to the planner as one small card, and then you let it go. Next step, next fresh chat.',
      },
      {
        title: 'You coordinate',
        script:
          "And you coordinate, like a project manager. This is what we call a workflow. Every chat has one job, so none of them runs long enough to blur its middle. That is the whole idea: the window is the AI's attention span, and managing it is your job. One honest caveat: the zones and numbers I gave you are rules of thumb and illustrations, and I have not tested every chat app, so watch your own chats and adjust. If you want a low-key place to start, take the next chat that drifts, ask it for a handoff, and open a new one with it. Thank you.",
      },
    ];
    // ACT
    const segments = localized('en').voiceScript.map(({ title, script }) => ({ title, script }));
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('carries the two Spec Speaker notes, each with its source', () => {
    // ARRANGE
    const expected = [
      {
        header: 'Clean windows for each part',
        urls: ['https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents'],
      },
      { header: 'Short tasks beat long ones', urls: ['https://arxiv.org/abs/2510.05381'] },
    ];
    // ACT
    const notes = localized('en').notes.map((note) => ({
      header: note.header,
      urls: (note.sources ?? []).map((source) => source.url),
    }));
    // ASSERT
    expect(notes).toEqual(expected);
  });

  it('marks the workflow panel title and the short-tasks phrase, each opening the note the build notes name', () => {
    // ARRANGE
    const expected = ['clean-windows-for-each-part', 'short-tasks-beat-long-ones'];
    // ACT
    const $ = scene('en');
    const markers = $('[data-context-ref]')
      .map((_, el) => $(el).attr('data-context-ref'))
      .get();
    // ASSERT
    expect(markers).toEqual(expected);
  });

  it('mounts the one long chat before and the planner with its workers after, from the cornerstone', () => {
    // ARRANGE
    const expected = ['slide-11-before', 'slide-11-after'];
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
  it('draws no result cards under the workflow bars', () => {
    // ARRANGE
    const expected = { en: 0, de: 0 };
    // ACT
    const actual = { en: scene('en')('[data-result]').length, de: scene('de')('[data-result]').length };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps the same notes and segments in German, under German headers', () => {
    // ARRANGE
    const expected = {
      notes: ['clean-windows-for-each-part', 'short-tasks-beat-long-ones'],
      headers: ['Saubere Fenster für jeden Teil', 'Kurze Aufgaben schlagen lange'],
      segments: [
        'one-chat-is-too-small',
        'break-it-down-first',
        'one-planner',
        'a-fresh-chat-per-step',
        'you-coordinate',
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
