import { describe, expect, it } from 'vitest';
import { envProblem, parseCredentials, planApply } from './apply.pure.ts';
import { CHAPTER_END_MARKER, CHAPTER_START_MARKER } from './chapters.pure.ts';

const BLOCK = `${CHAPTER_START_MARKER}\n00:00 Intro\n${CHAPTER_END_MARKER}`;
const PUBLISHED = '00:00 Intro';
const COMMENT = 'Pinned text';
const COMMENT_ID = 'Ugx123';
const file = (overrides = {}) => ({ description: BLOCK, pinnedComment: COMMENT, commentId: '', ...overrides });

describe('success cases', () => {
  it('updates a description that differs from the remote', () => {
    // ARRANGE
    const expected = { action: 'update', text: PUBLISHED };
    // ACT
    const plan = planApply(file(), 'old description');
    // ASSERT
    expect(plan.description).toEqual(expected);
  });

  it('writes nothing for a description that is unchanged, ignoring line endings and outer whitespace', () => {
    // ARRANGE
    const expected = { action: 'none' };
    // ACT
    const plan = planApply(file(), `${PUBLISHED}\r\n\n`);
    // ASSERT
    expect(plan.description).toEqual(expected);
  });

  it('posts the comment when no ID is stored', () => {
    // ARRANGE
    const expected = { action: 'post', text: COMMENT };
    // ACT
    const plan = planApply(file(), PUBLISHED);
    // ASSERT
    expect(plan.comment).toEqual(expected);
  });

  it('posts no comment when an ID is stored', () => {
    // ARRANGE
    const expected = 'none';
    // ACT
    const plan = planApply(file({ commentId: COMMENT_ID }), PUBLISHED);
    // ASSERT
    expect(plan.comment.action).toBe(expected);
  });

  it('reads the three credentials from .env text', () => {
    // ARRANGE
    const text = 'YOUTUBE_CLIENT_ID=a\nYOUTUBE_CLIENT_SECRET="b"\n# c\nYOUTUBE_REFRESH_TOKEN=c=d\n';
    const expected = { value: { clientId: 'a', clientSecret: 'b', refreshToken: 'c=d' } };
    // ACT
    const credentials = parseCredentials(text);
    // ASSERT
    expect(credentials).toEqual(expected);
  });

  it('accepts an ignored, untracked .env', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const problem = envProblem({ exists: true, tracked: false, ignored: true });
    // ASSERT
    expect(problem).toBe(expected);
  });
});

describe('failure cases', () => {
  it.each([
    ['tracked', { exists: true, tracked: true, ignored: true }],
    ['not ignored', { exists: true, tracked: false, ignored: false }],
    ['missing', { exists: false, tracked: false, ignored: true }],
  ])('refuses a .env that is %s', (_name, state) => {
    // ARRANGE
    const expected = 'string';
    // ACT
    const problem = envProblem(state);
    // ASSERT
    expect(typeof problem).toBe(expected);
  });

  it('names the missing credentials without their values', () => {
    // ARRANGE
    const expected = ['YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REFRESH_TOKEN'];
    // ACT
    const result = parseCredentials('YOUTUBE_CLIENT_ID=a');
    // ASSERT
    expect(result).toEqual({ missing: expected });
  });
});

describe('edge cases', () => {
  it('posts no comment when the comment text is empty', () => {
    // ARRANGE
    const expected = 'none';
    // ACT
    const plan = planApply(file({ pinnedComment: '' }), PUBLISHED);
    // ASSERT
    expect(plan.comment.action).toBe(expected);
  });
});
