import { describe, expect, it } from 'vitest';
import { editKey, promptText, rawPrompt, withEdit } from './prompt-edits.pure';

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
});
