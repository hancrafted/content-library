import { describe, expect, it } from 'vitest';
import configSource from './brief-or-pay-the-price.config.yml';
import { PRESET_IDS } from './brief-or-pay-the-price.types';
import { loadConfig, parseConfig } from './config.pure';

const FILE = 'brief-or-pay-the-price.config.yml';
const DRIVE = 'drive: { view: stages, level: workflow, scenario: drive, picker: false, layers: [] }';
const problemsOf = (source: string): readonly string[] => {
  const result = loadConfig(source);
  return 'problems' in result ? result.problems : [];
};

describe('success cases', () => {
  it('loads a Preset for each Slide that shows the Explorable, with the picker hidden on the DRIVE one', () => {
    // ARRANGE
    const expected = { play: true, drive: false };
    // ACT
    const { presets } = parseConfig(configSource);
    // ASSERT
    expect(Object.keys(presets)).toEqual([...PRESET_IDS]);
    expect({ play: presets.play.picker, drive: presets.drive.picker }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a missing Preset', () => {
    // ARRANGE
    const source = configSource.replace(DRIVE, '');
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toContain(`${FILE}: presets.drive: missing`);
  });

  it('refuses a Preset this Explorable does not have', () => {
    // ARRANGE
    const source = configSource.replace(
      DRIVE,
      `${DRIVE}\n  extra: { view: price, level: define, scenario: drive, picker: true, layers: [] }`,
    );
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toContain(`${FILE}: presets.extra: not a Preset of this Explorable`);
  });

  it('refuses an unknown view and level', () => {
    // ARRANGE
    const source = configSource.replace('view: stages, level: workflow', 'view: tea, level: attic');
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toContain(`${FILE}: presets.drive: view "tea" is not one of price, brief, brace, stages`);
    expect(problems).toContain(`${FILE}: presets.drive: level "attic" is not one of define, agent, workflow`);
  });

  it('refuses a picker that is not true or false and a Scenario that is not a name', () => {
    // ARRANGE
    const source = configSource.replace('scenario: drive, picker: false', "scenario: '', picker: maybe");
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toContain(`${FILE}: presets.drive: picker is true or false`);
    expect(problems).toContain(`${FILE}: presets.drive: scenario names a Scenario file`);
  });

  it('refuses a toggle the Preset’s level does not offer', () => {
    // ARRANGE
    const source = configSource.replace('picker: false, layers: []', 'picker: false, layers: [habits]');
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toContain(`${FILE}: presets.drive: toggle "habits" is not offered at the workflow level`);
  });
});

describe('edge cases', () => {
  it('accepts a Preset that opens at the Agent level with the habits toggle on', () => {
    // ARRANGE
    const source = configSource.replace(
      'level: workflow, scenario: drive, picker: false, layers: []',
      'level: agent, scenario: drive, picker: false, layers: [habits]',
    );
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toEqual([]);
  });
});
