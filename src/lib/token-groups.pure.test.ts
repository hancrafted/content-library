import { describe, expect, it } from 'vitest';
import { describeToken, groupGlobalTokens, groupSlideTokens } from './token-groups.pure';

const token = (name: string, value = 'oklch(0 0 0)', target?: string) => ({
  name,
  light: value,
  dark: value,
  ...(target ? { target } : {}),
});

describe('success cases', () => {
  it('orders global groups as designers expect, each colour beside its foreground', () => {
    // ARRANGE
    const tokens = [
      token('--radius', '0.5rem'),
      token('--secondary'),
      token('--primary-foreground'),
      token('--primary'),
      token('--secondary-foreground'),
      token('--card'),
      token('--background'),
      token('--foreground'),
      token('--card-foreground'),
    ];
    const expected = [
      ['Brand', ['--primary', '--primary-foreground', '--secondary', '--secondary-foreground']],
      ['Surface & text', ['--background', '--foreground', '--card', '--card-foreground']],
      ['Shape', ['--radius']],
    ];
    // ACT
    const groups = groupGlobalTokens(tokens);
    // ASSERT
    expect(groups.map((g) => [g.label, g.tokens.map((t) => t.name)])).toEqual(expected);
  });

  it('files every typography family under Typography', () => {
    // ARRANGE
    const tokens = [
      token('--font-sans', 'ui-sans-serif'),
      token('--weight-normal', '400'),
      token('--tracking-heading', '-0.02em'),
      token('--leading-body', '1.6'),
      token('--size-body', '1rem'),
    ];
    const expected = ['--size-body', '--leading-body', '--tracking-heading', '--weight-normal', '--font-sans'];
    // ACT
    const groups = groupGlobalTokens(tokens);
    // ASSERT
    expect(groups.map((g) => g.tokens.map((t) => t.name))).toEqual([expected]);
  });

  it('describes a global token in one line', () => {
    // ARRANGE
    const expected = 'Corner rounding of cards, buttons and inputs.';
    // ACT
    const text = describeToken('--radius');
    // ASSERT
    expect(text).toBe(expected);
  });

  it('groups Slide tokens by rule selector, colours first', () => {
    // ARRANGE
    const tokens = [
      token('--gap', '2rem', '.lane'),
      token('--lane-edge', 'oklch(0.5 0.1 200)', '.lane'),
      token('--paper', '#fff', '.root'),
    ];
    const expected = [
      ['.lane', ['--lane-edge', '--gap']],
      ['.root', ['--paper']],
    ];
    // ACT
    const groups = groupSlideTokens(tokens);
    // ASSERT
    expect(groups.map((g) => [g.label, g.tokens.map((t) => t.name)])).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('gives an unknown token no description', () => {
    // ARRANGE
    const name = '--loop-edge';
    // ACT
    const text = describeToken(name);
    // ASSERT
    expect(text).toBeUndefined();
  });

  it('puts an unlisted global token under Other, last', () => {
    // ARRANGE
    const tokens = [token('--mystery'), token('--primary')];
    // ACT
    const groups = groupGlobalTokens(tokens);
    // ASSERT
    expect(groups.map((g) => g.label)).toEqual(['Brand', 'Other']);
  });
});

describe('edge cases', () => {
  it('returns no groups for no tokens', () => {
    // ARRANGE
    const none: never[] = [];
    // ACT
    const groups = groupGlobalTokens(none);
    // ASSERT
    expect(groups).toEqual([]);
  });

  it('names a Slide token without a selector as the Slide root', () => {
    // ARRANGE
    const tokens = [token('--paper', '#fff')];
    // ACT
    const groups = groupSlideTokens(tokens);
    // ASSERT
    expect(groups.map((g) => g.label)).toEqual(['Slide root']);
  });

  it('describes size, leading and weight tokens by family', () => {
    // ARRANGE
    const names = ['--size-hero', '--leading-hero', '--weight-medium'];
    // ACT
    const texts = names.map(describeToken);
    // ASSERT
    expect(texts.every((t) => typeof t === 'string' && t.length > 0)).toBe(true);
  });
});
