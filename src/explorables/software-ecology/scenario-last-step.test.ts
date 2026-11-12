import { describe, expect, it } from 'vitest';
import { scenarioLastStep } from './scenario-last-step';

/* A state of the use-case file, played headless by id: the hero and the Why · How · What stills read `still` (grill 11 Q215). */
describe('success cases', () => {
  it('plays the still state by id to its check’s week, AI at Engineering', () => {
    // ARRANGE
    const expected = { preset: 'still', week: 20, ai: ['eng'] };
    // ACT
    const run = scenarioLastStep('tire', 'still');
    // ASSERT
    expect({ preset: run.preset.id, week: run.week, ai: run.f.settings.ai }).toEqual(expected);
  });

  it('plays the same run every time the same state is asked for', () => {
    // ARRANGE
    const first = scenarioLastStep('tire', 'still');
    // ACT
    const again = scenarioLastStep('tire', 'still');
    // ASSERT
    expect(again).toBe(first);
  });
});

describe('failure cases', () => {
  it('refuses a state the use case does not have', () => {
    // ARRANGE
    const message = /The tire use case has no nowhere state/;
    // ACT
    const play = () => scenarioLastStep('tire', 'nowhere');
    // ASSERT
    expect(play).toThrow(message);
  });
});

describe('edge cases', () => {
  it('stands on the warmed state when it has neither a tour nor a check', () => {
    // ARRANGE
    const expected = { week: 0, ai: 'off' };
    // ACT
    const run = scenarioLastStep('tire', 'roles');
    // ASSERT
    expect({ week: run.week, ai: run.f.settings.ai }).toEqual(expected);
  });
});
