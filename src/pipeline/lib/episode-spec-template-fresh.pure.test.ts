import { describe, expect, it } from 'vitest';
import {
  recordedTemplateHash,
  templateHash,
  templateStaleFindings,
  type TemplateSources,
} from './episode-spec-template-fresh.pure.ts';

/*
 * The Spec template records a hash of the sources it was generated from; the check compares the record with the
 * current sources, so a change to `to-decision-html` or the Spec calibration fails until the template is regenerated.
 */

const SOURCES: TemplateSources = {
  skill: {
    'SKILL.md': '# To decision HTML\n\nWrite the page.\n',
    'references/feedback-contract.md': '# Feedback\n\nThree lines.\n',
    'assets/toolbar.html': '<div>Toolbar.</div>\n',
  },
  calibration: [
    '# Spec calibration',
    '',
    '## Page',
    '',
    'Design size 1920 x 1080.',
    '',
    '## Regenerating the template',
    '',
    'Run the skill.',
    '',
  ].join('\n'),
};

const templateRecording = (hash: string): string =>
  `<!doctype html><html><head><meta name="spec-template-source-hash" content="${hash}" /></head><body></body></html>`;

describe('success cases', () => {
  it('finds a template fresh when its recorded hash is the current one', () => {
    // ARRANGE
    const template = templateRecording(templateHash(SOURCES));
    // ACT
    const findings = templateStaleFindings(template, SOURCES);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('reads the recorded hash from the template, however Prettier wrapped the tag', () => {
    // ARRANGE
    const hash = templateHash(SOURCES);
    const wrapped = `<head>\n  <meta\n    name="spec-template-source-hash"\n    content="${hash}"\n  />\n</head>`;
    // ACT
    const recorded = recordedTemplateHash(wrapped);
    // ASSERT
    expect(recorded).toBe(hash);
  });

  it('keeps the hash when only the Regenerating the template section changes', () => {
    // ARRANGE
    const edited = { ...SOURCES, calibration: SOURCES.calibration.replace('Run the skill.', 'Run it twice.') };
    // ACT
    const hash = templateHash(edited);
    // ASSERT
    expect(hash).toBe(templateHash(SOURCES));
  });
});

describe('failure cases', () => {
  it.each([
    ['a skill file changed', { ...SOURCES, skill: { ...SOURCES.skill, 'SKILL.md': '# To decision HTML\n\nNew.\n' } }],
    [
      'a skill reference was added',
      { ...SOURCES, skill: { ...SOURCES.skill, 'references/new.md': 'A new reference.\n' } },
    ],
    [
      'a skill asset changed',
      { ...SOURCES, skill: { ...SOURCES.skill, 'assets/toolbar.html': '<div>Changed.</div>\n' } },
    ],
    ['the calibration changed', { ...SOURCES, calibration: SOURCES.calibration.replace('1920', '1280') }],
  ])('fails when %s, naming the regeneration section', (_name, current) => {
    // ARRANGE
    const template = templateRecording(templateHash(SOURCES));
    const section = 'Regenerating the template';
    const file = 'spec-calibration.md';
    // ACT
    const findings = templateStaleFindings(template, current);
    // ASSERT
    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain(section);
    expect(findings[0]).toContain(file);
  });

  it('fails a template that records no hash, naming the regeneration section', () => {
    // ARRANGE
    const template = '<!doctype html><html><head></head><body></body></html>';
    const finding = 'records no hash';
    const section = 'Regenerating the template';
    // ACT
    const findings = templateStaleFindings(template, SOURCES);
    // ASSERT
    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain(finding);
    expect(findings[0]).toContain(section);
  });
});

describe('edge cases', () => {
  it('hashes the same sources alike whatever order the files arrive in or line endings they carry', () => {
    // ARRANGE
    const reordered: TemplateSources = {
      skill: {
        'assets/toolbar.html': '<div>Toolbar.</div>\r\n',
        'references/feedback-contract.md': '# Feedback\r\n\r\nThree lines.\r\n',
        'SKILL.md': '# To decision HTML\r\n\r\nWrite the page.\r\n',
      },
      calibration: SOURCES.calibration.replaceAll('\n', '\r\n'),
    };
    // ACT
    const hash = templateHash(reordered);
    // ASSERT
    expect(hash).toBe(templateHash(SOURCES));
  });

  it('keeps a section after Regenerating the template in the hash', () => {
    // ARRANGE
    const later: TemplateSources = { ...SOURCES, calibration: `${SOURCES.calibration}\n## Later\n\nA rule.\n` };
    const changed: TemplateSources = { ...later, calibration: later.calibration.replace('A rule.', 'Another rule.') };
    // ACT
    const hashes = [templateHash(later), templateHash(changed)];
    // ASSERT
    expect(hashes[0]).not.toBe(hashes[1]);
  });
});
