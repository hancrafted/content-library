import { describe, expect, it } from 'vitest';
import { parseList, planLinks } from './plan.pure.ts';

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

  it('fails when two files flatten to one name', () => {
    expect(() => planLinks(['docs/agents/domain.md', 'docs/features/domain.md'], 'out')).toThrow(/domain\.md/);
  });
});
