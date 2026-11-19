import { describe, expect, it } from 'vitest';
import { EPIC_BODIES } from './dispatch-fixtures.ts';
import { checkTickets, epicOfTickets, globsOverlap, parseTicket } from './dispatch.pure.ts';

const tickets = (numbers: readonly number[]) => numbers.map((n) => parseTicket(n, EPIC_BODIES[n] ?? ''));

describe('parseTicket', () => {
  it('reads Files, Describes, ADRs and Evidence from a real ticket body', () => {
    // ARRANGE
    const body = EPIC_BODIES[798] ?? '';
    const expected = {
      files: ['skills/drive/SKILL.md', 'skills/drive/references/**', 'docs/agents/grilling-format.md'],
      describes: [790, 794, 791, 793, 792, 796, 797, 795],
      adrs: 'GEN-007-naming',
      evidence: 'Decision record 0030',
    };
    // ACT
    const ticket = parseTicket(798, body);
    // ASSERT
    expect(ticket).toMatchObject({
      files: expected.files,
      describes: expected.describes,
      adrs: expected.adrs,
      evidence: expect.stringContaining(expected.evidence),
    });
  });

  it('drops a trailing parenthetical note from a file entry and reads `none` as no target', () => {
    // ARRANGE
    const body = 'Files: a.md (delete), b/** (report template only)\nDescribes: none\nADRs: X\nEvidence from: y';
    const expected = { files: ['a.md', 'b/**'], describes: [] };
    // ACT
    const ticket = parseTicket(1, body);
    // ASSERT
    expect(ticket).toMatchObject(expected);
  });

  it('reads a missing or blank line as null', () => {
    // ARRANGE
    const body = 'Files: a.ts\nADRs:   \nDescribes: none';
    const expected = { adrs: null, evidence: null };
    // ACT
    const ticket = parseTicket(1, body);
    // ASSERT
    expect(ticket).toMatchObject(expected);
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
    const both = [expected, expected];
    // ACT
    const forward = globsOverlap(a, b);
    const backward = globsOverlap(b, a);
    // ASSERT
    expect([forward, backward]).toEqual(both);
  });
});

describe('checkTickets', () => {
  const allMerged = () => true;

  it('names both tickets and the files when two Files globs overlap', () => {
    // ARRANGE
    const queued = tickets([790, 795]);
    const expected = [
      '#790 and #795 both own skills/drive/scripts/setup*.ts',
      '#790 and #795 both own skills/drive/scripts/drive.ts',
    ];
    // ACT
    const problems = checkTickets(queued, allMerged);
    // ASSERT
    expect(problems).toEqual(expected);
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
    const unmerged = [791, 793, 792, 796, 797, 795];
    const expected = unmerged.map((n) => `#798 describes #${n}, which is unmerged`);
    // ACT
    const problems = checkTickets(queued, mergedOnly);
    // ASSERT
    expect(problems).toEqual(expected);
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
    const expected = ['#5 has no ADRs line', '#6 has no Evidence from line'];
    // ACT
    const problems = checkTickets(queued, allMerged);
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('fails a ticket with no Files line', () => {
    // ARRANGE
    const queued = [parseTicket(5, 'Describes: none\nADRs: X\nEvidence from: x')];
    const expected = ['#5 has no Files line'];
    // ACT
    const problems = checkTickets(queued, allMerged);
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('accepts a ticket that describes a target queued in the same call only when merged', () => {
    // ARRANGE
    const queued = tickets([793, 798]);
    const mergedExcept793 = (n: number) => n !== 793;
    const expected = ['#798 describes #793, which is unmerged'];
    // ACT
    const problems = checkTickets(queued, mergedExcept793);
    // ASSERT
    expect(problems).toEqual(expected);
  });
});

describe('epicOfTickets', () => {
  it('names the epic every ticket shares and nothing when one differs or names none', () => {
    // ARRANGE
    const same = [790, 791].map((n) => EPIC_BODIES[n] ?? '');
    const mixed = [EPIC_BODIES[790] ?? '', '## Parent\n\n#12\n'];
    const none = [EPIC_BODIES[790] ?? '', 'no parent here'];
    const expected = [789, null, null];
    // ACT
    const read = [same, mixed, none].map(epicOfTickets);
    // ASSERT
    expect(read).toEqual(expected);
  });
});
