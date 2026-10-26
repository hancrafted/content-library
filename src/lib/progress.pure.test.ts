import { describe, expect, it } from 'vitest';
import {
  mergeProgress,
  parseProgress,
  progressFile,
  progressKeyOf,
  readProgressFile,
  verdictOf,
} from './progress.pure';

const entry = { hash: 'abc', teaching: true, results: { 'a.b': 'text' } };

describe('success cases', () => {
  it('keys a Workflow run by the hands-on, never by Episode', () => {
    // ARRANGE
    const expected = 'human-in-the-loop/project-plan';
    // ACT
    const key = progressKeyOf('project-plan');
    // ASSERT
    expect(key).toBe(expected);
  });

  it('reads a stored entry back with its hash, teaching flag and results', () => {
    // ARRANGE
    const raw = JSON.stringify({ 'human-in-the-loop/x': entry });
    // ACT
    const all = parseProgress(raw);
    // ASSERT
    expect(all['human-in-the-loop/x']).toEqual(entry);
  });

  it('merges one entry in without dropping the entries of other hands-on', () => {
    // ARRANGE
    const raw = JSON.stringify({ other: entry });
    const next = { ...entry, hash: 'def' };
    // ACT
    const merged = JSON.parse(mergeProgress(raw, 'mine', next));
    // ASSERT
    expect(merged).toEqual({ other: entry, mine: next });
  });

  it('removes one entry and keeps the rest', () => {
    // ARRANGE
    const raw = JSON.stringify({ other: entry, mine: entry });
    // ACT
    const merged = JSON.parse(mergeProgress(raw, 'mine', null));
    // ASSERT
    expect(merged).toEqual({ other: entry });
  });

  it('resumes an entry whose hash matches', () => {
    // ARRANGE
    const current = entry.hash;
    // ACT
    const verdict = verdictOf(entry, current);
    // ASSERT
    expect(verdict).toBe('resume');
  });

  it('starts fresh when nothing is stored', () => {
    // ARRANGE
    const stored = undefined;
    // ACT
    const verdict = verdictOf(stored, entry.hash);
    // ASSERT
    expect(verdict).toBe('fresh');
  });

  it('calls an entry of an edited source stale, never resumed silently', () => {
    // ARRANGE
    const current = 'edited';
    // ACT
    const verdict = verdictOf(entry, current);
    // ASSERT
    expect(verdict).toBe('stale');
  });

  it('names the file after the Workflow and writes workflow, hash, teaching and results as YAML', () => {
    // ARRANGE
    const expected = 'workflow: project-plan\nhash: abc\nteaching: true\nresults:\n  a.b: |-\n    text\n';
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
    ['workflow: x\nhash: h\nteaching: yes\nresults: {}'],
    ['workflow: x\nhash: abc\nteaching: true\nresults:\n  a: 1'],
  ])('refuses %j as not a progress file', (text) => {
    // ARRANGE
    const expected = { refusal: 'unreadable' };
    // ACT
    const read = readProgressFile(text, { workflow: 'x', hash: entry.hash });
    // ASSERT
    expect(read).toEqual(expected);
  });

  it.each([
    ['not json'],
    ['[1]'],
    ['null'],
    ['{"x":{"hash":1}}'],
    ['{"x":{"hash":"h","teaching":true,"results":{"a":1}}}'],
  ])('reads %s as no progress', (raw) => {
    // ARRANGE
    const expected = {};
    // ACT
    const all = parseProgress(raw);
    // ASSERT
    expect(all).toEqual(expected);
  });

  it('keeps the valid entries when a neighbour is malformed', () => {
    // ARRANGE
    const raw = JSON.stringify({ bad: { hash: 1 }, good: entry });
    // ACT
    const all = parseProgress(raw);
    // ASSERT
    expect(Object.keys(all)).toEqual(['good']);
  });
});

describe('edge cases', () => {
  it('reads a file with no results as an empty run', () => {
    // ARRANGE
    const text = 'workflow: x\nhash: abc\nteaching: false\nresults: {}\n';
    // ACT
    const read = readProgressFile(text, { workflow: 'x', hash: 'abc' });
    // ASSERT
    expect(read).toEqual({ entry: { hash: 'abc', teaching: false, results: {} } });
  });

  it('reads nothing stored as no progress', () => {
    // ARRANGE
    const raw = null;
    // ACT
    const all = parseProgress(raw);
    // ASSERT
    expect(all).toEqual({});
  });

  it('starts a store from corrupt text when an entry is written', () => {
    // ARRANGE
    const raw = 'garbage';
    // ACT
    const merged = JSON.parse(mergeProgress(raw, 'mine', entry));
    // ASSERT
    expect(merged).toEqual({ mine: entry });
  });
});
