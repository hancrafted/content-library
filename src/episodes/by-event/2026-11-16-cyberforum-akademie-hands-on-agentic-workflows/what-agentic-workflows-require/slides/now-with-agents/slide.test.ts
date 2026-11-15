import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { nowWithAgents } from './slide';

/*
 * "Now with agents", picked Option 2a: Slide 1's sum replayed with an agent on every card, each stamped 2 min, the
 * same four failures in the same places in the compact card form, and beside it the speed card and what no agent was
 * told, one Context marker per line. Read as the page renders the Scene under the shared Slide header.
 */

const SECTION = slide({
  slug: 'a-thought-experiment',
  messages: { en: { title: 'A thought experiment' }, de: { title: 'Ein Gedankenexperiment' } },
  content: () => null,
});

/** The Scene as the page renders it; the section slide is a stand-in, so the test reaches no Episode file. */
function sceneOf(locale: Locale = 'en') {
  const placed = placeSections<Slide>([[SECTION, nowWithAgents]]).flat();
  const localized = localizeSlide(placed[1] as never, {
    episode: episodeRef('what-agentic-workflows-require', '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows')
      .id,
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return load(renderToStaticMarkup(createElement(Fragment, null, localized.content)));
}

const textsOf = ($: ReturnType<typeof sceneOf>, selector: string) =>
  $(selector)
    .toArray()
    .map((node) => $(node).text().replace(/\s+/g, ' ').trim());

interface SlideText {
  notes: Record<string, { header: string; description: string; sources: Record<string, { title: string }> }>;
  voiceScript: { segments: Record<string, { title: string; script: string }> };
}

const textOf = (locale: Locale) => nowWithAgents.messages[locale] as unknown as SlideText;

describe('success cases', () => {
  it('replays the sum with an agent on every card, each stamped 2 min and its own goal met', () => {
    // ARRANGE
    const expected = {
      label: ['Same board, same notes · handed to four agents'],
      cards: ['Activities', 'Travel', 'Venue', 'Food & drinks'],
      agents: 4,
      stamps: ['2 min', '2 min', '2 min', '2 min'],
      goals: ['Own goal met', 'Own goal met', 'Own goal met', 'Own goal met'],
      result: ['Party, 20 June'],
    };
    // ACT
    const $ = sceneOf();
    const actual = {
      label: textsOf($, '[data-sum-label]'),
      cards: textsOf($, '[data-sum-card] [data-card-label]'),
      agents: $('[data-sum-card] [data-done-by="agent"]').length,
      stamps: textsOf($, '[data-sum-card] [data-stamp]'),
      goals: textsOf($, '[data-sum-card] [data-own-goal]'),
      result: textsOf($, '[data-sum-result] [data-result-title]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('keeps the same four failures in the same places, in the compact card form', () => {
    // ARRANGE
    const expected = {
      facts: ['Paintball × 200', 'Everyone carpools', 'Alpine hut, 1,800 m', '31 vegetarian'],
      seams: [
        'Travel: accessible bus',
        'Food & drinks: open bar to 01:00',
        'Travel: route and times only',
        'Venue: hut kitchen: eggs OK',
      ],
      breaks: ['✗ together', '✗ safely', '✗ safely', '✗ together'],
      broken: ['✗ together Activities, Food & drinks', '✗ safely Travel, Venue'],
    };
    // ACT
    const $ = sceneOf();
    const actual = {
      facts: textsOf($, '[data-sum-card] [data-fact]'),
      seams: textsOf($, '[data-sum-card] [data-seam]'),
      breaks: textsOf($, '[data-sum-card] [data-breaks]'),
      broken: textsOf($, '[data-sum-result] [data-broken]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('sets the speed card beside the board, and opens one Speaker note per line of what no agent was told', () => {
    // ARRANGE
    const expected = {
      speed: ['Every card', '2 min', '2 weeks · illustrative comparison, not a benchmark'],
      struck: ['2 weeks'],
      title: ['Context the agents lacked'],
      lines: [
        'Public text can be in training data',
        'Private team context may be missing',
        'Rare facts can be harder to recall from training alone',
        'Make context available when the task runs',
      ],
      markers: [
        'Speaker note: One model trained only on public datasets',
        'Speaker note: Anthropic excludes commercial data by default',
        'Speaker note: Rare facts can be harder to recall',
        'Speaker note: Context can be retrieved at request time',
      ],
    };
    // ACT
    const $ = sceneOf();
    const actual = {
      speed: textsOf($, '[data-speed-card] p'),
      struck: textsOf($, '[data-speed-card] s'),
      title: textsOf($, '[data-context-list] [data-context-title]'),
      lines: textsOf($, '[data-context-list] li'),
      markers: $('[data-context-list] li button')
        .toArray()
        .map((node) => $(node).attr('aria-label')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the Spec’s Voice script, segment by segment, verbatim', () => {
    // ARRANGE
    const expected = {
      'speed-not-context': {
        title: 'Speed, not context',
        script:
          'Now give the same four cards to agents. In this thought experiment, each card is ticked much faster, while the handoff gaps remain. That is an illustration, not a measured universal speedup. An agent also cannot reliably use private constraints it cannot access, and the paintball agent never saw the accessible bus.',
      },
      'plausible-guess': {
        title: 'Plausible guess',
        script:
          "When context is missing, an agent may fill the gap with a plausible guess instead of asking. In our food example, no one specified whether eggs were allowed, so the kitchen's interpretation did not fit those guests. The example reaches the same four handoff failures in two minutes instead of two weeks; those timings illustrate the scenario, not a general benchmark.",
      },
    };
    // ACT
    const { segments } = textOf('en').voiceScript;
    const actual = Object.fromEntries(
      nowWithAgents.segments.map(({ slug }) => [
        slug,
        { title: segments[slug]?.title, script: segments[slug]?.script },
      ]),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the Spec’s four Speaker notes with their sources', () => {
    // ARRANGE
    const expected = [
      {
        header: 'One model trained only on public datasets',
        description:
          "The LLaMA authors set out to show that state-of-the-art models could be trained using publicly available datasets exclusively; this describes that model's training, not every model [1].",
        sources: [
          {
            title: 'Touvron et al., LLaMA: Open and Efficient Foundation Language Models',
            url: 'https://arxiv.org/abs/2302.13971',
          },
        ],
      },
      {
        header: 'Anthropic excludes commercial data by default',
        description:
          "Anthropic says it does not use inputs or outputs from its commercial products for training by default. For those products, internal processes, decisions and naming are not automatically part of the model's training data; other providers and settings may differ [1].",
        sources: [
          {
            title: 'Anthropic, Is my data used for model training? (commercial products)',
            url: 'https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training',
          },
        ],
      },
      {
        header: 'Rare facts can be harder to recall',
        description:
          'In the studied factual-question benchmarks, answer accuracy tracked how many training documents mentioned a fact. That finding does not mean every rare fact is absent or every model behaves alike [1].',
        sources: [
          {
            title: 'Kandpal et al., Large Language Models Struggle to Learn Long-Tail Knowledge',
            url: 'https://arxiv.org/abs/2211.08411',
          },
        ],
      },
      {
        header: 'Context can be retrieved at request time',
        description:
          'Retrieval-augmented generation pairs a model with searchable memory that can be consulted when a request runs. Relevant organisational knowledge can therefore be supplied or retrieved at task time rather than assumed to be in training data [1].',
        sources: [
          {
            title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
            url: 'https://arxiv.org/abs/2005.11401',
          },
        ],
      },
    ];
    // ACT
    const { notes } = textOf('en');
    const actual = nowWithAgents.notes.map(({ slug, sources = [] }) => ({
      header: notes[slug]?.header,
      description: notes[slug]?.description,
      sources: sources.map((source) => ({ title: notes[slug]?.sources[source.slug]?.title, url: source.url })),
    }));
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows no person on the board and drops the result lines Slide 1 carries', () => {
    // ARRANGE
    const expected = { people: 0, results: 0 };
    // ACT
    const $ = sceneOf();
    const actual = { people: $('[data-done-by="person"]').length, results: $('[data-failure-result]').length };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names the cards and what no agent was told in German on the German page', () => {
    // ARRANGE
    const expected = {
      cards: ['Programm', 'Anreise', 'Location', 'Essen & Getränke'],
      title: ['Fehlender Kontext'],
    };
    // ACT
    const $ = sceneOf('de');
    const actual = {
      cards: textsOf($, '[data-sum-card] [data-card-label]'),
      title: textsOf($, '[data-context-list] [data-context-title]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
