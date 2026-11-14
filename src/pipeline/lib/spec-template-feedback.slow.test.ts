import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { reviewToFeedback } from './spec-feedback.pure.ts';

/*
 * The Spec template's page script is the one formatter of the review's feedback lines (design-ADR 0011): Save posts
 * them, the server validates and writes them, and Copy as prompt copies them. The template holds the functions
 * under test between marker comments; this evaluates them on their own source and runs the formatter's lines through
 * the server's reader, so the page and the server cannot drift apart. It reads the template from disk, so it is a
 * slow test (ARCH-003-testing §4.4); `skills/**` is a rerun trigger in `vitest.slow.config.mts`.
 */

const TEMPLATE = readFileSync(path.join(__dirname, '../../../skills/new-episode/assets/spec-template.html'), 'utf8');

type Field = readonly [string, string];
interface Item {
  slug: string;
  anchor: string;
}
type FeedbackLines = (items: readonly Item[], fields: readonly Field[]) => string[];
type DraftKey = (root: { dataset: { pageId: string; revision: string } }) => string;

/** The template's function between its `// <name>:start` and `// <name>:end` markers, evaluated on its own source. */
function pageFunction<T>(name: string, binding: string): T {
  const start = `// ${name}:start`;
  const source = TEMPLATE.slice(TEMPLATE.indexOf(start) + start.length, TEMPLATE.indexOf(`// ${name}:end`));
  return new Function(`${source}\nreturn ${binding};`)() as T;
}

const SLIDES = [
  { section: 'why', slug: 'spent', options: ['1a', '1b'] },
  { section: 'why', slug: 'quiet', options: ['2a', '2b', '2c'] },
];
const TITLE = ['0a', '0b'];
const ITEMS: Item[] = [
  { slug: 'top', anchor: 'top' },
  { slug: 'spent', anchor: 'why--spent' },
  { slug: 'quiet', anchor: 'why--quiet' },
];
const BRIEF = ['brief--learning-goal'];
const NOW = new Date('2026-10-15T10:40:05Z');
const ROUND = 1;

const feedbackLines = () => pageFunction<FeedbackLines>('feedback-lines', 'feedbackLines');

/** The item lines of the file the server writes: everything after the h1. */
function serverLines(lines: readonly string[], titleSlide: string[] | undefined = TITLE) {
  const result = reviewToFeedback({
    lines: lines.join('\n'),
    slides: SLIDES,
    titleSlide,
    brief: BRIEF,
    round: ROUND,
    now: NOW,
  });
  if (result.kind !== 'saved') throw new Error(`refused: ${JSON.stringify(result.faults)}`);
  const written = result.text.split('\n');
  return written.slice(written.indexOf('# Feedback round 1') + 2, -1);
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
      'a Slide set to Redesign, with and without a note, and the last next action winning',
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
  ])('writes %s as lines the server accepts and writes as they are', (_name, fields) => {
    // ARRANGE
    const lines = feedbackLines()(ITEMS, fields);
    // ACT
    const written = serverLines(lines);
    // ASSERT
    expect(written).toEqual(lines);
  });
});

describe('failure cases', () => {
  it('finds both markers of each function in the template, so the code under test is the page script', () => {
    // ARRANGE
    const names = ['feedback-lines', 'draft-key'];
    const markers = names.flatMap((name) => [`// ${name}:start`, `// ${name}:end`]);
    const expected = markers.map(() => 1);
    // ACT
    const found = markers.map((marker) => TEMPLATE.split(marker).length - 1);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('writes lines the server refuses under approve while a Slide is set to Redesign, as the page does', () => {
    // ARRANGE
    const fields: Field[] = [
      ['pick:top', '0a'],
      ['pick:spent', '1a'],
      ['next', 'approve'],
    ];
    const lines = feedbackLines()(ITEMS, fields);
    const expected = 'Slide 2 "quiet" is set to Redesign: pick an Option before you approve.';
    // ACT
    const result = reviewToFeedback({
      lines: lines.join('\n'),
      slides: SLIDES,
      titleSlide: TITLE,
      round: ROUND,
      now: NOW,
    });
    // ASSERT
    expect(result.kind === 'rejected' ? result.faults.map(({ message }) => message) : []).toEqual([expected]);
  });
});

describe('edge cases', () => {
  it('writes accepted lines for a Spec that has no Title slide', () => {
    // ARRANGE
    const fields: Field[] = [
      ['pick:spent', '1a'],
      ['pick:quiet', '2c'],
      ['note:page', 'Calmer.'],
      ['next', 'redesign'],
    ];
    const lines = feedbackLines()(
      ITEMS.filter(({ slug }) => slug !== 'top'),
      fields,
    );
    // ACT
    const written = serverLines(lines, undefined);
    // ASSERT
    expect(written).toEqual(lines);
  });

  it('keys a draft by the page id and the revision, so a later round starts on the defaults', () => {
    // ARRANGE
    const draftKey = pageFunction<DraftKey>('draft-key', 'draftKey');
    const root = (pageId: string, revision: string) => ({ dataset: { pageId, revision } });
    // ACT
    const keys = [root('budget', '2'), root('budget', '3'), root('cost', '2')].map(draftKey);
    // ASSERT
    expect(new Set(keys).size).toBe(keys.length);
  });
});
