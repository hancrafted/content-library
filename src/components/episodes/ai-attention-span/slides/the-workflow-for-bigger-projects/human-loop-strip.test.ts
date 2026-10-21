import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HumanLoopStrip } from './human-loop-strip';

const words = {
  label: 'The loop',
  you: 'You',
  youRole: 'captain',
  planner: 'Planner chat',
  workers: 'Worker chats',
  handoff: 'Handoff',
  results: 'Results',
  plannerAgain: 'Planner',
  youAgain: 'You',
  checked: 'checked',
  check: 'You check every artifact in between',
};

const render = () =>
  load(
    renderToStaticMarkup(
      createElement(HumanLoopStrip, {
        ...words,
        workersMarker: null,
        workerNames: ['Venue', 'Catering', 'Invitations'],
      }),
    ),
  );

describe('success cases', () => {
  it('walks the loop from you through the planner and the workers and back to you', () => {
    // ARRANGE
    const expected = ['You', 'Planner chat', 'Handoff', 'Worker chats', 'Results', 'Planner', 'You'];
    // ACT
    const $ = render();
    const steps = $('[data-step]')
      .map((_, el) => $(el).attr('data-step'))
      .get();
    // ASSERT
    expect(steps).toEqual(expected);
  });

  it('puts the check on the two artifacts, the handoff and the results, and says you check them', () => {
    // ARRANGE
    const expected = { checked: ['Handoff', 'Results'], note: 'You check every artifact in between' };
    // ACT
    const $ = render();
    const actual = {
      checked: $('[data-artifact]')
        .map((_, el) => $(el).attr('data-step'))
        .get(),
      note: $('[data-check-note]').text(),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('draws no check on a chat: only the artifacts between the chats are checked', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const count = render()('[data-actor] [data-check]').length;
    // ASSERT
    expect(count).toBe(expected);
  });
});

describe('edge cases', () => {
  it('lists the worker chats as a fresh chat each', () => {
    // ARRANGE
    const expected = ['Venue', 'Catering', 'Invitations'];
    // ACT
    const $ = render();
    const workers = $('[data-worker]')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(workers).toEqual(expected);
  });
});
