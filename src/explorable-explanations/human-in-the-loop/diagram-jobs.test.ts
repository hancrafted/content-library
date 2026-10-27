import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DiagramPart } from './diagram-part';
import type { DiagramProps, UiWords } from './human-in-the-loop.types';
import { job, stage, flow as workflow } from './workflow-fixture.pure';
import type { Workflow } from './workflow.types';

const flow = (): Workflow =>
  workflow([
    {
      ...stage('a', [
        job({ id: 'second', title: 'Second', needs: ['first'] }),
        job({ id: 'first', title: 'First', detail: 'Starts it', reviewed: true }),
      ]),
      summary: 'Plan the whole thing',
    },
    { ...stage('b', [job({ id: 'b' })]), foreach: { over: 'o#epics', demo: 2 } },
    { ...stage('c', [job({ id: 'c' })]), gate: 2 },
  ]);
const words = {
  tryIt: 'Try it',
  tryFor: 'for {stage}',
  tryJob: 'Open {job} in {stage}',
  moveLabel: '{letter}: {why}',
  gate: 'Gate {n}',
  checked: 'checked',
  repeats: '× each {item} ({n})',
  round: 'round',
} as UiWords;
/** What the diagram asked to open; a static render presses nothing, so a recording closure stands in for a spy. */
const opened: string[] = [];
const render = (props: Partial<DiagramProps> = {}) =>
  load(
    renderToStaticMarkup(
      createElement(DiagramPart, {
        workflow: flow(),
        words,
        readonly: false,
        view: 'jobs',
        rounds: { b: 3 },
        onOpenStage: (stageId) => void opened.push(stageId),
        ...props,
      }),
    ),
  );
const COLUMN = 'li[class*="focus-group__item"]';
const POPOVER = { in: 'in.', out: 'out.', inLabel: 'In:', outLabel: 'Out:' };

describe('success cases', () => {
  it('draws every job as a job card inside its stage card, in the order their needs give', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const titles = $(COLUMN)
      .first()
      .find('[data-stage-card] [data-job-card] [data-title]')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(titles).toEqual(['First', 'Second']);
  });

  it('joins the job cards of a stage by an arrow into each card after the first, in the order their needs give', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const cards = $(COLUMN).first().find('[data-job-card]');
    const arrows = cards.map((_, el) => $(el).children('[data-job-arrow]').length).get();
    // ASSERT
    expect(arrows).toEqual([0, 1]);
    expect(cards.map((_, el) => $(el).attr('data-job-card')).get()).toEqual(['first', 'second']);
  });

  it('shows a job card with its summary and a labelled check mark where the job is reviewed', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const cards = $(COLUMN).first().find('[data-job-card]');
    // ASSERT
    expect(cards.first().find('[data-summary]').text()).toBe('Starts it');
    expect(cards.first().find('[data-checked]').text()).toContain('checked');
    expect(cards.last().find('[data-checked]')).toHaveLength(0);
  });

  it('draws a repeated stage once, inside a bracket labelled with its round count', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const bracket = $(COLUMN).eq(1).find('[data-bracket]');
    // ASSERT
    expect(bracket.find('[data-bracket-label]').text()).toBe('× each round (3)');
    expect(bracket.find('[data-job-card]')).toHaveLength(1);
    expect($('[data-bracket]')).toHaveLength(1);
    expect($('svg[data-fan]')).toHaveLength(0);
  });

  it('labels the bracket with the word the stage names for what it repeats, "round" when it names none', () => {
    // ARRANGE
    const named = workflow([
      stage('a', [job({ id: 'a' })]),
      { ...stage('b', [job({ id: 'b' })]), foreach: { over: 'o#epics', demo: 2, item: 'epic' } },
    ]);
    // ACT
    const label = (flowOf: Workflow) => render({ workflow: flowOf, rounds: { b: 2 } })('[data-bracket-label]').text();
    // ASSERT
    expect(label(named)).toBe('× each epic (2)');
    expect(label(flow())).toBe('× each round (2)');
  });

  it('opens the stage and the job from a press on a job card, named for both', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const opener = $(COLUMN).first().find('[data-job-card] button[data-try-job="first"]');
    // ASSERT
    expect(opener.attr('data-try')).toBe('A');
    expect(opener.attr('aria-label')).toBe('Open First in A');
  });

  it('draws the gate badge of a gated stage, and no send-back arc', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const gated = $(COLUMN).eq(2);
    // ASSERT
    expect(gated.find('[data-gate]').text()).toContain('Gate 2');
    expect(gated.find('[data-send-back]')).toHaveLength(0);
    expect(gated.find('[data-gate]').text()).toBe('Gate 2');
  });

  it("restores the Slide's job slots: a popover from the job's title, its detail, its marker and what hangs after it", () => {
    // ARRANGE
    const slots = {
      jobs: {
        first: {
          popover: POPOVER,
          detail: createElement('em', { 'data-detail': '' }, 'Forgets'),
          marker: createElement('i', { 'data-marker': '' }, 'M'),
          after: createElement('b', { 'data-after': '' }, 'Chat'),
        },
      },
    };
    // ACT
    const $ = render({ slots });
    const card = $('[data-job-card]').first();
    // ASSERT
    expect(card.find('button[aria-haspopup="dialog"]:not([data-try-job])').text()).toBe('First');
    expect(card.find('[data-summary] [data-detail]').text()).toBe('Forgets');
    expect(card.find('[data-marker]')).toHaveLength(1);
    expect(card.find('[data-after]')).toHaveLength(1);
  });
});

describe('failure cases', () => {
  it('draws no press target for a readonly Preset, and the cards stay', () => {
    // ARRANGE
    const jobs = 4;
    const $ = render({ readonly: true });
    // ACT
    const buttons = $('button').length;
    // ASSERT
    expect(buttons).toBe(0);
    expect($('[data-job-card]')).toHaveLength(jobs);
  });

  it('draws no bracket for a stage that does not repeat', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const brackets = $(COLUMN).first().find('[data-bracket]').length;
    // ASSERT
    expect(brackets).toBe(0);
  });
});

describe('edge cases', () => {
  it('counts a repeated stage by its demo cap when the run holds no rounds', () => {
    // ARRANGE
    const $ = render({ rounds: {} });
    // ACT
    const label = $('[data-bracket-label]').text();
    // ASSERT
    expect(label).toBe('× each round (2)');
  });

  it('names the whole diagram after the Workflow and marks the view as jobs', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const list = $('ol[data-part="diagram"]');
    // ASSERT
    expect([list.attr('aria-label'), list.attr('data-view')]).toEqual(['W', 'jobs']);
  });
});
