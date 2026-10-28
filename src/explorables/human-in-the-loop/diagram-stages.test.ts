import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DiagramPart } from './diagram-part';
import type { DiagramProps, DiagramSlots, UiWords } from './human-in-the-loop.types';
import { job, stage, flow as workflow } from './workflow-fixture.pure';
import type { JobRun, JobState, Run } from './workflow-run.pure';
import type { Workflow } from './workflow.types';

const flow = (): Workflow =>
  workflow([
    { ...stage('a', [job({ id: 'a', reviewed: true })]), summary: 'Plan the whole thing' },
    { ...stage('b', [job({ id: 'b' })]), foreach: { over: 'o#epics', demo: 2 } },
    { ...stage('c', [job({ id: 'c' })]), gate: 2 },
  ]);
const words = {
  tryIt: 'Try it',
  tryFor: 'for {stage}',
  moveLabel: '{letter}: {why}',
  gate: 'Gate {n}',
  checked: 'checked',
  stateOpen: 'open',
  stateDone: 'done',
} as UiWords;
const jobRun = (id: string, state: JobState, round?: number): JobRun => ({ id, key: `k${round ?? ''}`, state });
const RUN: Run = {
  canChangeDemo: false,
  stages: [
    { id: 'a', jobs: [jobRun('a', 'checked')], rounds: [], done: 1, total: 1, state: 'checked' },
    {
      id: 'b',
      jobs: [],
      rounds: [
        { number: 1, title: 'Payments', item: '### Payments', jobs: [jobRun('b', 'done', 1)], state: 'done' },
        { number: 2, title: 'Search', item: '### Search', jobs: [jobRun('b', 'open', 2)], state: 'open' },
      ],
      done: 1,
      total: 2,
      state: 'open',
    },
    { id: 'c', jobs: [jobRun('c', 'done')], rounds: [], done: 1, total: 1, state: 'done' },
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
        view: 'stages',
        rounds: { b: 2 },
        onOpenStage: (stageId) => void opened.push(stageId),
        ...props,
      }),
    ),
  );
const COLUMN = 'li[class*="focus-group__item"]';

describe('success cases', () => {
  it('puts one "Try it" button over each stage column, named for its stage and holding no pressed state', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const tries = $(`${COLUMN} > button[data-try]`)
      .map((_, el) => `${$(el).text()}:${$(el).attr('aria-expanded') ?? 'none'}`)
      .get();
    // ASSERT
    expect(tries).toEqual(['Try it for A:none', 'Try it for B:none', 'Try it for C:none']);
  });

  it('draws a card per stage with its title and summary, and the labelled checked mark where a job is reviewed', () => {
    // ARRANGE
    const $ = render();
    const last = 2;
    // ACT
    const first = $(COLUMN).first();
    // ASSERT
    expect(first.find('[data-stage-card] [data-title]').text()).toBe('A');
    expect(first.find('[data-summary]').text()).toBe('Plan the whole thing');
    expect(first.find('[data-checked]').text()).toContain('checked');
    expect($(COLUMN).eq(last).find('[data-checked]')).toHaveLength(0);
  });

  it('draws a repeated stage as one branch card per round, with a fan out before it and a fan in after it', () => {
    // ARRANGE
    const rounds = 3;
    const $ = render({ rounds: { b: rounds } });
    // ACT
    const heads = (dir: string) =>
      ($(`svg[data-fan="${dir}"] path`).last().attr('d') ?? '').split('z').filter(Boolean).length;
    // ASSERT
    expect($(COLUMN).eq(1).find('[data-branch]')).toHaveLength(rounds);
    expect({ out: heads('out'), in: heads('in') }).toEqual({ out: rounds, in: 1 });
  });

  it('names a repeated stage on top of its column, above its branch cards, with its summary after them', () => {
    // ARRANGE
    const repeated: Workflow = {
      ...flow(),
      stages: flow().stages.map((each) => (each.id === 'b' ? { ...each, summary: 'Once per epic' } : each)),
    };
    const $ = render({ workflow: repeated });
    // ACT
    const order = $(COLUMN)
      .eq(1)
      .find('[data-title], [data-branch], [data-summary]')
      .map((_, el) =>
        $(el).is('[data-branch]') ? 'branch' : $(el).is('[data-title]') ? `title:${$(el).text()}` : 'summary',
      )
      .get();
    // ASSERT
    expect(order).toEqual(['title:B', 'branch', 'branch', 'summary']);
  });

  it('labels a gated stage with its gate badge and draws no send-back arc or word', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const gated = $(COLUMN).eq(2);
    // ASSERT
    expect(gated.find('[data-gate]').text()).toBe('Gate 2');
    expect(gated.find('[data-send-back]')).toHaveLength(0);
    expect($.root().text()).not.toContain('send back');
  });

  it('lists the BRIEF letters of a stage as circles with their tooltips, only where the Slide shows them', () => {
    // ARRANGE
    const moved: Workflow = {
      ...flow(),
      stages: flow().stages.map((each) =>
        each.id === 'a' ? { ...each, moves: [{ letter: 'B' as const, why: 'Split it.' }] } : each,
      ),
    };
    // ACT
    const shown = render({ workflow: moved, slots: { initials: true } });
    const hidden = render({ workflow: moved, slots: { initials: false } });
    // ASSERT
    expect(
      shown('[data-move]')
        .map((_, el) => shown(el).attr('aria-label'))
        .get(),
    ).toEqual(['B: Split it.']);
    expect(hidden('[data-move]')).toHaveLength(0);
  });

  it('gives each stage card its count and its open, done or checked mark once the run has work', () => {
    // ARRANGE
    const $ = render({ run: RUN });
    // ACT
    const cards = $(COLUMN)
      .map((_, el) => [
        [
          $(el).find('[data-stage-progress] [data-count]').text(),
          $(el).find('[data-stage-progress] [data-state]').attr('data-state'),
        ],
      ])
      .get();
    // ASSERT
    expect(cards).toEqual([
      ['1/1 done', 'checked'],
      ['1/2 done', 'open'],
      ['1/1 done', 'done'],
    ]);
  });

  it('titles the round cards of a repeated stage by the pasted H3s, each with its own mark', () => {
    // ARRANGE
    const $ = render({ run: RUN });
    // ACT
    const branches = $('[data-branch]')
      .map((_, el) => [[$(el).find('[data-branch-title]').text(), $(el).find('[data-state]').attr('data-state')]])
      .get();
    // ASSERT
    expect(branches).toEqual([
      ['Payments', 'done'],
      ['Search', 'open'],
    ]);
  });

  it('keeps the static checked mark only where there is no run', () => {
    // ARRANGE
    const plain = render();
    const worked = render({ run: RUN });
    // ACT
    const marks = [plain('[data-checked]').length, worked('[data-checked]').length];
    // ASSERT
    expect(marks).toEqual([1, 0]);
  });
});

describe('failure cases', () => {
  it('draws no count and no state mark without a run, as the plain Stages view', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const progress = $('[data-count], [data-state]').length;
    // ASSERT
    expect(progress).toBe(0);
  });

  it('draws no "Try it" button for a readonly Preset, and the diagram stays', () => {
    // ARRANGE
    const stages = 3;
    const $ = render({ readonly: true });
    // ACT
    const buttons = $('button').length;
    // ASSERT
    expect(buttons).toBe(0);
    expect($(COLUMN)).toHaveLength(stages);
  });

  it('opens a stage popover titled with the stage name, not a title the Slide wrote again', () => {
    // ARRANGE
    const popover = { in: 'in.', out: 'out.', inLabel: 'In:', outLabel: 'Out:' };
    const $ = render({ slots: { stages: { a: { popover } } } });
    // ACT
    const opener = $('button[aria-haspopup="dialog"]:not([data-try])');
    // ASSERT
    expect(opener).toHaveLength(1);
    expect(opener.text()).toBe('A');
  });

  it('draws no fan and one card where the run holds no rounds', () => {
    // ARRANGE
    const $ = render({ rounds: {} });
    // ACT
    const fans = $('svg[data-fan]').length;
    // ASSERT
    expect(fans).toBe(0);
    expect($(COLUMN).eq(1).find('[data-branch]')).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it("labels a stage gate with the Slide word, else the visual's gate word with its number", () => {
    // ARRANGE
    const gate = (slots?: DiagramSlots) => render({ slots }).root().find('[data-gate]').text();
    // ACT
    const slide = gate({ stages: { c: { gateLabel: 'Gate two' } } });
    const own = gate();
    // ASSERT
    expect(slide).toContain('Gate two');
    expect(own).toContain('Gate 2');
  });

  it('names the whole diagram after the Workflow when the Slide gives no label', () => {
    // ARRANGE
    const $ = render();
    // ACT
    const label = $('ol[data-part="diagram"]').attr('aria-label');
    // ASSERT
    expect(label).toBe('W');
  });
});
