import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { handoffBlocks, parseHandoff, type Handoff } from '../handoff.pure';
import { outputWords, workflowFor } from '../workflow-data';
import { OutputView, type OutputViewProps } from './output-dispatch';

/** The summer party's example outputs, parsed, by kind. */
const EXAMPLES = new Map<string, Handoff>(
  workflowFor('summer-party', 'en')
    .stages.flatMap((stage) => stage.jobs)
    .flatMap((job) => handoffBlocks(job.exampleOutput ?? ''))
    .map((block) => parseHandoff(block))
    .flatMap((read) => ('handoff' in read ? [[read.handoff.kind, read.handoff] as const] : []))
    .reverse(),
);

const view = (handoff: Handoff, props: Partial<OutputViewProps> = {}) =>
  load(renderToStaticMarkup(createElement(OutputView, { handoff, words: outputWords('en'), ...props })));
const example = (kind: string, props: Partial<OutputViewProps> = {}) => {
  const handoff = EXAMPLES.get(kind);
  if (!handoff) throw new Error(`no ${kind} example`);
  return view(handoff, props);
};

describe('success cases', () => {
  it('draws the spec page with goal, requirements, out of scope and numbered slices', () => {
    // ARRANGE
    const kind = 'spec';
    const slices = 3;
    const minRequirements = 5;
    // ACT
    const $ = example(kind);
    // ASSERT
    expect($('[data-output=spec]').text()).toContain('Choose one venue');
    expect($('[data-output=spec] ul li').length).toBeGreaterThanOrEqual(minRequirements);
    expect($('[data-output=spec] ol li')).toHaveLength(slices);
  });

  it('draws the ticket graph with one node per ticket and only the unblocked one ready', () => {
    // ARRANGE
    const kind = 'tickets';
    const tickets = 5;
    const edges = 6;
    // ACT
    const $ = example(kind);
    // ASSERT
    expect($('[data-ticket]')).toHaveLength(tickets);
    expect($('[data-ticket][data-status=ready]').attr('data-ticket')).toBe('shortlist');
    expect($('[data-edge]')).toHaveLength(edges);
  });

  it('readies the dependents of a ticked blocker', () => {
    // ARRANGE
    const ticked = ['shortlist'];
    const unlocked = 3;
    // ACT
    const $ = example('tickets', { ticked });
    // ASSERT
    expect($('[data-ticket][data-status=done]')).toHaveLength(1);
    expect($('[data-ticket][data-status=ready]')).toHaveLength(unlocked);
    expect($('[data-progress]').text()).toBe('1 of 5 done');
  });

  it('draws research as a card with its subject and facts', () => {
    // ARRANGE
    const kind = 'research';
    // ACT
    const $ = example(kind);
    // ASSERT
    expect($('[data-output=research] h3').text()).not.toBe('');
    expect($('[data-output=research] li').length).toBeGreaterThan(0);
  });

  it('draws the comparison as a table ranked from first', () => {
    // ARRANGE
    const kind = 'comparison';
    // ACT
    const $ = example(kind);
    // ASSERT
    const ranks = $('tbody tr')
      .map((_, el) => $(el).attr('data-rank'))
      .get();
    expect(ranks.length).toBeGreaterThan(1);
    expect(ranks).toEqual(ranks.map((_, at) => String(at + 1)));
  });

  it('draws text as it is and a requirements list as items', () => {
    // ARRANGE
    const text: Handoff = { kind: 'text', text: 'a\nb' };
    const items = ['x', 'y'];
    const requirements: Handoff = { kind: 'requirements', items };
    // ACT
    const asText = view(text);
    const asList = view(requirements);
    // ASSERT
    expect(asText('[data-output=text]').text()).toBe('a\nb');
    expect(asList('[data-output=requirements] li')).toHaveLength(items.length);
  });
});

describe('failure cases', () => {
  it('disables a ticket whose blockers are not done', () => {
    // ARRANGE
    const ticked: string[] = [];
    // ACT
    const $ = example('tickets', { ticked });
    // ASSERT
    expect($('[data-ticket=rank]').attr('disabled')).toBeDefined();
    expect($('[data-ticket=shortlist]').attr('disabled')).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('draws the labels of the words it is given, here the German ones', () => {
    // ARRANGE
    const words = outputWords('de');
    // ACT
    const $ = example('spec', { words });
    // ASSERT
    expect($('[data-output=spec]').text()).toContain(words.goal);
    expect($('[data-output=spec]').text()).not.toContain(outputWords('en').requirements);
  });

  it('draws an empty ticket list without a node', () => {
    // ARRANGE
    const handoff: Handoff = { kind: 'tickets', tickets: [] };
    // ACT
    const $ = view(handoff);
    // ASSERT
    expect($('[data-ticket]')).toHaveLength(0);
  });
});
