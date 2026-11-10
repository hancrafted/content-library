import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { probeExpectations, probePrompt, type ProbeQuestion } from './probe.pure.ts';

const TEMPLATE = readFileSync(path.join(import.meta.dirname, '../judge/probe.md'), 'utf8');

const source = { file: 'handoff.md', quote: 'from the frozen input' };
const QUESTIONS: ProbeQuestion[] = [
  {
    id: 'anchor',
    question: 'Where is a pool anchored?',
    choices: { a: 'At the card centre', b: 'At the nearest point of the rounded border' },
    answer: ['b'],
    source,
  },
  {
    id: 'next-actions',
    question: 'Which Next actions does the page offer?',
    choices: { a: 'Revise this page', b: 'Ship it', c: 'Stop here' },
    answer: ['a', 'c'],
    source,
  },
];
const PAGE_TEXT = 'The pool is anchored at the nearest point of the rounded border.';

describe('reader probe', () => {
  describe('success cases', () => {
    it('asks the reader every question with its choices, and never shows the key or its source', () => {
      // ARRANGE
      const files = ['1-load.png', 'page.txt'];
      const expected = [
        '- `anchor`: Where is a pool anchored?',
        '  - `a`: At the card centre',
        '  - `b`: At the nearest point of the rounded border',
        '- `next-actions`: Which Next actions does the page offer?',
      ];

      // ACT
      const prompt = probePrompt(TEMPLATE, QUESTIONS, files);

      // ASSERT
      for (const line of [...expected, '- `1-load.png`', '- `page.txt`']) expect(prompt).toContain(line);
      expect(prompt).not.toContain(source.quote);
      expect(prompt).not.toContain('{{');
    });

    it('scores each answer against the key and quotes its evidence', () => {
      // ARRANGE
      const answers = [
        { id: 'anchor', choices: ['b'], evidence: 'anchored at the nearest point of the rounded border' },
        { id: 'next-actions', choices: ['c', 'a'], evidence: 'Stop here' },
      ];
      const expected = [
        {
          text: 'probe anchor: Where is a pool anchored?',
          passed: true,
          evidence: 'answered b; key b: "anchored at the nearest point of the rounded border"',
        },
        {
          text: 'probe next-actions: Which Next actions does the page offer?',
          passed: true,
          evidence: 'answered a, c; key a, c: "Stop here" (not in the page text; seen in a screenshot or invented)',
        },
      ];

      // ACT
      const expectations = probeExpectations(QUESTIONS, answers, PAGE_TEXT);

      // ASSERT
      expect(expectations).toEqual(expected);
    });
  });

  describe('failure cases', () => {
    it('fails a partial multiple-choice answer', () => {
      // ARRANGE
      const answers = [{ id: 'next-actions', choices: ['a'], evidence: '' }];

      // ACT
      const [, nextActions] = probeExpectations(QUESTIONS, answers, PAGE_TEXT);

      // ASSERT
      expect(nextActions).toEqual({ text: nextActions.text, passed: false, evidence: 'answered a; key a, c' });
    });

    it('fails unknown, and a question the reader left unanswered', () => {
      // ARRANGE
      const answers = [{ id: 'anchor', choices: ['unknown'], evidence: '' }];
      const expected = [
        { passed: false, evidence: 'answered unknown, which counts as fail; key b' },
        { passed: false, evidence: 'the reader gave no answer; key a, c' },
      ];

      // ACT
      const expectations = probeExpectations(QUESTIONS, answers, PAGE_TEXT);

      // ASSERT
      expect(expectations.map(({ passed, evidence }) => ({ passed, evidence }))).toEqual(expected);
    });
  });
});
