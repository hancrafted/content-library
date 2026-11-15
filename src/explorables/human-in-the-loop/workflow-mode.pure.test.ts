import { describe, expect, it } from 'vitest';
import { TASK } from './workflow-fixture.pure';
import { fileInMode, inMode, modeOf } from './workflow-mode.pure';
import type { StageDef, WorkflowFile } from './workflow-schema.types';

const stage = (id: string, only?: 'demo' | 'full'): StageDef => ({
  id,
  title: id,
  learningGoal: 'G',
  ...(only && { only }),
  jobs: [{ ...TASK, id }],
});

const file = (): WorkflowFile => ({
  id: 'w',
  title: 'W',
  scenario: { summary: 'S', facts: ['F'] },
  purposes: { role: 'r', context: 'c', task: 't', steps: 's', template: 'm', scope: 'o' },
  techniques: [],
  reviewer: { sections: [] },
  templates: {},
  stages: [stage('a'), stage('quick', 'demo'), stage('deep', 'full'), stage('z')],
});

describe('success cases', () => {
  it('names the mode a demo flag stands for', () => {
    // ARRANGE
    const flags = [true, false];
    // ACT
    const modes = flags.map(modeOf);
    // ASSERT
    expect(modes).toEqual(['demo', 'full']);
  });

  it('keeps a stage without `only` in both modes and a marked one in its own', () => {
    // ARRANGE
    const stages = [stage('a'), stage('quick', 'demo')];
    // ACT
    const seen = stages.map((each) => [inMode(each, 'demo'), inMode(each, 'full')]);
    // ASSERT
    expect(seen).toEqual([
      [true, true],
      [true, false],
    ]);
  });

  it('leaves out the stages of the other mode, in order', () => {
    // ARRANGE
    const source = file();
    // ACT
    const demo = fileInMode(source, 'demo').stages.map((each) => each.id);
    const full = fileInMode(source, 'full').stages.map((each) => each.id);
    // ASSERT
    expect(demo).toEqual(['a', 'quick', 'z']);
    expect(full).toEqual(['a', 'deep', 'z']);
  });
});

describe('failure cases', () => {
  it('keeps no stage of the other mode, whatever its position', () => {
    // ARRANGE
    const source = { ...file(), stages: [stage('quick', 'demo'), stage('deep', 'full')] };
    // ACT
    const ids = fileInMode(source, 'full').stages.map((each) => each.id);
    // ASSERT
    expect(ids).toEqual(['deep']);
  });
});

describe('edge cases', () => {
  it('hands back the same file when no stage is marked', () => {
    // ARRANGE
    const source = { ...file(), stages: [stage('a'), stage('z')] };
    // ACT
    const same = fileInMode(source, 'demo');
    // ASSERT
    expect(same).toBe(source);
  });
});
