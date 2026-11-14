import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { reviewToFeedback } from './spec-feedback.pure.ts';

/*
 * Copy as prompt copies the lines a save writes (design-ADR 0011). The Spec template holds the page's one formatter,
 * `feedbackLines`, between two marker comments; this runs that function beside `reviewToFeedback` on the same
 * fields, so the clipboard text and `feedback.md` cannot drift apart. Fields and Slides are hand-written here.
 */

const TEMPLATE = readFileSync(path.join(__dirname, '../../../skills/new-episode/assets/spec-template.html'), 'utf8');
const START = '// feedback-lines:start';
const END = '// feedback-lines:end';

type Field = readonly [string, string];
interface Item {
  slug: string;
  anchor: string;
}
type FeedbackLines = (items: readonly Item[], fields: readonly Field[]) => string[];

/** The template's `feedbackLines`, evaluated on its own source. */
function pageFormatter(): FeedbackLines {
  const source = TEMPLATE.slice(TEMPLATE.indexOf(START) + START.length, TEMPLATE.indexOf(END));
  return new Function(`${source}\nreturn feedbackLines;`)() as FeedbackLines;
}

const SLIDES = [
  { section: 'why', slug: 'spent', options: ['1a', '1b'] },
  { section: 'why', slug: 'quiet', options: ['2a', '2b', '2c'] },
];
const ITEMS: Item[] = [
  { slug: 'top', anchor: 'top' },
  { slug: 'spent', anchor: 'why--spent' },
  { slug: 'quiet', anchor: 'why--quiet' },
];
const BRIEF = ['brief--learning-goal'];
const NOW = new Date('2026-10-15T10:40:05Z');

/** The item lines of the file the server writes: everything after the h1. */
function serverLines(fields: readonly Field[], titleSlide: string[] | null = ['0a', '0b']): string[] {
  const result = reviewToFeedback({
    fields,
    slides: SLIDES,
    titleSlide: titleSlide ?? undefined,
    brief: BRIEF,
    round: 1,
    now: NOW,
  });
  if (result.kind !== 'saved') throw new Error(`refused: ${JSON.stringify(result)}`);
  return result.text.split('\n').slice(result.text.split('\n').indexOf('# Feedback round 1') + 2, -1);
}

describe('success cases', () => {
  it.each([
    [
      'picks, notes on every kind of item and the next action',
      [
        ['pick:top', '0b'],
        ['note:top', 'Fuel the rocket in fewer steps.'],
        ['pick:spent', '1a'],
        ['note:spent', ''],
        ['pick:quiet', '2b'],
        ['note:quiet', 'Thinner bar,\r\n  more air.'],
        ['note:brief--learning-goal', 'Sharper goal.'],
        ['note:visual-language', 'More accent.'],
        ['note:page', 'Calmer overall.\n\nSecond paragraph.'],
        ['next', 'redesign'],
      ] satisfies Field[],
    ],
    [
      'a Slide set to Redesign with and without a note, and the last next action winning',
      [
        ['pick:top', '0a'],
        ['pick:spent', '1b'],
        ['pick:spent', '1b'],
        ['note:quiet', 'None fit: try a heat strip.'],
        ['note:page', ''],
        ['next', 'approve'],
        ['next', 'redesign'],
      ] satisfies Field[],
    ],
    ['no picks, no notes and no next action', [['note:page', '']] satisfies Field[]],
  ])('writes %s as the lines the server writes', (_name, fields) => {
    // ARRANGE
    const expected = serverLines(fields);
    // ACT
    const lines = pageFormatter()(ITEMS, fields);
    // ASSERT
    expect(lines).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('finds both markers in the template, so the formatter under test is the page script', () => {
    // ARRANGE
    const markers = [START, END].map((marker) => TEMPLATE.split(marker).length - 1);
    // ACT
    const formatter = pageFormatter();
    // ASSERT
    expect(markers).toEqual([1, 1]);
    expect(formatter).toBeTypeOf('function');
  });
});

describe('edge cases', () => {
  it('writes the same lines for a Spec that has no Title slide', () => {
    // ARRANGE
    const fields: Field[] = [
      ['pick:spent', '1a'],
      ['pick:quiet', '2c'],
      ['note:page', 'Calmer.'],
      ['next', 'redesign'],
    ];
    const expected = serverLines(fields, null);
    // ACT
    const lines = pageFormatter()(
      ITEMS.filter(({ slug }) => slug !== 'top'),
      fields,
    );
    // ASSERT
    expect(lines).toEqual(expected);
  });
});
