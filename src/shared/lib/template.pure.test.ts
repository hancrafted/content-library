import { describe, expect, it } from 'vitest';
import { fillTemplate, templateSegments } from './template.pure';

describe('success cases', () => {
  it('fills every named placeholder with its value', () => {
    // ARRANGE
    const template = 'Show all {count} Episodes in {topic}';
    const values = { count: 12, topic: 'AI' };
    const expected = 'Show all 12 Episodes in AI';
    // ACT
    const text = fillTemplate(template, values);
    // ASSERT
    expect(text).toBe(expected);
  });

  it('fills a placeholder each time it appears', () => {
    // ARRANGE
    const template = '{n} of {n}';
    const expected = '3 of 3';
    // ACT
    const text = fillTemplate(template, { n: 3 });
    // ASSERT
    expect(text).toBe(expected);
  });
  it('splits a template into text and the named slots a component renders', () => {
    // ARRANGE
    const template = 'Set up the {skills}, or {download}.';
    const expected = [
      { text: 'Set up the ' },
      { slot: 'skills' },
      { text: ', or ' },
      { slot: 'download' },
      { text: '.' },
    ];
    // ACT
    const segments = templateSegments(template, ['skills', 'download']);
    // ASSERT
    expect(segments).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps a placeholder outside the named slots as text, so the gap shows', () => {
    // ARRANGE
    const template = 'See {guide} now';
    const expected = [{ text: 'See {guide} now' }];
    // ACT
    const segments = templateSegments(template, ['skills']);
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('leaves a placeholder it has no value for as written, so the gap shows', () => {
    // ARRANGE
    const template = '{count} of {total}';
    const expected = '4 of {total}';
    // ACT
    const text = fillTemplate(template, { count: 4 });
    // ASSERT
    expect(text).toBe(expected);
  });
});

describe('edge cases', () => {
  it('returns a template without placeholders unchanged, and fills 0', () => {
    // ARRANGE
    const plain = 'No Episodes';
    const zero = '{count} left';
    const expected = ['No Episodes', '0 left'];
    // ACT
    const texts = [fillTemplate(plain, { count: 1 }), fillTemplate(zero, { count: 0 })];
    // ASSERT
    expect(texts).toEqual(expected);
  });
});
