import { describe, expect, it } from 'vitest';
import { levelOptions } from './level-options.pure';

const WORDS = { chat: 'Chat', cli: 'CLI', chatTip: 'Chat tip', cliTip: 'CLI tip' };

describe('success cases', () => {
  it('offers Chat for the simple level and CLI for the technical one, in that order', () => {
    // ARRANGE
    const words = WORDS;
    // ACT
    const options = levelOptions(words);
    // ASSERT
    expect(options).toEqual([
      { value: 'simple', label: 'Chat', tip: 'Chat tip' },
      { value: 'technical', label: 'CLI', tip: 'CLI tip' },
    ]);
  });
});

describe('failure cases', () => {
  it('never leaks the stored level names into the labels', () => {
    // ARRANGE
    const words = WORDS;
    // ACT
    const labels = levelOptions(words).map((option) => option.label);
    // ASSERT
    expect(labels).not.toContain('simple');
    expect(labels).not.toContain('technical');
  });
});

describe('edge cases', () => {
  it('follows the words of the locale', () => {
    // ARRANGE
    const words = { chat: 'Chat', cli: 'Konsole', chatTip: 'a', cliTip: 'b' };
    // ACT
    const options = levelOptions(words);
    // ASSERT
    expect(options.map((option) => option.label)).toEqual(['Chat', 'Konsole']);
  });
});
