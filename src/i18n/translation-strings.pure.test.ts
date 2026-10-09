import { describe, expect, it } from 'vitest';
import { translationStrings } from './translation-strings.pure';

/** A stand-in for next-intl's `t`: tags each full key, so a test sees which key was read for which leaf. */
const tagged = (key: string) => `<${key}>`;

describe('success cases', () => {
  it('reads every leaf of a namespace by its full key, keeping the nesting', () => {
    // ARRANGE
    const shape = { title: 'Contents', remaining: { one: '# min left', other: '# min left' } };
    const expected = {
      title: '<toc.title>',
      remaining: { one: '<toc.remaining.one>', other: '<toc.remaining.other>' },
    };
    // ACT
    const strings = translationStrings('toc', shape, { read: tagged });
    // ASSERT
    expect(strings).toEqual(expected);
  });

  it('leaves out the keys it is told to, so a leaf that needs ICU arguments is never read bare', () => {
    // ARRANGE
    const shape = { title: 'Context', citation: 'Source {number}', tabs: { notes: 'Notes' } };
    const expected = { title: '<drawer.title>', tabs: { notes: '<drawer.tabs.notes>' } };
    // ACT
    const strings = translationStrings('drawer', shape, { read: tagged, omit: ['citation'] });
    // ASSERT
    expect(strings).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lets a failing read throw, so a broken leaf fails the build instead of shipping', () => {
    // ARRANGE
    const shape = { citation: 'Source {number}' };
    const message = 'FORMATTING_ERROR: drawer.citation';
    const strict = (key: string): string => {
      throw new Error(`FORMATTING_ERROR: ${key}`);
    };
    // ACT
    const read = () => translationStrings('drawer', shape, { read: strict });
    // ASSERT
    expect(read).toThrow(message);
  });
});

describe('edge cases', () => {
  it('reads nothing from an empty namespace', () => {
    // ARRANGE
    const shape = {};
    // ACT
    const strings = translationStrings('empty', shape, { read: tagged });
    // ASSERT
    expect(strings).toEqual({});
  });
});
