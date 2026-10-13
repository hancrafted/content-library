import { describe, expect, it } from 'vitest';
import { checkMapping, field, isString, optional, requiredWhen } from './mapping-fields.pure';

/*
 * One small field list, then one mapping per test: the order of findings
 * (missing, unknown, invalid) is part of the contract callers print.
 */

const FIELDS = [
  field('id', isString, 'it must be a name'),
  optional(field('note', isString, 'it must be text')),
  requiredWhen(false, field('rubric', isString, 'it must be a path')),
];

describe('success cases', () => {
  it('finds nothing in a mapping with every required key and valid values', () => {
    // ARRANGE
    const mapping = { id: 'research', note: 'one question' };
    // ACT
    const messages = checkMapping('Job', mapping, FIELDS);
    // ASSERT
    expect(messages).toEqual([]);
  });
});

describe('failure cases', () => {
  it('reports a missing key, then an unknown key, then an invalid value', () => {
    // ARRANGE
    const mapping = { note: 3, owner: 'han' };
    const expected = [
      'Job lacks the key "id".',
      'Job has an unknown key "owner"; the keys are id, note, rubric.',
      'Job has note 3; it must be text.',
    ];
    // ACT
    const messages = checkMapping('Job', mapping, FIELDS);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('requires a conditional key only when its condition holds', () => {
    // ARRANGE
    const fields = [
      field('id', isString, 'it must be a name'),
      requiredWhen(true, field('rubric', isString, 'it must be a path')),
    ];
    const expected = ['Agent lacks the key "rubric".'];
    // ACT
    const messages = checkMapping('Agent', { id: 'reviewer' }, fields);
    // ASSERT
    expect(messages).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leaves an optional or unrequired key out without a finding', () => {
    // ARRANGE
    const mapping = { id: 'brief-grill' };
    // ACT
    const messages = checkMapping('Job', mapping, FIELDS);
    // ASSERT
    expect(messages).toEqual([]);
  });
});
