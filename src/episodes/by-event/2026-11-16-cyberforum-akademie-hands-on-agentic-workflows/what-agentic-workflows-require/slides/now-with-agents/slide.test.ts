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

const SECTION = slide({
  slug: 'a-thought-experiment',
  messages: { en: { title: 'A thought experiment' }, de: { title: 'Ein Gedankenexperiment' } },
  content: () => null,
});

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
      speed: ['Every card', '2 min', '2 weeks · the same four failures, reached faster'],
      struck: ['2 weeks'],
      title: ['What no agent was told'],
      lines: [
        'Trained on public text',
        "Your company's own talk isn't in it",
        'Rare facts are learned poorly',
        'So context must come with the task',
      ],
      markers: [
        'Speaker note: A model can learn from public text alone',
        'Speaker note: Customer conversations are not training data',
        'Speaker note: Rare facts are learned poorly',
        'Speaker note: The context must be supplied',
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
          'Now give the same four cards to agents. Each card is ticked far faster, which is wonderful, and it is exactly where the trap sits. AI speeds up the doing, but it cannot add context that nobody gave it, and the paintball agent never saw the accessible bus.',
      },
      'plausible-guess': {
        title: 'Plausible guess',
        script:
          'What makes this worse is that an agent which finds a gap tends to fill it with a plausible guess, instead of stopping to ask you. Nobody told the food agent what vegetarian means for these colleagues, so it picks the most common reading and carries on. The same four failures appear in the same four places, only now you reach them in two minutes instead of two weeks.',
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
        header: 'A model can learn from public text alone',
        description:
          'the LLaMA authors set out to show state-of-the-art models can be trained using publicly available datasets exclusively [1].',
        sources: [
          {
            title: 'Touvron et al., LLaMA: Open and Efficient Foundation Language Models',
            url: 'https://arxiv.org/abs/2302.13971',
          },
        ],
      },
      {
        header: 'Customer conversations are not training data',
        description:
          "Anthropic states that by default it does not use inputs or outputs of its commercial products for training, so a company's internal processes, decisions and naming are mostly absent from what a model learned [1].",
        sources: [
          {
            title: 'Anthropic, Is my data used for model training? (commercial products)',
            url: 'https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training',
          },
        ],
      },
      {
        header: 'Rare facts are learned poorly',
        description:
          'accuracy on a fact question tracks how many training documents mention it, so even a fact that is in the data is weak when it is rare [1].',
        sources: [
          {
            title: 'Kandpal et al., Large Language Models Struggle to Learn Long-Tail Knowledge',
            url: 'https://arxiv.org/abs/2211.08411',
          },
        ],
      },
      {
        header: 'The context must be supplied',
        description:
          "the retrieval literature's remedy is to pair the model with a searchable memory consulted at request time, which is why organisational knowledge has to arrive with the request [1].",
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
      title: ['Was kein Agent gesagt bekam'],
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
