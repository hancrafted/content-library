import { describe, expect, it } from 'vitest';
import { diffFolder, expandEntries, parseList, planCopies, proposeCandidates } from './plan.pure.ts';

describe('parseList', () => {
  it('reads backticked bullet entries and ignores prose', () => {
    expect(parseList('# Title\n\nProse.\n\n- `AGENTS.md`\n- docs/adr/*.md\n')).toEqual(['AGENTS.md', 'docs/adr/*.md']);
  });
});

describe('planCopies', () => {
  it('flattens each file to its base name, keeping its repo path as the source', () => {
    expect(planCopies(['AGENTS.md', 'docs/adr/0001-a.md'])).toEqual([
      { name: 'AGENTS.md', source: 'AGENTS.md' },
      { name: '0001-a.md', source: 'docs/adr/0001-a.md' },
    ]);
  });

  it('names a skill file after its skill folder, so every uploaded skill is told apart', () => {
    expect(planCopies(['skills/brief-grill/SKILL.md'])).toEqual([
      { name: 'brief-grill.md', source: 'skills/brief-grill/SKILL.md' },
    ]);
  });

  it('fails when a skill and a doc flatten to one name', () => {
    expect(() => planCopies(['skills/domain/SKILL.md', 'docs/agents/domain.md'])).toThrow(/domain\.md/);
  });

  it('fails when two files flatten to one name', () => {
    expect(() => planCopies(['docs/agents/domain.md', 'docs/features/domain.md'])).toThrow(/domain\.md/);
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

describe('diffFolder', () => {
  it('sorts names into changed, new and removed, leaving identical files out', () => {
    const planned = new Map([
      ['AGENTS.md', 'v2'],
      ['GLOSSARY.md', 'same'],
      ['brief-grill.md', 'fresh'],
    ]);
    const current = new Map([
      ['AGENTS.md', 'v1'],
      ['GLOSSARY.md', 'same'],
      ['old-doc.md', 'gone'],
    ]);
    expect(diffFolder(planned, current)).toEqual({
      changed: ['AGENTS.md'],
      added: ['brief-grill.md'],
      removed: ['old-doc.md'],
    });
  });

  it('reports nothing to do when the folder already matches', () => {
    const same = new Map([['AGENTS.md', 'x']]);
    expect(diffFolder(same, new Map(same))).toEqual({ changed: [], added: [], removed: [] });
  });
});

describe('proposeCandidates', () => {
  const atRef = [
    'AGENTS.md',
    'docs/agents/domain.md',
    'docs/handoff/new.md',
    'skills/new-episode/SKILL.md',
    'src/app/page.tsx',
  ];

  it('proposes touched docs and skills the list does not hold, once each, sorted', () => {
    const touched = ['skills/new-episode/SKILL.md', 'docs/handoff/new.md', 'docs/handoff/new.md', 'src/app/page.tsx'];
    expect(proposeCandidates(touched, ['AGENTS.md'], atRef)).toEqual([
      'docs/handoff/new.md',
      'skills/new-episode/SKILL.md',
    ]);
  });

  it('skips files already listed and files missing at the ref, so a deleted or unmerged doc is never proposed', () => {
    expect(proposeCandidates(['docs/agents/domain.md', 'docs/gone.md'], ['docs/agents/domain.md'], atRef)).toEqual([]);
  });
});
