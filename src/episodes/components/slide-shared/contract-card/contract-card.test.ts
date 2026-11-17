import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContractCard, type ContractCardProps } from './contract-card';

const TERMS = { receives: 'Receives', delivers: 'Delivers', checkedBy: 'Checked by' };
const MARKS = { passed: 'Passed', failed: 'Failed' };

const render = (props: ContractCardProps) => load(renderToStaticMarkup(createElement(ContractCard, props)));

const textsOf = ($: ReturnType<typeof render>, selector: string) =>
  $(selector)
    .toArray()
    .map((node) => $(node).text().replace(/\s+/g, ' ').trim());

const marksOf = ($: ReturnType<typeof render>) =>
  $('[data-contract-check] [role="img"]')
    .toArray()
    .map((node) => $(node).attr('aria-label'));

describe('success cases', () => {
  it('lists the three terms with what the task agrees to under each, the definition set off', () => {
    // ARRANGE
    const heading = 'Contract · Food & drinks → the venue’s kitchen';
    const expected = {
      heading: [heading],
      terms: ['Receives', 'Delivers', 'Checked by'],
      values: ['200 guests, 31 vegetarian, no eggs', 'Dinner for 200', 'The menu against the definition'],
      definition: ['no eggs'],
    };
    // ACT
    const $ = render({
      heading,
      terms: TERMS,
      receives: ['200 guests, 31 vegetarian, ', createElement('b', { key: 'b' }, 'no eggs')],
      delivers: 'Dinner for 200',
      checkedBy: 'The menu against the definition',
    });
    const actual = {
      heading: textsOf($, '[data-contract-label]'),
      terms: textsOf($, '[data-contract-term]'),
      values: textsOf($, '[data-contract] dd'),
      definition: textsOf($, '[data-contract] dd b'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws the full card with its header strip, its tag and the how left open below the lines', () => {
    // ARRANGE
    const expected = { strip: 1, tag: ['The seam'], how: ['How: the kitchen’s choice'] };
    // ACT
    const $ = render({
      heading: 'Contract',
      tag: 'The seam',
      terms: TERMS,
      receives: 'a',
      delivers: 'b',
      checkedBy: 'c',
      how: 'How: the kitchen’s choice',
    });
    const actual = {
      strip: $('[data-contract-strip].bg-primary').length,
      tag: textsOf($, '[data-contract-tag]'),
      how: textsOf($, '[data-contract-how]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('ticks each check of the check variant that passed, in foreground, and names it', () => {
    // ARRANGE
    const expected = {
      labels: ['Activity for 200', 'Within budget', 'On 20 June'],
      marks: ['Passed', 'Passed', 'Passed'],
      ticks: 3,
    };
    // ACT
    const $ = render({
      heading: 'Against its contract',
      marks: MARKS,
      checks: expected.labels.map((label) => ({ label, passed: true })),
    });
    const actual = {
      labels: textsOf($, '[data-contract-check] [data-check-label]'),
      marks: marksOf($),
      ticks: $('[data-contract-check] path.stroke-foreground').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws the note card under a board note: its terms inline, the how below, filled where the Scene leads the eye', () => {
    // ARRANGE
    const expected = {
      label: ['Plan → Requirements'],
      terms: ['Receives', 'Delivers', 'Checked by'],
      values: ['31 vegetarian', 'dinner for 200', 'the menu'],
      how: ['How: the kitchen’s choice'],
      filled: 1,
      strip: 0,
    };
    // ACT
    const $ = render({
      size: 'note',
      filled: true,
      heading: 'Plan → Requirements',
      terms: TERMS,
      receives: '31 vegetarian',
      delivers: 'dinner for 200',
      checkedBy: 'the menu',
      how: 'How: the kitchen’s choice',
    });
    const actual = {
      label: textsOf($, '[data-contract-label]'),
      terms: textsOf($, '[data-contract-term]'),
      values: textsOf($, '[data-contract] dd'),
      how: textsOf($, '[data-contract-how]'),
      filled: $('[data-contract].bg-primary').length,
      strip: $('[data-contract-strip]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('crosses a check that failed in destructive, naming it failed', () => {
    // ARRANGE
    const expected = { marks: ['Passed', 'Failed'], crosses: 1, passed: ['true', 'false'] };
    // ACT
    const $ = render({
      heading: 'Against its contract',
      marks: MARKS,
      checks: [
        { label: 'Activity for 200', passed: true },
        { label: 'Step-free', passed: false },
      ],
    });
    const actual = {
      marks: marksOf($),
      crosses: $('[data-contract-check] path.stroke-destructive').length,
      passed: $('[data-contract-check]')
        .toArray()
        .map((node) => $(node).attr('data-passed')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws no how, no tag and no strip on the compact card the board pins to a seam', () => {
    // ARRANGE
    const expected = { how: 0, tag: 0, strip: 0, outlined: 1 };
    // ACT
    const $ = render({
      heading: 'Contract at the seam',
      size: 'compact',
      tag: 'The seam',
      how: 'How: the kitchen’s choice',
      terms: TERMS,
      receives: 'a',
      delivers: 'b',
      checkedBy: 'c',
    });
    const actual = {
      how: $('[data-contract-how]').length,
      tag: $('[data-contract-tag]').length,
      strip: $('[data-contract-strip]').length,
      outlined: $('[data-contract].border-primary').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('sets a node beside a term, such as a Context marker, inside that term only', () => {
    // ARRANGE
    const expected = { terms: ['Receives', 'Delivers', 'Checked by'], markerIn: [1, 0, 0] };
    // ACT
    const $ = render({
      heading: 'Contract',
      terms: TERMS,
      termMarkers: { receives: createElement('button', { 'data-marker': '' }) },
      receives: 'a',
      delivers: 'b',
      checkedBy: 'c',
    });
    const actual = {
      terms: textsOf($, '[data-contract-term]'),
      markerIn: $('[data-contract-term]')
        .toArray()
        .map((node) => $(node).find('[data-marker]').length),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
  it('leaves out the Receives line, the label and the fill on a plain note card that names none', () => {
    // ARRANGE
    const expected = { terms: ['Delivers', 'Checked by'], label: 0, filled: 0, plain: 1 };
    // ACT
    const $ = render({
      size: 'note',
      terms: TERMS,
      delivers: 'a programme for all 200',
      checkedBy: 'against the goal',
    });
    const actual = {
      terms: textsOf($, '[data-contract-term]'),
      label: $('[data-contract-label]').length,
      filled: $('[data-contract].bg-primary').length,
      plain: $('[data-contract].bg-card').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
