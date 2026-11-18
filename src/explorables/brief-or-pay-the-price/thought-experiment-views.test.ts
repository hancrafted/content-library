import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BriefOrPayThePrice } from './brief-or-pay-the-price';
import { explorableData } from './brief-or-pay-the-price-data';
import { BOARD_TEAM_IDS, QUESTION_IDS } from './brief-or-pay-the-price.types';
import { FreelancerCardView, TraitShortLineView } from './freelancer-layer-view';
import { SeamArc } from './seam-arc.client';
import { SlotRegionView } from './slot-region-view';
import { AgentThoughtExperimentView } from './thought-experiment-agent-view';
import { BoardThoughtExperimentView, SEAM } from './thought-experiment-board-view';

const LOCALES = ['en', 'de'] as const;
const html = (element: Parameters<typeof renderToStaticMarkup>[0]) => load(renderToStaticMarkup(element));

describe('success cases', () => {
  it.each(LOCALES)('Seam 3: the agent thought experiment shows its words in %s', (locale) => {
    // ARRANGE
    const { agent } = explorableData(locale).words.thoughtExperiment;
    // ACT
    const $ = html(createElement(AgentThoughtExperimentView, { words: agent }));
    // ASSERT
    expect($('[data-question]')).toHaveLength(QUESTION_IDS.length);
    expect($('[data-thought-experiment="agent"]').text()).toContain(agent.task);
    expect($('[data-thought-experiment="agent"]').text()).toContain(agent.caption);
  });

  it.each(LOCALES)('Seam 3: the board shows four teams and the seam in %s', (locale) => {
    // ARRANGE
    const { board } = explorableData(locale).words.thoughtExperiment;
    // ACT
    const $ = html(
      createElement(BoardThoughtExperimentView, {
        words: board,
        seam: createElement(SeamArc, { from: SEAM.from, to: SEAM.to, label: board.seam }),
      }),
    );
    // ASSERT
    expect($('[data-team]')).toHaveLength(BOARD_TEAM_IDS.length);
    expect($('[data-note="venue"]').attr('data-state')).toBe('fail');
    expect($('[data-note="food"]').text()).toBe(board.teams.food.note);
    expect($('[data-seam]')).toHaveLength(1);
  });

  it.each(LOCALES)('Seam 3: the Freelancer layer card and trait line speak %s', (locale) => {
    // ARRANGE
    const { freelancerLayer, definitions } = explorableData(locale).words;
    const short = definitions.price.rows.probabilistic?.short ?? '';
    // ACT
    const card = html(createElement(FreelancerCardView, { words: freelancerLayer }));
    const line = html(createElement(TraitShortLineView, { trait: 'probabilistic', text: short }));
    // ASSERT
    expect(card('[data-layer="freelancer"]').text()).toContain(freelancerLayer.title);
    expect(line('[data-trait-short="probabilistic"]').text()).toBe(short);
    expect(short).not.toBe('');
  });

  it('Seam 3: a slot region renders the children the Slide passes', () => {
    // ARRANGE
    const child = createElement('p', { id: 'from-slide' }, 'context window');
    // ACT
    const $ = html(createElement(SlotRegionView, { slot: 'habits', label: 'Habits' }, child));
    // ASSERT
    expect($('[data-slot="habits"] #from-slide').text()).toBe('context window');
  });

  it('Seam 3: the server entry passes both slot props through to the page', () => {
    // ARRANGE
    const habits = createElement('p', { id: 'habits-child' }, 'h');
    const tryIt = createElement('p', { id: 'try-child' }, 't');
    // ACT
    const element = createElement(BriefOrPayThePrice, { locale: 'en', habits, tryIt });
    // ASSERT
    expect(() => renderToStaticMarkup(element)).not.toThrow();
  });
});

describe('failure cases', () => {
  it('renders no region when the Slide passes no children', () => {
    // ARRANGE
    const element = createElement(SlotRegionView, { slot: 'tryIt', label: 'Try it' });
    // ACT
    const $ = html(element);
    // ASSERT
    expect($('[data-slot]')).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('gives both locales the same thought-experiment question ids', () => {
    // ARRANGE
    const [en, de] = LOCALES.map((locale) =>
      Object.keys(explorableData(locale).words.thoughtExperiment.agent.questions),
    );
    // ACT
    // ASSERT
    expect(en).toEqual(de);
  });
});
