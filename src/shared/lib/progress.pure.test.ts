import { describe, expect, it } from 'vitest';
import { mergeProgress, parseProgress, progressKeyOf, verdictOf } from './progress.pure';

const entry = { hash: 'abc', demo: true, results: { 'a.b': 'text' } };

describe('success cases', () => {
  it('keys a Workflow run by the hands-on, never by Episode', () => {
    // ARRANGE
    const expected = 'human-in-the-loop/project-plan';
    // ACT
    const key = progressKeyOf('project-plan');
    // ASSERT
    expect(key).toBe(expected);
  });

  it('reads a stored entry back with its hash, demo flag and results', () => {
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
});

describe('failure cases', () => {
  it.each([
    ['not json'],
    ['[1]'],
    ['null'],
    ['{"x":{"hash":1}}'],
    ['{"x":{"hash":"h","demo":true,"results":{"a":1}}}'],
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
