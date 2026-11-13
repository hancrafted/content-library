import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { reviewToFeedback } from '../../src/pipeline/lib/spec-feedback.pure.ts';

/*
 * A Spec review round carrying the `page` and `next` lines, as the review form saves it, against the markdown-harness
 * `feedback` rule: the rule governs the file's frontmatter and h1, so a round the server writes must keep passing it.
 */

const ROOT = path.join(__dirname, '../..');
const MH = path.join(ROOT, 'node_modules/@hancrafted/markdown-harness/dist/packages/cli/cli.js');
const NOW = new Date('2026-10-15T10:40:05Z');

function savedRound(): string {
  const result = reviewToFeedback({
    fields: [
      ['pick:spent', '1a'],
      ['note:page', 'Calmer overall.'],
      ['next', 'redesign'],
    ],
    slides: [{ section: 'why', slug: 'spent', options: ['1a', '1b'] }],
    round: 1,
    now: NOW,
  });
  if (result.kind !== 'saved') throw new Error('the review was refused');
  return result.text;
}

// Runs `mh check` over one folder holding the round as feedback/01/feedback.md and returns its summary.
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
      expect(round).toContain('- `next` · gate — redesign');
      expect(result).toEqual(clean);
    });
  });
});
