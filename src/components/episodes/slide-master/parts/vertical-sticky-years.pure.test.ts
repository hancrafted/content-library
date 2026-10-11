import { describe, expect, it } from 'vitest';
import { CHIP_GLYPHS, groupByYear } from './vertical-sticky-years.pure';

const entry = (date: string, title: string) => ({ date, title, caption: `${title} caption` });

describe('success cases', () => {
  it('gathers consecutive entries of one year under that year, in page order', () => {
    // ARRANGE
    const entries = [entry('2022', 'Kickoff'), entry('2022', 'Research'), entry('2023', 'Prototype')];
    const expectedYears = ['2022', '2023'];
    const expectedFirstTitles = ['Kickoff', 'Research'];
    // ACT
    const groups = groupByYear(entries);
    // ASSERT
    expect(groups.map((group) => group.year)).toEqual(expectedYears);
    expect(groups[0].entries.map((item) => item.title)).toEqual(expectedFirstTitles);
  });

  it('numbers every entry by its place in the whole timeline and gives it that place’s glyph', () => {
    // ARRANGE
    const entries = [entry('2022', 'Kickoff'), entry('2023', 'Prototype'), entry('2023', 'Pilot')];
    const expectedIndex = 2;
    const expectedGlyph = CHIP_GLYPHS[2];
    // ACT
    const last = groupByYear(entries)[1].entries[1];
    // ASSERT
    expect(last.index).toBe(expectedIndex);
    expect(last.glyph).toBe(expectedGlyph);
  });
});

describe('failure cases', () => {
  it('rejects an entry with a blank date instead of pinning an empty year', () => {
    // ARRANGE
    const entries = [entry('2022', 'Kickoff'), entry('  ', 'Research')];
    const blankEntry = 'Research';
    // ACT
    const group = () => groupByYear(entries);
    // ASSERT
    expect(group).toThrow(blankEntry);
  });
});

describe('edge cases', () => {
  it('opens a new group when a year comes back later, so page order is never reshuffled', () => {
    // ARRANGE
    const entries = [entry('2022', 'Kickoff'), entry('2023', 'Prototype'), entry('2022', 'Review')];
    const expectedYears = ['2022', '2023', '2022'];
    // ACT
    const groups = groupByYear(entries);
    // ASSERT
    expect(groups.map((group) => group.year)).toEqual(expectedYears);
  });

  it('cycles the glyphs once the timeline holds more entries than there are glyphs', () => {
    // ARRANGE
    const entries = Array.from({ length: CHIP_GLYPHS.length + 1 }, (_, i) => entry('2024', `Entry ${i}`));
    const expectedGlyph = CHIP_GLYPHS[0];
    // ACT
    const [group] = groupByYear(entries);
    // ASSERT
    expect(group.entries.at(-1)?.glyph).toBe(expectedGlyph);
  });

  it('returns no groups for an empty timeline', () => {
    // ARRANGE
    const entries: { date: string; title: string; caption: string }[] = [];
    // ACT
    const groups = groupByYear(entries);
    // ASSERT
    expect(groups).toEqual([]);
  });
});
