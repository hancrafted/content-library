import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HabitList, type Habit } from './habit-list';

const HABITS: readonly Habit[] = [
  { title: 'One chat, one job', body: 'Open a new chat.', target: { 'data-target': 'habit-one' } },
  { title: 'Ask for a handoff', body: 'Read it.', target: { 'data-target': 'habit-two' } },
  { title: 'Start the next chat', body: 'Paste it in.', target: { 'data-target': 'habit-three' } },
];

const render = (habits: readonly Habit[]) =>
  load(renderToStaticMarkup(createElement(HabitList, { label: 'Three everyday habits', habits })));

describe('success cases', () => {
  it('numbers the habits in order, each with its title and body', () => {
    // ARRANGE
    const expected = [
      { number: '1', title: 'One chat, one job', body: 'Open a new chat.' },
      { number: '2', title: 'Ask for a handoff', body: 'Read it.' },
      { number: '3', title: 'Start the next chat', body: 'Paste it in.' },
    ];
    // ACT
    const $ = render(HABITS);
    const items = $('ol > li')
      .map((_, el) => ({
        number: $(el).children('span').text(),
        title: $(el).find('p').first().text(),
        body: $(el).find('p').last().text(),
      }))
      .get();
    // ASSERT
    expect(items).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('hides the number from assistive tech, since the list already counts', () => {
    // ARRANGE
    const expected = ['true', 'true', 'true'];
    // ACT
    const $ = render(HABITS);
    const hidden = $('ol > li > span')
      .map((_, el) => $(el).attr('aria-hidden'))
      .get();
    // ASSERT
    expect(hidden).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lays six habits out as two rows of three', () => {
    // ARRANGE
    const six = [...HABITS, ...HABITS.map((habit) => ({ ...habit, title: `${habit.title} again` }))];
    const expected = { items: 6, columns: 'md:grid-cols-3' };
    // ACT
    const $ = render(six);
    // ASSERT
    expect({
      items: $('ol > li').length,
      columns: $('ol')
        .attr('class')
        ?.match(/md:grid-cols-3/)?.[0],
    }).toEqual(expected);
  });

  it('draws a habit without a Speaker note target', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const $ = render([{ title: 'Break it down', body: 'Split it.' }]);
    // ASSERT
    expect($('ol > li')).toHaveLength(expected);
  });

  it('marks each habit as the target its Speaker note lights', () => {
    // ARRANGE
    const expected = ['habit-one', 'habit-two', 'habit-three'];
    // ACT
    const $ = render(HABITS);
    const targets = $('ol > li')
      .map((_, el) => $(el).attr('data-target'))
      .get();
    // ASSERT
    expect(targets).toEqual(expected);
  });
});
