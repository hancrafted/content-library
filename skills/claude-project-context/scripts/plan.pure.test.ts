import { describe, expect, it } from 'vitest';
import { expandEntries, parseList, planLinks } from './plan.pure.ts';

describe('parseList', () => {
  it('reads backticked bullet entries and ignores prose', () => {
    expect(parseList('# Title\n\nProse.\n\n- `AGENTS.md`\n- docs/adr/*.md\n')).toEqual(['AGENTS.md', 'docs/adr/*.md']);
  });
});

describe('planLinks', () => {
  it('flattens each file into a link relative to the folder', () => {
    expect(planLinks(['AGENTS.md', 'docs/adr/0001-a.md'], 'docs/claude-project-context')).toEqual([
      { name: 'AGENTS.md', target: '../../AGENTS.md' },
      { name: '0001-a.md', target: '../adr/0001-a.md' },
    ]);
  });

  it('names a skill file after its skill folder, so every uploaded skill is told apart', () => {
    expect(planLinks(['skills/brief-grill/SKILL.md'], 'docs/claude-project-context')).toEqual([
      { name: 'brief-grill.md', target: '../../skills/brief-grill/SKILL.md' },
    ]);
  });

  it('fails when a skill and a doc flatten to one name', () => {
    expect(() => planLinks(['.agents/skills/domain/SKILL.md', 'docs/agents/domain.md'], 'out')).toThrow(/domain\.md/);
  });

  it('fails when two files flatten to one name', () => {
    expect(() => planLinks(['docs/agents/domain.md', 'docs/features/domain.md'], 'out')).toThrow(/domain\.md/);
  });
});

describe('expandEntries', () => {
  it("concatenates each entry's matches in list order", () => {
    const matches: Record<string, string[]> = { 'AGENTS.md': ['AGENTS.md'], 'docs/adr/*.md': ['docs/adr/0001-a.md'] };
    expect(expandEntries(['AGENTS.md', 'docs/adr/*.md'], (entry) => matches[entry] ?? [])).toEqual([
      'AGENTS.md',
      'docs/adr/0001-a.md',
    ]);
  });

  it('fails when an entry matches no file, so a renamed doc never drops out silently', () => {
    expect(() => expandEntries(['GLOSARY.md'], () => [])).toThrow(/GLOSARY\.md/);
  });
});
