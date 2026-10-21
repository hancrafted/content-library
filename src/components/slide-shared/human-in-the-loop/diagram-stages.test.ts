import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { DiagramPart } from './diagram-part.client';
import { DiagramStages } from './diagram-stages';
import type { DiagramSlots, UiWords } from './human-in-the-loop.types';
import { workflowView } from './workflow-view.pure';
import type { Job, Workflow } from './workflow.types';

const base: Job = {
  id: 'j',
  title: 'J',
  description: 'D',
  chat: 'new',
  dependsOn: [],
  inputs: [],
  outputs: [],
  skills: [],
  prompt: 'P',
};
const flow = (fanOut: number): Workflow => ({
  id: 'w',
  title: 'W',
  scenario: 'S',
  stages: [
    { id: 'a', name: 'A', jobs: [{ ...base, id: 'a' }] },
    { id: 'b', name: 'B', jobs: [{ ...base, id: 'b', title: 'Chat', fanOut }] },
    { id: 'c', name: 'C', jobs: [{ ...base, id: 'c' }] },
  ],
});
const scene = (workflow: Workflow, slots?: DiagramSlots) =>
  load(
    renderToStaticMarkup(
      createElement(DiagramStages, {
        workflow,
        view: workflowView(workflow, { mode: 'watch', level: 'simple' }),
        slots,
        words: { signedOff: 'Signed off' },
      }),
    ),
  );

describe('success cases', () => {
  it('numbers every job in drawing order as a button that opens it', () => {
    // ARRANGE
    const words = { signedOff: 'Signed off' } as UiWords;
    const html = renderToStaticMarkup(
      createElement(DiagramPart, {
        workflow: flow(2),
        view: workflowView(flow(2), { mode: 'try', level: 'simple' }),
        words,
        openJobId: 'b',
        onOpenJob: vi.fn(),
      }),
    );
    // ACT
    const $ = load(html);
    const steps = $('button[aria-pressed]')
      .map((_, el) => `${$(el).attr('aria-label')}:${$(el).attr('aria-pressed')}`)
      .get();
    // ASSERT
    expect(steps).toEqual(['1 J:false', '2 Chat:true', '3 J:false']);
  });

  it('draws no step buttons in Watch mode', () => {
    // ARRANGE
    const words = { signedOff: 'Signed off' } as UiWords;
    const html = renderToStaticMarkup(
      createElement(DiagramPart, {
        workflow: flow(2),
        view: workflowView(flow(2), { mode: 'watch', level: 'simple' }),
        words,
        openJobId: null,
        onOpenJob: vi.fn(),
      }),
    );
    // ACT
    const buttons = load(html)('button').length;
    // ASSERT
    expect(buttons).toBe(0);
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
    const opener = $('button[aria-haspopup="dialog"]');
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
    const labels = $('li[class*="focus-group__item"] > ol')
      .map((_, el) => $(el).attr('aria-label'))
      .get();
    // ASSERT
    expect(labels).toEqual(['A: jobs', 'B: jobs', 'Last one']);
  });

  it('labels a stage gate with the Slide word, else the bare number', () => {
    // ARRANGE
    const gated: Workflow = { ...flow(2), stages: flow(2).stages.map((stage) => ({ ...stage, gate: 1 })) };
    // ACT
    const stageA = (slots?: DiagramSlots) => {
      const $ = scene(gated, slots);
      return $('li[class*="focus-group__item"]').first().find('ol').text();
    };
    // ASSERT
    expect(stageA({ stages: { a: { gateLabel: 'Gate one' } } })).toContain('Gate one');
    expect(stageA()).toMatch(/J1$/);
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
