import { describe, expect, it } from 'vitest';
import { ownTranslator } from './slide-translator';

/* A Slide's translator over its own messages, as the container and the landing cards build it. */
const MESSAGES = { title: 'The cost curve', count: '{n, plural, one {# token} other {# tokens}}' };

describe('success cases', () => {
  it('reads a Slide’s own message for the page’s locale', () => {
    // ARRANGE
    const expected = 'The cost curve';
    // ACT
    const text = ownTranslator(MESSAGES, 'en')('title');
    // ASSERT
    expect(text).toBe(expected);
  });
});

describe('failure cases', () => {
  it('throws on a missing message instead of shipping its key', () => {
    // ARRANGE
    const missing = 'caption';
    // ACT
    const read = () => ownTranslator(MESSAGES, 'en')(missing);
    // ASSERT
    expect(read).toThrow(missing);
  });
});

describe('edge cases', () => {
  it('formats plurals by the locale it was built for', () => {
    // ARRANGE
    const expected = '2 tokens';
    // ACT
    const text = ownTranslator(MESSAGES, 'de')('count', { n: 2 });
    // ASSERT
    expect(text).toBe(expected);
  });
});
