import { templateStaleFindings } from '@/pipeline/lib/episode-spec-template-fresh.pure';
import { readTemplateSources, TEMPLATE_FILE } from '@/pipeline/lib/spec-template-sources';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * The committed Spec template against the skill and the calibration it records a hash of. A change to
 * `skills/to-decision-html` or to the Spec calibration fails here until the template is regenerated and its hash
 * recorded (grilling Q8 of #556). It reads the live repo from disk, so it is a slow test (ARCH-003-testing §4.4):
 * `src/pipeline/lib/episode-spec-template-fresh.pure.test.ts` holds the fast half.
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
  it('reads SKILL.md, every reference and every asset of the skill, and nothing else', () => {
    // ARRANGE
    const expected = ['SKILL.md', 'references/diagrams.md', 'references/feedback-contract.md', 'assets/toolbar.html'];
    // ACT
    const files = Object.keys(readTemplateSources().skill);
    const outside = files.filter(
      (file) => file !== 'SKILL.md' && !file.startsWith('references/') && !file.startsWith('assets/'),
    );
    // ASSERT
    expect(files).toEqual(expect.arrayContaining(expected));
    expect(outside).toEqual([]);
  });
});
