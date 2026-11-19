import { describe, expect, it } from 'vitest';
import { reportPathFor, unmetCriteria } from './report.pure.ts';

describe('reportPathFor', () => {
  it('maps a Task branch to the report under its parent slug', () => {
    expect(reportPathFor('chore/drive-fortify-sweep--791-ac-gate')).toBe(
      '.scratch/drive-fortify-sweep/791-ac-gate.report.md',
    );
  });
  it('maps a parent without a type', () => {
    expect(reportPathFor('sweep--1-a')).toBe('.scratch/sweep/1-a.report.md');
  });
  it('does not gate a branch without a task', () => {
    expect(reportPathFor('feat/x')).toBeNull();
    expect(reportPathFor('feat/x--')).toBeNull();
  });
});

describe('unmetCriteria', () => {
  const report = (criteria: string) => `- x\n\n## Acceptance criteria\n${criteria}\n\n- **Merge:** abc\n`;

  it('passes when every criterion is checked', () => {
    expect(unmetCriteria(report('- [x] one — evidence\n- [X] two — evidence'))).toEqual([]);
  });
  it('names each unchecked criterion without a deferral', () => {
    const problems = unmetCriteria(report('- [x] one — e\n- [ ] two\n- [ ] three — why'));
    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain('- [ ] two');
    expect(problems[1]).toContain('- [ ] three');
  });
  it('accepts an unchecked criterion deferred to a ticket url', () => {
    expect(unmetCriteria(report('- [ ] two — deferred: https://github.com/o/r/issues/9'))).toEqual([]);
  });
  it('refuses a deferral that names no url', () => {
    expect(unmetCriteria(report('- [ ] two — deferred: later'))).toHaveLength(1);
  });
  it('refuses a report without the section and names the template line', () => {
    const [problem] = unmetCriteria('- **Merge:** abc\n');
    expect(problem).toContain('## Acceptance criteria');
    expect(problem).toContain('- [x] <acceptance criterion> — <evidence>');
  });
  it('refuses an empty section', () => {
    expect(unmetCriteria('## Acceptance criteria\n\n- **Merge:** a')).toHaveLength(1);
  });
  it('ignores checkboxes outside the section', () => {
    expect(unmetCriteria('- [ ] stray\n## Acceptance criteria\n- [x] a — b\n## Other\n- [ ] stray')).toEqual([]);
  });
});
