import { templateStaleFindings } from '@/pipeline/lib/episode-spec-template-fresh.pure';
import { readTemplateSources, TEMPLATE_FILE } from '@/pipeline/lib/spec-template-sources';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * The committed Spec template against the skill and the calibration it records a hash of. A change to
 * `skills/to-decision-html` or to the Spec calibration fails here until the template is regenerated and its hash
 * recorded (grilling Q8 of #556). It reads a handful of small files, so it stays in the fast suite.
 */

describe('success cases', () => {
  it('finds the committed template generated from the current to-decision-html and Spec calibration', () => {
    // ARRANGE
    const template = readFileSync(TEMPLATE_FILE, 'utf8');
    // ACT
    const findings = templateStaleFindings(template, readTemplateSources());
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('reads the skill and the calibration, so a template with no recorded hash fails', () => {
    // ARRANGE
    const template = '<html><head></head></html>';
    // ACT
    const findings = templateStaleFindings(template, readTemplateSources());
    // ASSERT
    expect(findings).toHaveLength(1);
  });
});

describe('edge cases', () => {
  it('reads SKILL.md and every reference of the skill', () => {
    // ARRANGE
    const expected = ['SKILL.md', 'references/diagrams.md', 'references/feedback-contract.md'];
    // ACT
    const files = Object.keys(readTemplateSources().skill);
    // ASSERT
    expect(files).toEqual(expect.arrayContaining(expected));
    expect(files.every((file) => file === 'SKILL.md' || file.startsWith('references/'))).toBe(true);
  });
});
