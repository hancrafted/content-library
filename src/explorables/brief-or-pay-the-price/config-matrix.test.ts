import { describe, expect, it } from 'vitest';
import configSource from './brief-or-pay-the-price.config.yml';
import { loadConfig, parseConfig } from './config.pure';

const problemsOf = (source: string): readonly string[] => {
  const result = loadConfig(source);
  return 'problems' in result ? result.problems : [];
};

describe('success cases', () => {
  it('loads the counters table with a source and the evidence line of each move in both locales', () => {
    // ARRANGE
    const moves = 5;
    // ACT
    const config = parseConfig(configSource);
    const keys = (locale: 'en' | 'de') => Object.keys(config.i18n[locale].matrix.evidenceOf);
    // ASSERT
    expect(Object.keys(config.matrix)).toHaveLength(moves);
    expect(keys('en')).toHaveLength(moves);
    expect(keys('de')).toEqual(keys('en'));
  });
});

describe('failure cases', () => {
  it('refuses a counters table naming a trait the Explorable does not have', () => {
    // ARRANGE
    const source = configSource.replace('counters: [relentless, every-word-billed]', 'counters: [relentless, brave]');
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toContain('brief-or-pay-the-price.config.yml: matrix.break-it-down: "brave" is not a trait');
  });

  it('refuses a move without a source', () => {
    // ARRANGE
    const source = configSource.replace("source: 'Zhou et al., Least-to-Most Prompting'", "source: ''");
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toContain('brief-or-pay-the-price.config.yml: matrix.break-it-down: needs a source');
  });

  it('refuses an evidence line missing for a move', () => {
    // ARRANGE
    const source = configSource.replace(/ {8}break-it-down: 'Solving[^\n]*\n/, '');
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toContain('brief-or-pay-the-price.config.yml: i18n.en.matrix.evidenceOf.break-it-down: missing');
  });
});

describe('edge cases', () => {
  it('lets a move counter a single trait', () => {
    // ARRANGE
    const source = configSource.replace('counters: [relentless, every-word-billed]', 'counters: [relentless]');
    // ACT
    const problems = problemsOf(source);
    // ASSERT
    expect(problems).toEqual([]);
  });
});
