import { describe, expect, it } from 'vitest';
import { classifyToken, discoverGlobalTokens, discoverSlideTokens, type RuleSnapshot } from './token-discovery.pure';

describe('success cases', () => {
  it('reads global light values from :root and dark overrides from .dark', () => {
    // ARRANGE
    const rules: RuleSnapshot[] = [
      { selector: ':root', declarations: { '--primary': 'black', '--size-body': '1rem' } },
      { selector: '.dark', declarations: { '--primary': 'white' } },
    ];
    // ACT
    const tokens = discoverGlobalTokens(rules);
    // ASSERT
    expect(tokens).toEqual([
      { name: '--primary', light: 'black', dark: 'white' },
      { name: '--size-body', light: '1rem', dark: '1rem' },
    ]);
  });

  it('collects Slide tokens from rules applying inside the Slide, the dark value from the .dark prefix', () => {
    // ARRANGE
    const rules: RuleSnapshot[] = [
      { selector: '.hero', declarations: { '--hero-sun': '#f5b14a' } },
      { selector: '.dark .hero', declarations: { '--hero-sun': '#aa8800' } },
      { selector: '.other', declarations: { '--other': '1' } },
      { selector: ':root', declarations: { '--primary': 'black' } },
    ];
    // ACT
    const tokens = discoverSlideTokens(rules, (selector) => selector === '.hero');
    // ASSERT
    expect(tokens).toEqual([{ name: '--hero-sun', light: '#f5b14a', dark: '#aa8800', target: '.hero' }]);
  });

  it('keeps one row per selector when a Slide token name is declared by several rules', () => {
    // ARRANGE
    const rules: RuleSnapshot[] = [
      { selector: '.laneA', declarations: { '--lane-light': 'red' } },
      { selector: '.dark .laneA', declarations: { '--lane-light': 'darkred' } },
      { selector: '.laneB', declarations: { '--lane-light': 'blue' } },
    ];
    // ACT
    const tokens = discoverSlideTokens(rules, () => true);
    // ASSERT
    expect(tokens).toEqual([
      { name: '--lane-light', light: 'red', dark: 'darkred', target: '.laneA' },
      { name: '--lane-light', light: 'blue', dark: 'blue', target: '.laneB' },
    ]);
  });

  it.each([
    ['--primary', 'oklch(0.2 0 0)', 'colour'],
    ['--brand-accent', '#dd5f27', 'colour'],
    ['--weight-medium', '500', 'weight'],
    ['--font-sans', 'ui-sans-serif', 'font'],
    ['--size-body', '1rem', 'size'],
    ['--leading-body', '1.6', 'size'],
  ])('classifies %s as %s', (name, value, kind) => {
    // ARRANGE
    const token = { name, value };
    // ACT
    const result = classifyToken(token.name, token.value);
    // ASSERT
    expect(result).toBe(kind);
  });
});

describe('failure cases', () => {
  it('ignores non-root selectors, tooling names and the Tailwind theme layer', () => {
    // ARRANGE
    const rules: RuleSnapshot[] = [
      { selector: '.card', declarations: { '--x': '1' } },
      { selector: ':root, :host', declarations: { '--tw-ring': '0' } },
      { selector: ':root, :host', declarations: { '--spacing': '4px' }, layer: 'theme' },
    ];
    // ACT
    const tokens = discoverGlobalTokens(rules);
    // ASSERT
    expect(tokens).toEqual([]);
  });

  it('finds no Slide tokens when no rule applies inside the Slide', () => {
    // ARRANGE
    const rules: RuleSnapshot[] = [{ selector: '.x', declarations: { '--a': '1' } }];
    // ACT
    const tokens = discoverSlideTokens(rules, () => false);
    // ASSERT
    expect(tokens).toEqual([]);
  });
});

describe('edge cases', () => {
  it('gives a dark-only token the same value in light', () => {
    // ARRANGE
    const rules: RuleSnapshot[] = [{ selector: '.dark', declarations: { '--glow': 'red' } }];
    // ACT
    const tokens = discoverGlobalTokens(rules);
    // ASSERT
    expect(tokens).toEqual([{ name: '--glow', light: 'red', dark: 'red' }]);
  });

  it('classifies an unrecognised value as other', () => {
    // ARRANGE
    const name = '--thing';
    // ACT
    const kind = classifyToken(name, 'whatever');
    // ASSERT
    expect(kind).toBe('other');
  });
});
