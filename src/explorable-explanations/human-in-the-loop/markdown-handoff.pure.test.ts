import { describe, expect, it } from 'vitest';
import { handoffProblems, readTemplate } from './markdown-handoff.pure';

const TEMPLATE = '# <What>\n## Fit\n## Cost\n';
const TICKETS = '# <Set>\n## <Ticket title>\n';

describe('success cases', () => {
  it('accepts a handoff with its H1 and the template H2s in order', () => {
    // ARRANGE
    const sample = '# Old Mill\n## Fit\nOk.\n## Cost\n140\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TEMPLATE));
    // ASSERT
    expect(problems).toEqual([]);
  });

  it('lets a placeholder H2 stand for one or more sections of any title', () => {
    // ARRANGE
    const sample = '# Set\n## 1. Hall\nx\n## 2. Hotel\ny\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TICKETS));
    // ASSERT
    expect(problems).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a missing, misordered or extra H2 and a missing H1', () => {
    // ARRANGE
    const sample = '## Cost\n## Fit\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TEMPLATE));
    // ASSERT
    expect(problems.join(' ')).toMatch(/H1/);
    expect(problems.join(' ')).toMatch(/H2/);
  });

  it('rejects a handoff that carries front matter, which a chat app cannot be expected to write', () => {
    // ARRANGE
    const sample = '---\nkind: research\n---\n# Old Mill\n## Fit\n## Cost\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TEMPLATE));
    // ASSERT
    expect(problems.join(' ')).toMatch(/front matter/);
  });
});

describe('edge cases', () => {
  it('does not count a heading inside a code fence', () => {
    // ARRANGE
    const sample = '# X\n## Fit\n```\n## Fake\n```\n## Cost\n';
    // ACT
    const problems = handoffProblems(sample, readTemplate(TEMPLATE));
    // ASSERT
    expect(problems).toEqual([]);
  });
});
