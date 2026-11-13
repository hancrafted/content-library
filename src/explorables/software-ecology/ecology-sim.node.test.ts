import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatVerdict, parseSimArgs, simulate } from './ecology-sim.node.ts';

/** This folder's files, as the shell reads them. */
const read = (name: string): string => readFileSync(new URL(`./${name}`, import.meta.url), 'utf8');

describe('success cases', () => {
  it('judges a shipped scenario from its files, every seed passing', () => {
    // ARRANGE
    const seeds = 3;
    const expected = { ok: true, passed: [seeds] };
    // ACT
    const run = simulate({ useCase: 'tire', scenario: 'ideal', seeds }, read);
    // ASSERT
    expect({ ok: run.verdict.ok, passed: run.verdict.beats.map((b) => b.passed) }).toEqual(expected);
  });

  it('prints each beat with its per-seed readings, their mean and its verdict', () => {
    // ARRANGE
    const run = simulate({ useCase: 'tire', scenario: 'ideal', seeds: 2 }, read);
    const lines = ['tire ideal · In theory', 'Beat 1 · week 12', 'customer.output 0.95–1.05', 'PASS 2 of 2 seeds'];
    // ACT
    const text = formatVerdict(run);
    // ASSERT
    for (const line of lines) expect(text).toContain(line);
  });

  it('reads the use case, the scenario, a seed count and json', () => {
    // ARRANGE
    const argv = ['tire', 'ai-spiral', '--seeds', '4', '--json'];
    const expected = { useCase: 'tire', scenario: 'ai-spiral', seeds: 4, json: true };
    // ACT
    const opts = parseSimArgs(argv);
    // ASSERT
    expect(opts).toEqual(expected);
  });

  it('takes a name and a claim the use case lacks from the catalog, as the page does', () => {
    // ARRANGE
    const catalog = [
      'roles: {}',
      'presets:',
      '  ai-spiral: Catalog name',
      'scenarios:',
      '  ai-spiral:',
      '    claims:',
      '      clean-line: Catalog claim',
      '',
    ].join('\n');
    const bare = (name: string): string => {
      if (name === 'roles.words.yml') return catalog;
      if (name !== 'tire.words.yml') return read(name);
      return read(name)
        .split('\nscenarios:')[0]!
        .replace(/^ +ai-spiral: .*\n/m, '');
    };
    // ACT
    const run = simulate({ useCase: 'tire', scenario: 'ai-spiral', seed: 1 }, bare);
    // ASSERT
    expect({ name: run.name, claim: run.claims[0] }).toEqual({ name: 'Catalog name', claim: 'Catalog claim' });
  });
});

describe('failure cases', () => {
  it('refuses a call without a scenario', () => {
    // ARRANGE
    const argv = ['tire'];
    const message = /usage: npm run ecology:sim/;
    // ACT
    const parse = () => parseSimArgs(argv);
    // ASSERT
    expect(parse).toThrow(message);
  });

  it('refuses a use case that does not ship', () => {
    // ARRANGE
    const opts = { useCase: 'nowhere', scenario: 'ideal', seeds: 1 };
    const message = /no use case nowhere/;
    // ACT
    const run = () => simulate(opts, read);
    // ASSERT
    expect(run).toThrow(message);
  });
});

describe('edge cases', () => {
  it('reads one given seed as a run on that seed alone', () => {
    // ARRANGE
    const argv = ['tire', 'ideal', '--seed', '7'];
    const expected = { useCase: 'tire', scenario: 'ideal', seed: 7, json: false };
    // ACT
    const opts = parseSimArgs(argv);
    // ASSERT
    expect(opts).toEqual(expected);
  });
});
