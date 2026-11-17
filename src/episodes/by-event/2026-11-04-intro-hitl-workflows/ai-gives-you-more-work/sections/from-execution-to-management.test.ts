import { everyRevolutionOneCard } from '@/episodes/slide-pool/every-revolution-one-card/slide';
import { practiseItTodayAtWork } from '@/episodes/slide-pool/practise-it-today-at-work/slide';
import { youWerePromoted } from '@/episodes/slide-pool/you-were-promoted/slide';
import { describe, expect, it } from 'vitest';
import { fromExecutionToManagement } from '../slides/from-execution-to-management/slide';
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
  it('uses the shared pool Slides themselves, never a local copy of one', () => {
    // ARRANGE
    const expected = [everyRevolutionOneCard, youWerePromoted, practiseItTodayAtWork];
    // ACT
    const pages = fromExecutionToManagementSection.slice(1);
    // ASSERT
    expect(pages).toHaveLength(expected.length);
    pages.forEach((page, index) => expect(page).toBe(expected[index]));
  });
});

describe('edge cases', () => {
  it("opens the Section with the copy's own section slide", () => {
    // ARRANGE
    const expected = fromExecutionToManagement;
    // ACT
    const first = fromExecutionToManagementSection[0];
    // ASSERT
    expect(first).toBe(expected);
  });
});
