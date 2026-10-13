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

function runLog(entries: readonly string[]): string {
  return ['# Run log', '', ...entries.flatMap((entry) => [`## ${entry}`, '', '### Notes', '', 'Done.', '']), ''].join(
    '\n',
  );
}

describe('success cases', () => {
  it('finds nothing when feedback rounds match their folders, and the run log runs forward', () => {
    // ARRANGE
    const files = {
      [FEEDBACK_PATH]: feedback(1),
      'feedback/02/feedback.md': feedback(2),
      'run-log.md': runLog(['brief-grill · 2026-10-12T09:00:00Z', 'research · 2026-10-12T10:15:00Z']),
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

  it('names a run-log entry stamped earlier than the entry above it', () => {
    // ARRANGE
    const late = 'write-voice-script · 2026-10-12T10:00:00Z';
    const files = {
      'run-log.md': runLog(['brief-grill · 2026-10-12T09:00:00Z', 'research · 2026-10-12T10:15:00Z', late]),
    };
    const expected = [{ kind: 'run-log-order', file: 'run-log.md' }];
    // ACT
    const findings = checkStagingOrder(files);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(late);
  });
});

describe('edge cases', () => {
  it('accepts run-log entries stamped at the same instant, compared as instants across offsets', () => {
    // ARRANGE
    const files = {
      'run-log.md': runLog([
        'research · 2026-10-12T10:15:00Z',
        'research · 2026-10-12T10:15:00Z',
        'write-spec · 2026-10-12T11:20:00+01:00',
        'write-dossier · 2026-10-12T10:30:00Z',
      ]),
    };
    // ACT
    const findings = checkStagingOrder(files);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
