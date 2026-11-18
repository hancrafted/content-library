import { describe, expect, it } from 'vitest';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { missingLabels, parseMatrix } from './matrix.pure';
import matrixYml from './matrix.yml';

const MATRIX = parseMatrix(matrixYml);

describe('success cases', () => {
  it('reads the three groups in order, Foundation first', () => {
    // ARRANGE
    const expected = ['foundation', 'enablement', 'engineering'];
    // ACT
    const groups = MATRIX.groups.map(({ key }) => key);
    // ASSERT
    expect(groups).toEqual(expected);
  });

  it.each([
    ['en', en],
    ['de', de],
  ])('labels every group and row key in %s', (_locale, messages) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const missing = missingLabels(MATRIX, messages);
    // ASSERT
    expect(missing).toEqual(expected);
  });

  it('marks the three Episodes of today as covered today', () => {
    // ARRANGE
    const expected = ['attention', 'freelancer', 'more-work'];
    // ACT
    const today = MATRIX.groups.flatMap(({ rows }) => rows.filter((row) => row.today).map(({ key }) => key));
    // ASSERT
    expect(today).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names a row key without a label', () => {
    // ARRANGE
    const matrix = parseMatrix(
      'groups:\n  - key: foundation\n    rows:\n      - { key: new-row, enablement: true, engineering: false }\n',
    );
    // ACT
    const missing = missingLabels(matrix, en);
    // ASSERT
    expect(missing).toEqual(['rows.new-row']);
  });

  it('refuses a row without its track marks', () => {
    // ARRANGE
    const text = 'groups:\n  - key: foundation\n    rows:\n      - { key: attention }\n';
    // ACT
    const parse = () => parseMatrix(text);
    // ASSERT
    expect(parse).toThrow();
  });
});

describe('edge cases', () => {
  it('reads a row without a today flag as not covered today', () => {
    // ARRANGE
    const text =
      'groups:\n  - key: foundation\n    rows:\n      - { key: spec, enablement: true, engineering: true }\n';
    // ACT
    const [row] = parseMatrix(text).groups[0]?.rows ?? [];
    // ASSERT
    expect(row?.today).toBe(false);
  });
});
