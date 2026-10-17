import { describe, expect, it } from 'vitest';
import { EMPHASIS_CLOSE, EMPHASIS_OPEN, isEmphasised, runsOf, splitEmphasis } from './caption-emphasis.pure';

/** A caption as `t.markup` writes it, `<b>` chunks wrapped in the two marks. */
function marked(...parts: readonly string[]): string {
  return parts.map((part, index) => (index % 2 === 1 ? `${EMPHASIS_OPEN}${part}${EMPHASIS_CLOSE}` : part)).join('');
}

describe('success cases', () => {
  it('reads the plain text and where each emphasised run starts and ends in it', () => {
    // ARRANGE
    const expected = { text: 'A full pipeline: revenue lands here.', emphasis: [{ start: 17, end: 30 }] };
    // ACT
    const split = splitEmphasis(marked('A full pipeline: ', 'revenue lands', ' here.'));
    // ASSERT
    expect(split).toEqual(expected);
  });

  it('splits the text into runs, each emphasised or not, in order', () => {
    // ARRANGE
    const expected = [
      { text: 'A ', emphasis: false },
      { text: 'b', emphasis: true },
      { text: ' c', emphasis: false },
    ];
    const ranges = [{ start: 2, end: 3 }];
    // ACT
    const runs = runsOf('A b c', ranges);
    // ASSERT
    expect(runs).toEqual(expected);
  });

  it('tells whether one character of the text is emphasised', () => {
    // ARRANGE
    const ranges = [{ start: 2, end: 3 }];
    const inside = 2;
    const after = 3;
    // ACT
    const flags = [isEmphasised(inside, ranges), isEmphasised(after, ranges)];
    // ASSERT
    expect(flags).toEqual([true, false]);
  });
});

describe('failure cases', () => {
  it('refuses a mark left open, which would emphasise the rest of the caption', () => {
    // ARRANGE
    const expected = /unbalanced/;
    // ACT
    const split = () => splitEmphasis(`A ${EMPHASIS_OPEN}b`);
    // ASSERT
    expect(split).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('leaves a caption with no emphasis as one plain run', () => {
    // ARRANGE
    const expected = { text: 'Plain.', emphasis: [] };
    const run = [{ text: 'Plain.', emphasis: false }];
    // ACT
    const split = splitEmphasis('Plain.');
    // ASSERT
    expect(split).toEqual(expected);
    expect(runsOf(split.text, split.emphasis)).toEqual(run);
  });
});
