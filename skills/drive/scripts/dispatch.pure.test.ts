import { describe, expect, it } from 'vitest';
import { EPIC_BODIES } from './dispatch-fixtures.ts';
import { checkTickets, globsOverlap, parseTicket, taskBranchGlob } from './dispatch.pure.ts';

const tickets = (numbers: readonly number[]) => numbers.map((n) => parseTicket(n, EPIC_BODIES[n] ?? ''));

describe('parseTicket', () => {
  it('reads Files, Describes, ADRs and Evidence from a real ticket body', () => {
    // ARRANGE
    const body = EPIC_BODIES[798] ?? '';
    // ACT
    const ticket = parseTicket(798, body);
    // ASSERT
    expect(ticket.files).toEqual([
      'skills/drive/SKILL.md',
      'skills/drive/references/**',
      'docs/agents/grilling-format.md',
    ]);
    expect(ticket.describes).toEqual([790, 794, 791, 793, 792, 796, 797, 795]);
    expect(ticket.adrs).toBe('GEN-007-naming');
    expect(ticket.evidence).toContain('Decision record 0030');
  });

  it('drops a trailing parenthetical note from a file entry and reads `none` as no target', () => {
    // ARRANGE
    const body = 'Files: a.md (delete), b/** (report template only)\nDescribes: none\nADRs: X\nEvidence from: y';
    // ACT
    const ticket = parseTicket(1, body);
    // ASSERT
    expect(ticket).toMatchObject({ files: ['a.md', 'b/**'], describes: [] });
  });

  it('reads a missing or blank line as null', () => {
    // ARRANGE
    const body = 'Files: a.ts\nADRs:   \nDescribes: none';
    // ACT
    const ticket = parseTicket(1, body);
    // ASSERT
    expect(ticket).toMatchObject({ adrs: null, evidence: null });
  });
});

describe('globsOverlap', () => {
  it.each([
    ['skills/drive/scripts/drive.ts', 'skills/drive/scripts/drive.ts', true],
    ['skills/drive/scripts/dispatch*.ts', 'skills/drive/scripts/dispatch.pure.ts', true],
    ['skills/drive/**', 'skills/drive/scripts/x.ts', true],
    ['docs/drive/learnings/**', 'docs/drive/learnings/records/a.md', true],
    ['skills/drive/scripts/learnings*.ts', 'skills/drive/scripts/drive.ts', false],
    ['docs/drive/learnings/**', 'docs/drive/learnings.md', false],
    ['skills/drive/references/**', 'skills/drive/SKILL.md', false],
    ['skills/drive/scripts/setup*.ts', 'skills/drive/scripts/setup.pure.ts', true],
  ])('%s vs %s is %s', (a, b, expected) => {
    // ARRANGE
    // ACT
    const forward = globsOverlap(a, b);
    const backward = globsOverlap(b, a);
    // ASSERT
    expect([forward, backward]).toEqual([expected, expected]);
  });
});

describe('taskBranchGlob', () => {
  it('names the Task branches of an issue under an Integration branch', () => {
    // ARRANGE
    // ACT
    const glob = taskBranchGlob('chore/drive-fortify-sweep', 790);
    // ASSERT
    expect(glob).toBe('chore/drive-fortify-sweep--790-*');
  });
});

describe('checkTickets', () => {
  const allMerged = () => true;

  it('names both tickets and the files when two Files globs overlap', () => {
    // ARRANGE
    const queued = tickets([790, 795]);
    // ACT
    const problems = checkTickets(queued, allMerged);
    // ASSERT
    expect(problems).toEqual([
      '#790 and #795 both own skills/drive/scripts/setup*.ts',
      '#790 and #795 both own skills/drive/scripts/drive.ts',
    ]);
  });

  it('passes tickets whose files are disjoint', () => {
    // ARRANGE
    const queued = tickets([791, 794]);
    // ACT
    const problems = checkTickets(queued, allMerged);
    // ASSERT
    expect(problems).toEqual([]);
  });

  it('fails #798 while the tickets it describes are unmerged', () => {
    // ARRANGE
    const queued = tickets([798]);
    const mergedOnly = (n: number) => n === 790 || n === 794;
    // ACT
    const problems = checkTickets(queued, mergedOnly);
    // ASSERT
    expect(problems).toEqual([
      '#798 describes #791, which is unmerged',
      '#798 describes #793, which is unmerged',
      '#798 describes #792, which is unmerged',
      '#798 describes #796, which is unmerged',
      '#798 describes #797, which is unmerged',
      '#798 describes #795, which is unmerged',
    ]);
  });

  it('passes #798 once everything it describes is merged', () => {
    // ARRANGE
    const queued = tickets([798]);
    // ACT
    const problems = checkTickets(queued, allMerged);
    // ASSERT
    expect(problems).toEqual([]);
  });

  it('fails a ticket with no ADRs line or no Evidence from line', () => {
    // ARRANGE
    const queued = [
      parseTicket(5, 'Files: a.ts\nDescribes: none\nEvidence from: x'),
      parseTicket(6, 'Files: b.ts\nDescribes: none\nADRs: X'),
    ];
    // ACT
    const problems = checkTickets(queued, allMerged);
    // ASSERT
    expect(problems).toEqual(['#5 has no ADRs line', '#6 has no Evidence from line']);
  });

  it('fails a ticket with no Files line', () => {
    // ARRANGE
    const queued = [parseTicket(5, 'Describes: none\nADRs: X\nEvidence from: x')];
    // ACT
    const problems = checkTickets(queued, allMerged);
    // ASSERT
    expect(problems).toEqual(['#5 has no Files line']);
  });

  it('accepts a ticket that describes a target queued in the same call only when merged', () => {
    // ARRANGE
    const queued = tickets([793, 798]);
    // ACT
    const problems = checkTickets(queued, (n) => n !== 793);
    // ASSERT
    expect(problems).toEqual(['#798 describes #793, which is unmerged']);
  });
});
