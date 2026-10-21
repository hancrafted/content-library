import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VenuePipeline, type StageView } from './venue-pipeline';
import { STAGES } from './venue-pipeline.pure';

const MOVES: Record<string, string> = {
  party: 'Break it down',
  interview: 'Interview yourself with AI',
  requirements: 'Requirements first',
  research: 'Fresh start for each piece',
  compare: 'Evaluate each step',
  recommendation: 'for your boss',
};

const POPOVER = { title: 'T', in: 'i', out: 'o', inLabel: 'In:', outLabel: 'Out:' };

const stages = (withPopover: boolean): StageView[] =>
  STAGES.map((stage) => ({
    stage,
    name: stage.id,
    move: MOVES[stage.id],
    popover: withPopover ? POPOVER : undefined,
    jobsLabel: `${stage.id}: jobs`,
    body: null,
  }));

const render = (props: { acronym: boolean; popovers?: boolean }) =>
  load(
    renderToStaticMarkup(
      createElement(VenuePipeline, {
        label: 'pipeline',
        acronym: props.acronym,
        stages: stages(props.popovers ?? true),
      }),
    ),
  );

describe('success cases', () => {
  it('bolds the first letter of each move when the acronym is on', () => {
    // ARRANGE
    const expected = ['B', 'I', 'R', 'F', 'E'];
    // ACT
    const $ = render({ acronym: true });
    const initials = $('li > div b')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(initials).toEqual(expected);
  });

  it('keeps the move words whole in either case', () => {
    // ARRANGE
    const expected = ['Break it down', 'Break it down'];
    // ACT
    const texts = [true, false].map((acronym) => render({ acronym })('li > div > span').first().text());
    // ASSERT
    expect(texts).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('bolds no letter when the acronym is off', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const count = render({ acronym: false })('li > div b').length;
    // ASSERT
    expect(count).toBe(expected);
  });
});

describe('edge cases', () => {
  it('shows a stage name as plain text where it has no popover', () => {
    // ARRANGE
    const expected = { buttons: 0, name: 'party' };
    // ACT
    const $ = render({ acronym: false, popovers: false });
    const actual = { buttons: $('button').length, name: $('li > div > p').first().text() };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
