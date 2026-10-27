import { describe, expect, it } from 'vitest';
import { progressFile, readProgressFile } from './progress-file.pure';

const entry = { hash: 'abc', demo: true, results: { 'a.b': 'text' } };

describe('success cases', () => {
  it('names the file after the Workflow and writes workflow, hash, demo and results as YAML', () => {
    // ARRANGE
    const expected = 'workflow: project-plan\nhash: abc\ndemo: true\nresults:\n  a.b: |-\n    text\n';
    // ACT
    const file = progressFile('project-plan', entry);
    // ASSERT
    expect(file.name).toBe('project-plan-progress.yml');
    expect(file.text).toBe(expected);
  });

  it('writes every result as a block scalar, multi-line ones with their line breaks', () => {
    // ARRANGE
    const multi = { ...entry, results: { 'a.b': '# Spec\n\nfirst: line\n  indented\n' } };
    // ACT
    const file = progressFile('x', multi);
    // ASSERT
    expect(file.text).toContain('a.b: |\n    # Spec\n');
  });

  it('reads a downloaded file back as the same entry', () => {
    // ARRANGE
    const run = { ...entry, results: { 'a.b': '# Spec\n\nkey: value\n  indented\n', 'a.c': ' leading', 'a.d': '' } };
    const { text } = progressFile('x', run);
    // ACT
    const read = readProgressFile(text, { workflow: 'x', hash: run.hash });
    // ASSERT
    expect(read).toEqual({ entry: run });
  });
});

describe('failure cases', () => {
  const file = progressFile('x', entry).text;

  it('refuses a file of another Workflow, naming the reason', () => {
    // ARRANGE
    const expected = { refusal: 'other-workflow' };
    // ACT
    const read = readProgressFile(file, { workflow: 'y', hash: entry.hash });
    // ASSERT
    expect(read).toEqual(expected);
  });

  it('refuses a file made against another version of the Workflow', () => {
    // ARRANGE
    const expected = { refusal: 'changed' };
    // ACT
    const read = readProgressFile(file, { workflow: 'x', hash: 'edited' });
    // ASSERT
    expect(read).toEqual(expected);
  });

  it.each([
    ['not: [yaml'],
    ['- a list'],
    ['just text'],
    ['workflow: x\nhash: h\ndemo: yes\nresults: {}'],
    ['workflow: x\nhash: abc\ndemo: true\nresults:\n  a: 1'],
  ])('refuses %j as not a progress file', (text) => {
    // ARRANGE
    const expected = { refusal: 'unreadable' };
    // ACT
    const read = readProgressFile(text, { workflow: 'x', hash: entry.hash });
    // ASSERT
    expect(read).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('reads a file with no results as an empty run', () => {
    // ARRANGE
    const text = 'workflow: x\nhash: abc\ndemo: false\nresults: {}\n';
    // ACT
    const read = readProgressFile(text, { workflow: 'x', hash: 'abc' });
    // ASSERT
    expect(read).toEqual({ entry: { hash: 'abc', demo: false, results: {} } });
  });
});
