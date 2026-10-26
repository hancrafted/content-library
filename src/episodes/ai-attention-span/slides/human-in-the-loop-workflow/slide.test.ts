import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { humanInTheLoopWorkflow } from './slide';

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
  const placed = placeSections<Slide>([[SECTION, humanInTheLoopWorkflow]]).flat();
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
        title: 'Recall the brief',
        script:
          'Remember the brief for the venue: break the party down, interview yourself with AI, write the requirements first, give each piece a fresh chat, and evaluate each step. That was one task, done well. A bigger project needs the same moves, plus a way of working that holds them together.',
      },
      {
        title: 'Human in the loop',
        script:
          'This way of working is what we call a human in the loop workflow. You are the orchestrator, the captain at the helm, and you use AI the way a captain uses a crew.',
      },
      {
        title: 'Planner and handoff',
        script:
          'One chat stays the planner. It helps you prepare the task and writes a handoff. It keeps only the plan and the results, so it stays small and has room to spare.',
      },
      {
        title: 'Worker chats',
        script:
          'The handoff goes to worker chats, a fresh one per job: venues, catering, invitations. Each worker reads its files, fills up as much as it needs, saves its result, and then you let it go.',
      },
      {
        title: 'You check',
        script:
          "You carry the results back to the planner, and every artifact in between, the handoff and each result, is something you check. Every chat has one job, so none of them runs long enough to blur its middle. That is the whole idea: the window is the AI's attention span, and managing it is your job. One honest caveat: the zones and numbers I gave you are rules of thumb and illustrations, and I have not tested every chat app, so watch your own chats and adjust. If you want a low-key place to start, take the next chat that drifts, ask it for a handoff, and open a new one with it. Thank you.",
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

  it('marks the worker chats and the short-tasks phrase, each opening the note the build notes name', () => {
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

  it('shows the seven stages of the brief with no bold first letter and no acronym named', () => {
    // ARRANGE
    const expected = { stages: 7, bold: 0, acronym: false };
    // ACT
    const $ = scene('en');
    const actual = {
      stages: $('ol[aria-label="The steps of a brief, stage by stage"] > li').length,
      bold: $('ol[aria-label="The steps of a brief, stage by stage"] b').length,
      acronym: $.text().includes('BRIEF'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws every stage with its jobs and the fan-out and fan-in of brief the venue', () => {
    // ARRANGE
    const expected = { jobLists: 7, workers: ['Chat 1', 'Chat 2', 'Chat 3'], card: true, connectors: 6, fans: 2 };
    // ACT
    const $ = scene('en');
    const pipeline = $('ol[aria-label="The steps of a brief, stage by stage"]');
    const actual = {
      jobLists: pipeline.find('> li > div > ol').length,
      workers: pipeline
        .find('> li > div > ol')
        .eq(4)
        .find('li')
        .map((_, el) => $(el).children().first().text().replace('Checked against the card', '').trim())
        .get(),
      card: pipeline.text().includes('You sign off'),
      connectors: pipeline.find('> li > [aria-hidden="true"]').length,
      fans: pipeline.find('svg[data-fan]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
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
  it('drops the one-chat comparison: no context bars are mounted', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const $ = scene('en');
    // ASSERT
    expect($('[data-bars]').length).toBe(expected);
  });

  it('names the first stage as the task, in both locales', () => {
    // ARRANGE
    const expected = ['Plan', 'Plan'];
    // ACT
    const names = (['en', 'de'] as const).map((locale) =>
      scene(locale)('ol[aria-label] > li').first().find('p.font-semibold').first().text().trim(),
    );
    // ASSERT
    expect(names).toEqual(expected);
  });

  it('names the Slide in both locales', () => {
    // ARRANGE
    const expected = ['Human in the loop workflow', 'Human-in-the-Loop-Workflow'];
    // ACT
    const titles = (['en', 'de'] as const).map((locale) => localized(locale).title);
    // ASSERT
    expect(titles).toEqual(expected);
  });

  it('keeps the same notes and segments in German, under German headers', () => {
    // ARRANGE
    const expected = {
      notes: ['clean-windows-for-each-part', 'short-tasks-beat-long-ones'],
      headers: ['Saubere Fenster für jeden Teil', 'Kurze Aufgaben schlagen lange'],
      segments: ['recall', 'human-in-the-loop', 'planner-and-handoff', 'worker-chats', 'you-check'],
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
