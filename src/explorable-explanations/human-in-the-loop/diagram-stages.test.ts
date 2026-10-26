import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { DiagramPart } from './diagram-part';
import { DiagramStages } from './diagram-stages';
import type { DiagramSlots, UiWords } from './human-in-the-loop.types';
import { job, stage, flow as workflow } from './workflow-fixture.pure';
import type { Workflow } from './workflow.types';

const flow = (fanOut: number): Workflow =>
  workflow([
    stage('a', [job({ id: 'a' })]),
    stage('b', [job({ id: 'b', title: 'Chat', fanOut })]),
    stage('c', [job({ id: 'c' })]),
  ]);
const words = { tryIt: 'Try it', tryFor: 'for {stage}', moveLabel: '{letter}: {why}', gate: 'Gate {n}' } as UiWords;
const scene = (workflow: Workflow, slots?: DiagramSlots, readonly = false) =>
  load(
    renderToStaticMarkup(
      createElement(DiagramStages, {
        workflow,
        slots,
        words,
        readonly,
        onOpenStage: vi.fn(),
      }),
    ),
  );

describe('success cases', () => {
  it('puts one "Try it" button under each stage column, named for its stage and holding no pressed state', () => {
    // ARRANGE
    const html = renderToStaticMarkup(
      createElement(DiagramPart, {
        workflow: flow(2),
        words,
        readonly: false,
        onOpenStage: vi.fn(),
      }),
    );
    // ACT
    const $ = load(html);
    const tries = $('li[class*="focus-group__item"] > button[data-try]')
      .map((_, el) => `${$(el).text()}:${$(el).attr('aria-expanded') ?? 'none'}`)
      .get();
    // ASSERT
    expect(tries).toEqual(['Try it for A:none', 'Try it for B:none', 'Try it for C:none']);
  });

  it('draws no "Try it" button for a readonly Preset, and the diagram stays', () => {
    // ARRANGE
    const stages = 3;
    const $ = scene(flow(2), undefined, true);
    // ACT
    const buttons = $('button').length;
    // ASSERT
    expect(buttons).toBe(0);
    expect($('li[class*="focus-group__item"]')).toHaveLength(stages);
  });

  it('lists the BRIEF letters of a stage as circles with their tooltips, only where the Slide shows them', () => {
    // ARRANGE
    const moved: Workflow = {
      ...flow(2),
      stages: flow(2).stages.map((stage) =>
        stage.id === 'a' ? { ...stage, moves: [{ letter: 'B' as const, why: 'Split it.' }] } : stage,
      ),
    };
    // ACT
    const shown = scene(moved, { initials: true });
    const hidden = scene(moved, { initials: false });
    // ASSERT
    expect(
      shown('[data-move]')
        .map((_, el) => shown(el).attr('aria-label'))
        .get(),
    ).toEqual(['B: Split it.']);
    expect(hidden('[data-move]')).toHaveLength(0);
  });

  it('draws the sign-off card of the focal stage from the Workflow, not from the Slide', () => {
    // ARRANGE
    const card = { label: 'The card', lines: ['One', 'Two'], status: 'Done' };
    const carded: Workflow = {
      ...flow(2),
      focalJobId: 'a',
      stages: flow(2).stages.map((stage) => (stage.id === 'a' ? { ...stage, gate: 1, card } : stage)),
    };
    // ACT
    const text = scene(carded)('li[class*="focus-group__item"]').first().text();
    // ASSERT
    expect(text).toContain('The card');
    expect(text).toContain('One');
    expect(text).toContain('Done');
  });

  it.each([2, 4])('draws a fan out and a fan in with %i branches', (n) => {
    // ARRANGE
    const $ = scene(flow(n));
    // ACT
    const heads = (dir: string) =>
      ($(`svg[data-fan="${dir}"] path`).last().attr('d') ?? '').split('z').filter(Boolean).length;
    // ASSERT
    expect({
      out: heads('out'),
      in: heads('in'),
      chats: $('li[class*="focus-group__item"]').eq(1).find('ol > li').length,
    }).toEqual({
      out: n,
      in: 1,
      chats: n,
    });
  });
});

describe('failure cases', () => {
  it('opens a stage popover titled with the stage name, not a title the Slide wrote again', () => {
    // ARRANGE
    const popover = { in: 'in.', out: 'out.', inLabel: 'In:', outLabel: 'Out:' };
    const $ = scene(flow(2), { stages: { b: { popover } } });
    // ACT
    const opener = $('button[aria-haspopup="dialog"]:not([data-try])');
    // ASSERT
    expect(opener).toHaveLength(1);
    expect(opener.text()).toBe('B');
  });

  it('draws no fan where no job runs parallel chats', () => {
    // ARRANGE
    const $ = scene(flow(1));
    // ACT
    const fans = $('svg[data-fan]').length;
    // ASSERT
    expect(fans).toBe(0);
  });
});

describe('edge cases', () => {
  it('names each stage list from the Slide template and the stage name, a stage slot winning', () => {
    // ARRANGE
    const slots = { jobsLabel: '{stage}: jobs', stages: { c: { jobsLabel: 'Last one' } } };
    // ACT
    const $ = scene(flow(2), slots);
    const labels = $('li[class*="focus-group__item"] > div > ol')
      .map((_, el) => $(el).attr('aria-label'))
      .get();
    // ASSERT
    expect(labels).toEqual(['A: jobs', 'B: jobs', 'Last one']);
  });

  it("labels a stage gate with the Slide word, else the visual's gate word with its number", () => {
    // ARRANGE
    const gated: Workflow = { ...flow(2), stages: flow(2).stages.map((stage) => ({ ...stage, gate: 1 })) };
    // ACT
    const stageA = (slots?: DiagramSlots) => {
      const $ = scene(gated, slots);
      return $('li[class*="focus-group__item"]').first().find('ol').text();
    };
    // ASSERT
    expect(stageA({ stages: { a: { gateLabel: 'Gate one' } } })).toContain('Gate one');
    expect(stageA()).toMatch(/JGate 1$/);
  });

  it('names the whole diagram after the Workflow when the Slide gives no label', () => {
    // ARRANGE
    const $ = scene(flow(2));
    // ACT
    const label = $('ol[data-part="diagram"]').attr('aria-label');
    // ASSERT
    expect(label).toBe('W');
  });
});
