import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { editKey, editOf, partsOf, promptText, rawPrompt, roundedEdit, withEdit } from './prompt-edits.pure';
import { roundStep, stepsOf } from './workflow-prompts.pure';
import type { TaskDef, WorkflowFile } from './workflow-schema.types';
import fixtureEn from './workflow.fixture.en.yml';

const file = parse(fixtureEn) as WorkflowFile;
const taskOf = (id: string): TaskDef =>
  file.stages.flatMap((stage) => stage.jobs).find((each) => each.id === id) as TaskDef;
const reviewedLook = (): TaskDef => ({
  ...taskOf('look'),
  review: { slots: [{ id: 'note_result', mode: 'single', label: 'Result' }], checks: ['Check {{item}}.'] },
});
const share = { previous: ['brief'], output: 'note' };

const parts = {
  sections: [{ heading: 'Role', text: 'You plan for {{goal}}.' }, { text: 'Plain tail.' }],
  slots: [{ id: 'goal', mode: 'single' as const, label: 'Goal', sample: 'a trip' }],
};

describe('success cases', () => {
  it('shows the prompt as markdown with its markers raw, not filled with the sample', () => {
    // ARRANGE
    const expected = '## Role\n\nYou plan for {{goal}}.\n\nPlain tail.';
    // ACT
    const text = rawPrompt(parts);
    // ASSERT
    expect(text).toBe(expected);
  });

  it('keys an edit by level, job and step, so every round of a repeated stage shares it', () => {
    // ARRANGE
    const expected = 'simple:plan.draft.do';
    // ACT
    const key = editKey('simple', 'plan.draft', 'do');
    // ASSERT
    expect(key).toBe(expected);
  });

  it('copies the edited text with earlier results filled in', () => {
    // ARRANGE
    const edit = '## Mine\n\nPlan {{goal}} now.';
    // ACT
    const text = promptText(parts, { goal: 'a hike' }, edit);
    // ASSERT
    expect(text).toBe('## Mine\n\nPlan a hike now.');
  });

  it('copies the YAML prompt, filled, when there is no edit', () => {
    // ARRANGE
    const expected = '## Role\n\nYou plan for a hike.\n\nPlain tail.';
    // ACT
    const text = promptText(parts, { goal: 'a hike' }, undefined);
    // ASSERT
    expect(text).toBe(expected);
  });

  it('stores a text that differs from the YAML and keeps the other edits', () => {
    // ARRANGE
    const edits = { other: 'x' };
    // ACT
    const next = withEdit(edits, { key: 'k', yaml: 'yaml' }, 'changed');
    // ASSERT
    expect(next).toEqual({ other: 'x', k: 'changed' });
  });

  it('edits the template of a repeated stage, so an edit of round 1 reads in round 2 with its own item and slot', () => {
    // ARRANGE
    const [, review] = stepsOf(file, reviewedLook(), 'simple');
    const one = roundStep(review!, { number: 1, item: 'Alpha' }, share);
    const two = roundStep(review!, { number: 2, item: 'Beta' }, share);
    const shown = rawPrompt(partsOf(one.template!));
    const edit = 'MINE {{item}} and {{note_result}}';
    // ACT
    const text = promptText(partsOf(two), { 'note_result#2': 'R2' }, roundedEdit(edit, two));
    // ASSERT
    expect(rawPrompt(partsOf(two.template!))).toBe(shown);
    expect(shown).toContain('{{item}}');
    expect(text).toBe('MINE Beta and R2');
  });

  it('keeps the Technical command text apart from the Simple prompt, under its own key', () => {
    // ARRANGE
    const task = taskOf('ask');
    // ACT
    const simple = stepsOf(file, task, 'simple')[0]!;
    const technical = stepsOf(file, task, 'technical')[0]!;
    // ASSERT
    expect(rawPrompt(partsOf(technical))).not.toBe(rawPrompt(partsOf(simple)));
    expect(editKey('technical', 'ask', 'do')).toBe('technical:ask.do');
    expect(editKey('technical', 'ask', 'do')).not.toBe(editKey('simple', 'ask', 'do'));
  });

  it('writes an edit through the change callback, and drops it on Reset', () => {
    // ARRANGE
    const sent: Record<string, string>[] = [];
    const state = { values: { k: 'mine' }, onChange: (v: Record<string, string>) => sent.push(v) };
    // ACT
    const step = editOf(state, { key: 'k', yaml: 'yaml' });
    step.onText('new');
    step.onReset();
    // ASSERT
    expect(step.text).toBe('mine');
    expect(sent).toEqual([{ k: 'new' }, {}]);
  });
});

describe('failure cases', () => {
  it('leaves a marker no slot fills in the copied text as it is', () => {
    // ARRANGE
    const edit = 'Use {{unknown}} and {{goal}}.';
    // ACT
    const text = promptText({ ...parts, slots: [] }, {}, edit);
    // ASSERT
    expect(text).toBe('Use {{unknown}} and {{goal}}.');
  });
});

describe('edge cases', () => {
  it('removes the edit when the text equals the YAML again', () => {
    // ARRANGE
    const edits = { k: 'changed', other: 'x' };
    // ACT
    const next = withEdit(edits, { key: 'k', yaml: 'yaml' }, 'yaml');
    // ASSERT
    expect(next).toEqual({ other: 'x' });
  });

  it('keeps an emptied textarea as an edit, since it differs from the YAML', () => {
    // ARRANGE
    const edits = {};
    // ACT
    const next = withEdit(edits, { key: 'k', yaml: 'yaml' }, '');
    // ASSERT
    expect(next).toEqual({ k: '' });
  });

  it('removes an edit by passing null (Reset)', () => {
    // ARRANGE
    const edits = { k: 'changed' };
    // ACT
    const next = withEdit(edits, { key: 'k', yaml: 'yaml' }, null);
    // ASSERT
    expect(next).toEqual({});
  });

  it('shows the YAML prompt when there is no edit', () => {
    // ARRANGE
    const state = { values: {}, onChange: () => undefined };
    // ACT
    const step = editOf(state, { key: 'k', yaml: 'yaml' });
    // ASSERT
    expect(step.text).toBe('yaml');
    expect(step.edit).toBeUndefined();
  });

  it('leaves the edit as it is for a step that is no round', () => {
    // ARRANGE
    const [first] = stepsOf(file, taskOf('ask'), 'simple');
    // ACT
    const edit = roundedEdit('x {{item}}', first!);
    // ASSERT
    expect(edit).toBe('x {{item}}');
  });
});
