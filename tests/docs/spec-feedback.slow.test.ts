import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { reviewToFeedback } from '../../src/pipeline/lib/spec-feedback.pure.ts';

// decision: ARCH-003 §4.4
const ROOT = path.join(__dirname, '../..');
const MH = path.join(ROOT, 'node_modules/@hancrafted/markdown-harness/dist/packages/cli/cli.js');
const NOW = new Date('2026-10-15T10:40:05Z');
const NEXT_LINE = '- `next` · gate — redesign';

function savedRound(): string {
  const result = reviewToFeedback({
    lines: [
      '- `why--spent` · design — picked: 1a',
      '- `page` · design — Calmer overall.',
      '- `next` · gate — redesign',
    ].join('\n'),
    slides: [{ section: 'why', slug: 'spent', options: ['1a', '1b'] }],
    round: 1,
    now: NOW,
  });
  if (result.kind !== 'saved') throw new Error('the review was refused');
  return result.text;
}

function checkAsFeedback(markdown: string): unknown {
  const folder = mkdtempSync(path.join(tmpdir(), 'spec-feedback-'));
  try {
    writeFileSync(path.join(folder, 'feedback.md'), markdown);
    let output: string;
    try {
      output = execFileSync(
        process.execPath,
        [MH, 'check', '--root', folder, '--config', path.join(ROOT, 'markdown-harness.config.yaml')],
        { encoding: 'utf8' },
      );
    } catch (error) {
      output = (error as { stdout: string }).stdout;
    }
    return JSON.parse(output).result;
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

describe('a Spec feedback round with the page and next lines', () => {
  describe('success cases', () => {
    it('passes the feedback rule in mh check', () => {
      // ARRANGE
      const round = savedRound();
      const clean = { summary: { governedFiles: 1, invalidFiles: 0, totalViolations: 0 }, files: [] };
      // ACT
      const result = checkAsFeedback(round);
      // ASSERT
      expect(round).toContain(NEXT_LINE);
      expect(result).toEqual(clean);
    });
  });
});
