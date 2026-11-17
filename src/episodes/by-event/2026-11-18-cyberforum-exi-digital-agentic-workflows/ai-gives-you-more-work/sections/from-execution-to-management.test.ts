import { describe, expect, it } from 'vitest';
import { fromExecutionToManagementSection } from './from-execution-to-management';

describe('success cases', () => {
  it('lists the section slide, then the three page Slides in Spec order', () => {
    // ARRANGE
    const expected = [
      'from-execution-to-management',
      'every-revolution-one-card',
      'you-were-promoted',
      'practise-it-today-at-work',
    ];
    // ACT
    const slugs = fromExecutionToManagementSection.map((each) => each.slug);
    // ASSERT
    expect(slugs).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lists no Slide twice', () => {
    // ARRANGE
    const slugs = fromExecutionToManagementSection.map((each) => each.slug);
    // ACT
    const repeated = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    // ASSERT
    expect(repeated).toEqual([]);
  });
});

describe('edge cases', () => {
  it('opens the Section with its section slide', () => {
    // ARRANGE
    const expected = 'from-execution-to-management';
    // ACT
    const first = fromExecutionToManagementSection[0]?.slug;
    // ASSERT
    expect(first).toBe(expected);
  });
});
