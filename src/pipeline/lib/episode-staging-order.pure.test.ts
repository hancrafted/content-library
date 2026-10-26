import { describe, expect, it } from 'vitest';
import { checkStagingOrder } from './episode-staging-order.pure';

/*
 * In-memory staging files: a feedback round, a research file and a run log
 * that each record order, built to break exactly one order rule per test.
 */

const FEEDBACK_PATH = 'feedback/01/feedback.md';

function feedback(round: number): string {
  return [
    '---',
    'type: feedback',
    `round: ${round}`,
    'via: app',
    '---',
    '',
    `# Feedback round ${round}`,
    '',
    '- `why--spent` · content — Cut it.',
    '',
  ].join('\n');
}

describe('success cases', () => {
  it('finds nothing when feedback rounds match their folders', () => {
    // ARRANGE
    const files = {
      [FEEDBACK_PATH]: feedback(1),
      'feedback/02/feedback.md': feedback(2),
    };
    // ACT
    const findings = checkStagingOrder(files);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names a feedback file whose round differs from its folder number', () => {
    // ARRANGE
    const files = { [FEEDBACK_PATH]: feedback(2) };
    const expected = [{ kind: 'feedback-round', file: FEEDBACK_PATH }];
    const expectedFix = 'round: 1';
    // ACT
    const findings = checkStagingOrder(files);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedFix);
  });

  it('names two feedback files that share a round', () => {
    // ARRANGE
    const other = 'feedback/1/feedback.md';
    const files = { [FEEDBACK_PATH]: feedback(1), [other]: feedback(1) };
    const expected = [{ kind: 'feedback-round', file: other }];
    const expectedFirst = FEEDBACK_PATH;
    // ACT
    const findings = checkStagingOrder(files);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedFirst);
  });
});

describe('edge cases', () => {
  it('reads no order from a run-log.md a branch in flight keeps', () => {
    // ARRANGE
    const files = { 'run-log.md': '# Run log\n\n## b · 2026-10-12T10:00:00Z\n\n## a · 2026-10-12T09:00:00Z\n' };
    // ACT
    const findings = checkStagingOrder(files);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
