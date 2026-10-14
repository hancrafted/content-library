import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The brief-grill skill carries the Brief template that Claude Code and a
 * Claude Desktop voice session both fill in. The template lives in the skill,
 * where `mh check` never looks, so this test lifts it out and runs it against
 * the Brief rule: a template that drifts from the rule fails here, not in the
 * first real Brief.
 */

const ROOT = path.join(__dirname, '../..');
const GUIDE = path.join(ROOT, 'skills/brief-grill/SKILL.md');
const MH = path.join(ROOT, 'node_modules/@hancrafted/markdown-harness/dist/packages/cli/cli.js');
const TEMPLATE_BLOCK = /^## Brief template\n[\s\S]*?^```markdown\n([\s\S]*?)^```$/m;

function briefTemplate(): string {
  const match = TEMPLATE_BLOCK.exec(readFileSync(GUIDE, 'utf8'));
  if (match === null) throw new Error('no ```markdown block under "## Brief template" in the brief-grill skill');
  return match[1];
}

// Runs `mh check` over one folder holding the template as brief.md and returns its summary.
function checkAsBrief(markdown: string): unknown {
  const folder = mkdtempSync(path.join(tmpdir(), 'brief-template-'));
  try {
    writeFileSync(path.join(folder, 'brief.md'), markdown);
    const run = (): string =>
      execFileSync(
        process.execPath,
        [MH, 'check', '--root', folder, '--config', path.join(ROOT, 'markdown-harness.config.yaml')],
        {
          encoding: 'utf8',
        },
      );
    let output: string;
    try {
      output = run();
    } catch (error) {
      output = (error as { stdout: string }).stdout;
    }
    return JSON.parse(output).result;
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

describe('the Brief template in the brief-grill skill', () => {
  describe('success cases', () => {
    it('passes the Brief rule in mh check', () => {
      // ARRANGE
      const template = briefTemplate();
      const clean = { summary: { governedFiles: 1, invalidFiles: 0, totalViolations: 0 }, files: [] };
      // ACT
      const result = checkAsBrief(template);
      // ASSERT
      expect(result).toEqual(clean);
    });
  });

  describe('failure cases', () => {
    it('fails the Brief rule when the Style section is missing', () => {
      // ARRANGE
      const withoutStyle = briefTemplate().replace(/^## Style\n[\s\S]*?(?=^## )/m, '');
      // ACT
      const result = checkAsBrief(withoutStyle) as { summary: { totalViolations: number } };
      // ASSERT
      expect(result.summary.totalViolations).toBeGreaterThan(0);
    });

    it('fails the Brief rule when the Slides section is missing', () => {
      // ARRANGE
      const withoutSlides = briefTemplate().replace(/^## Slides\n[\s\S]*?(?=^## )/m, '');
      // ACT
      const result = checkAsBrief(withoutSlides) as { summary: { totalViolations: number } };
      // ASSERT
      expect(result.summary.totalViolations).toBeGreaterThan(0);
    });

    it('fails the Brief rule when a Slides section holds no Section heading', () => {
      // ARRANGE
      const withoutSection = briefTemplate().replace(/^### The (first|second) Section\n/gm, '');
      // ACT
      const result = checkAsBrief(withoutSection) as { summary: { totalViolations: number } };
      // ASSERT
      expect(result.summary.totalViolations).toBeGreaterThan(0);
    });
  });
});
