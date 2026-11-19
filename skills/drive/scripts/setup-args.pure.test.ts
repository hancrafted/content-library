import { describe, expect, it } from 'vitest';
import { missingBindingSkills, parseSetupArgs } from './setup-args.pure.ts';

describe('parseSetupArgs', () => {
  it('reads --agent-type and --tier, and rejects a tier that is not mid or top', () => {
    // ARRANGE
    // ACT
    // ASSERT
    expect(parseSetupArgs(['--agent-type', 'team:dev', '--tier', 'top'])).toEqual({
      agentType: 'team:dev',
      tier: 'top',
    });
    expect(parseSetupArgs(['--tier', 'opus'])).toEqual({
      error: 'usage: drive setup [--check] [--agent-type <type>] [--tier mid|top]',
    });
  });
});

describe('parseSetupArgs --check', () => {
  it('reads --check as a flag that takes no value, beside the seeding options', () => {
    // ARRANGE
    // ACT
    // ASSERT
    expect(parseSetupArgs(['--check'])).toEqual({ check: true });
    expect(parseSetupArgs(['--check', '--tier', 'top'])).toEqual({ check: true, tier: 'top' });
    expect(parseSetupArgs(['--tier', 'top', '--check'])).toEqual({ check: true, tier: 'top' });
  });
});

describe('missingBindingSkills', () => {
  const phase = (skills: string[]) => ({ model: 'mid' as const, skills, inline: false });
  const binding = {
    agentType: 'x',
    notify: { adapter: 'none' as const },
    phases: {
      define: phase(['grill-me', 'research']),
      reason: phase(['research', 'to-spec']),
      implement: phase([]),
      verify: phase([]),
      evolve: phase([]),
    },
  };

  it('names each bound skill that is not installed once, with the phases that bind it', () => {
    // ARRANGE
    const installed = ['research'];
    // ACT
    const missing = missingBindingSkills(binding, installed);
    // ASSERT
    expect(missing).toEqual([
      { skill: 'grill-me', phases: ['define'] },
      { skill: 'to-spec', phases: ['reason'] },
    ]);
  });

  it('finds nothing missing when every bound skill is installed', () => {
    // ARRANGE
    const installed = ['grill-me', 'research', 'to-spec'];
    // ACT
    const missing = missingBindingSkills(binding, installed);
    // ASSERT
    expect(missing).toEqual([]);
  });
});
