import { describe, expect, it } from 'vitest';
import { handoffProblems, readTemplate } from './markdown-handoff.pure';

const TEMPLATE = '---\nkind: research\n---\n# <What>\n## Fit\n## Cost\n';
const TICKETS = '---\nkind: tickets\n---\n# <Set>\n## <Ticket title>\n';

describe('success cases', () => {
  it('accepts a handoff of the template kind with its H1 and H2s in order', () => {
    // ARRANGE
    const sample = '---\nkind: research\n---\n# Old Mill\n## Fit\nOk.\n## Cost\n140\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TEMPLATE));
    // ASSERT
    expect(problems).toEqual([]);
  });

  it('lets a placeholder H2 stand for one or more sections of any title', () => {
    // ARRANGE
    const sample = '---\nkind: tickets\n---\n# Set\n## 1. Hall\nx\n## 2. Hotel\ny\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TICKETS));
    // ASSERT
    expect(problems).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects another kind', () => {
    // ARRANGE
    const sample = '---\nkind: spec\n---\n# X\n## Fit\n## Cost\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TEMPLATE));
    // ASSERT
    expect(problems.join(' ')).toMatch(/kind "spec".*"research"/);
  });

  it('rejects a missing, misordered or extra H2 and a missing H1', () => {
    // ARRANGE
    const sample = '---\nkind: research\n---\n## Cost\n## Fit\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TEMPLATE));
    // ASSERT
    expect(problems.join(' ')).toMatch(/H1/);
    expect(problems.join(' ')).toMatch(/H2/);
  });

  it('rejects text without front matter', () => {
    // ARRANGE
    const sample = '# X\n## Fit\n## Cost\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TEMPLATE));
    // ASSERT
    expect(problems.join(' ')).toMatch(/front matter/);
  });
});

describe('edge cases', () => {
  it('does not count a heading inside a code fence', () => {
    // ARRANGE
    const sample = '---\nkind: research\n---\n# X\n## Fit\n```\n## Fake\n```\n## Cost\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TEMPLATE));
    // ASSERT
    expect(problems).toEqual([]);
  });
});
