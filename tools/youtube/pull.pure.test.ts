import { describe, expect, it } from 'vitest';
import { descriptionFingerprint } from './apply.pure.ts';
import { CHAPTER_END_MARKER, CHAPTER_START_MARKER } from './chapters.pure.ts';
import { comparePull } from './pull.pure.ts';

const FILE = {
  description: `Hook\n\n${CHAPTER_START_MARKER}\n00:00 Intro\n${CHAPTER_END_MARKER}`,
  pinnedComment: 'Kommentar',
  commentId: 'Ugx1',
};

describe('success cases', () => {
  it('reports no edits when YouTube shows the repo copy', () => {
    // ARRANGE
    const remote = { description: 'Hook\n\n00:00 Intro\r\n', comment: 'Kommentar' };
    // ACT
    const result = comparePull(FILE, remote);
    // ASSERT
    expect([result.description.edited, result.comment.edited]).toEqual([false, false]);
  });

  it('reports an edited description against the published repo copy, markers excluded', () => {
    // ARRANGE
    const remote = { description: 'Neuer Hook\n\n00:00 Intro', comment: 'Kommentar' };
    // ACT
    const result = comparePull(FILE, remote);
    // ASSERT
    expect(result.description).toEqual({
      edited: true,
      repo: 'Hook\n\n00:00 Intro',
      youtube: 'Neuer Hook\n\n00:00 Intro',
    });
  });
});

describe('edge cases', () => {
  it('reports no comment edit when no comment was posted', () => {
    // ARRANGE
    const remote = { description: 'Hook\n\n00:00 Intro', comment: undefined };
    // ACT
    const result = comparePull({ ...FILE, commentId: '' }, remote);
    // ASSERT
    expect(result.comment.edited).toBe(false);
  });
});

describe('who changed the description', () => {
  const sent = 'Hook\n\n00:00 Intro';

  it('calls it a YouTube edit when YouTube no longer shows what apply last sent', () => {
    // ARRANGE
    const file = { ...FILE, appliedDescription: descriptionFingerprint(sent) };
    // ACT
    const result = comparePull(file, { description: 'Hook aus Studio\n\n00:00 Intro', comment: 'Kommentar' });
    // ASSERT
    expect(result.descriptionChange).toBe('youtube');
  });

  it('calls it a repo change not yet applied when YouTube still shows what apply last sent', () => {
    // ARRANGE
    const file = { ...FILE, description: 'Neuer Hook', appliedDescription: descriptionFingerprint(sent) };
    // ACT
    const result = comparePull(file, { description: sent, comment: 'Kommentar' });
    // ASSERT
    expect(result.descriptionChange).toBe('repo');
  });

  it('cannot tell without a stored fingerprint', () => {
    // ARRANGE
    const remote = { description: 'Anders', comment: 'Kommentar' };
    // ACT
    const result = comparePull(FILE, remote);
    // ASSERT
    expect(result.descriptionChange).toBe('unknown');
  });
});
