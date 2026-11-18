import { describe, expect, it } from 'vitest';
import { SCENARIO_IDS, allScenarios, scenarioFor } from './scenarios';

describe('success cases', () => {
  it('registers DRIVE first, named by its acronym', () => {
    // ARRANGE
    const first = SCENARIO_IDS[0];
    // ACT
    const acronym = scenarioFor('drive').acronym;
    // ASSERT
    expect(first).toBe('drive');
    expect(acronym).toBe('DRIVE');
  });

  it('loads every registered Scenario with its file name as id', () => {
    // ARRANGE
    const expected = [...SCENARIO_IDS];
    // ACT
    const ids = allScenarios().map((scenario) => scenario.id);
    // ASSERT
    expect(ids).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('loads a shipped Scenario only when it has no problems', () => {
    // ARRANGE
    const scenarios = allScenarios();
    // ACT
    const files = scenarios.map((scenario) => scenario.file);
    // ASSERT
    expect(files).toEqual(SCENARIO_IDS.map((id) => `scenarios/${id}.yml`));
  });
});

describe('edge cases', () => {
  it('gives both layouts for every registered Scenario', () => {
    // ARRANGE
    const expected = ['horizontal', 'vertical'];
    // ACT
    const orientations = allScenarios().map((scenario) => Object.keys(scenario.layouts).sort());
    // ASSERT
    expect(orientations.every((each) => each.join() === expected.join())).toBe(true);
  });
});
