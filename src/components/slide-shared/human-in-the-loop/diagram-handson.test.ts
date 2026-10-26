import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DiagramPart } from './diagram-part';
import type { DiagramProps, UiWords } from './human-in-the-loop.types';
import { job, stage, flow as workflow } from './workflow-fixture.pure';
import type { JobRun, JobState, Run, StageRun } from './workflow-run.pure';
import type { Workflow } from './workflow.types';

const flow = (): Workflow =>
  workflow([
    stage('a', [
      job({ id: 'first', title: 'First', reviewed: true }),
      job({ id: 'second', title: 'Second', needs: ['first'] }),
    ]),
    { ...stage('b', [job({ id: 'b', title: 'Build' })]), foreach: { over: 'o#epics', teaching: 2 } },
  ]);
const words = {
  tryJob: 'Open {job} in {stage}',
  gate: 'Gate {n}',
  checked: 'checked',
  sendBack: 'send back',
  repeats: '× each {item} ({n})',
  round: 'round',
  stateOpen: 'open',
  stateDone: 'done',
} as UiWords;
const runOf = (id: string, state: JobState, round?: number): JobRun => ({ id, key: `k${round ?? ''}`, state });
const stageRun = (over: Partial<StageRun> & { id: string }): StageRun => ({
  jobs: [],
  rounds: [],
  done: 0,
  total: 0,
  ...over,
});
const RUN: Run = {
  canChangeTeaching: false,
  stages: [
    stageRun({ id: 'a', jobs: [runOf('first', 'checked'), runOf('second', 'open')], done: 1, total: 2 }),
    stageRun({
      id: 'b',
      rounds: [
        { number: 1, title: 'Payments', item: '### Payments', jobs: [runOf('b', 'done', 1)], state: 'done' },
        { number: 2, title: 'Search', item: '### Search', jobs: [runOf('b', 'open', 2)], state: 'open' },
      ],
      done: 1,
      total: 2,
    }),
  ],
};
/** What the diagram asked to open; a static render presses nothing, so a recording closure stands in for a spy. */
const opened: string[] = [];
const render = (props: Partial<DiagramProps> = {}) =>
  load(
    renderToStaticMarkup(
      createElement(DiagramPart, {
        workflow: flow(),
        words,
        readonly: false,
        view: 'handson',
        rounds: { b: 2 },
        run: RUN,
        onOpenStage: (stageId) => void opened.push(stageId),
        ...props,
      }),
    ),
  );
const COLUMN = 'li[class*="focus-group__item"]';

describe('success cases', () => {
  it('marks each job open, done or checked from the run, with an icon and a word', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const marks = $(COLUMN)
      .first()
      .find('[data-job-card] [data-state]')
      .map((_, el) => [[$(el).attr('data-state'), $(el).text(), $(el).find('svg').length]])
      .get();
    // ASSERT
    expect(marks).toEqual([
      ['checked', 'checked', 1],
      ['open', 'open', 1],
    ]);
  });

  it('shows the stage count from the run, such as 1/2', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const counts = $(COLUMN)
      .map((_, el) => $(el).find('[data-count]').first().text())
      .get();
    // ASSERT
    expect(counts).toEqual(['1/2 done', '1/2 done']);
  });

  it("expands a repeated stage into the viewer's rounds, titled by their pasted H3s, each with its own states", () => {
    // ARRANGE
    const $ = render();
    // ACT
    const rounds = $('[data-bracket] [data-round]')
      .map((_, el) => [[$(el).find('[data-round-title]').text(), $(el).find('[data-state]').attr('data-state')]])
      .get();
    // ASSERT
    expect(rounds).toEqual([
      ['Payments', 'done'],
      ['Search', 'open'],
    ]);
    expect($('[data-bracket-label]').text()).toBe('× each round (2)');
  });

  it('names the round on the press target of a job card inside a round, so the modal opens at that round', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const rounds = $('[data-bracket] [data-round]')
      .map((_, el) => $(el).find('button[data-try-job]').attr('data-try-round'))
      .get();
    // ASSERT
    expect(rounds).toEqual(['1', '2']);
  });

  it('still opens the stage at the job from a job card', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const opener = $(COLUMN).first().find('button[data-try-job="first"]');
    // ASSERT
    expect(opener.attr('aria-label')).toBe('Open First in A');
  });
});

describe('failure cases', () => {
  it('draws every job open and no count when no run is given', () => {
    // ARRANGE
    const $ = render({ run: undefined });
    // ACT
    const states = $('[data-job-card] [data-state]')
      .map((_, el) => $(el).attr('data-state'))
      .get();
    // ASSERT
    expect(states.every((state) => state === 'open')).toBe(true);
    expect($('[data-count]')).toHaveLength(0);
  });

  it('draws the Detailed view without any state mark', () => {
    // ARRANGE
    const $ = render({ view: 'detailed' });
    // ACT
    const marks = $('[data-state]').length;
    // ASSERT
    expect(marks).toBe(0);
  });
});

describe('edge cases', () => {
  it('draws the stage jobs once, open, when a repeated stage holds no rounds yet', () => {
    // ARRANGE
    const empty: Run = { ...RUN, stages: [RUN.stages[0]!, stageRun({ id: 'b' })] };
    const $ = render({ run: empty });
    // ACT
    const bracket = $('[data-bracket]');
    // ASSERT
    expect(bracket.find('[data-round]')).toHaveLength(0);
    expect(bracket.find('[data-job-card] [data-state]').attr('data-state')).toBe('open');
  });

  it('marks the view as handson', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const view = $('ol[data-part="diagram"]').attr('data-view');
    // ASSERT
    expect(view).toBe('handson');
  });
});
