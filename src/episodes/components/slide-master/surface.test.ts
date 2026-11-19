import { describe, expect, it } from 'vitest';
import { SOFT_MIRROR, surfaceStyle } from './surface';

describe('success cases', () => {
  it('paints the background and sets the Surface text colours, leaving the theme tokens alone', () => {
    // ARRANGE
    const expected = {
      '--slide-surface': 'var(--zone-sunlit)',
      '--surface-foreground': 'var(--zone-abyss)',
      '--surface-muted': 'gray',
    };
    // ACT
    const style = surfaceStyle({
      background: 'var(--zone-sunlit)',
      foreground: 'var(--zone-abyss)',
      muted: 'gray',
    });
    // ASSERT
    expect(style).toEqual(expected);
  });

  it('also sets the foreground and muted theme tokens for the whole Slide under textScope slide', () => {
    // ARRANGE
    const expected = {
      '--slide-surface': 'navy',
      '--surface-foreground': 'white',
      '--surface-muted': 'silver',
      '--foreground': 'white',
      '--muted-foreground': 'silver',
    };
    // ACT
    const style = surfaceStyle({
      background: 'navy',
      foreground: 'white',
      muted: 'silver',
      textScope: 'slide',
    });
    // ASSERT
    expect(style).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('sets nothing for a Slide with no Surface', () => {
    // ARRANGE
    const expected = {};
    // ACT
    const style = surfaceStyle(undefined);
    // ASSERT
    expect(style).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leaves every card token alone on a coloured Surface without the slide scope, so a card keeps its own colours', () => {
    // ARRANGE
    const forbidden = ['--card', '--card-foreground', '--background', '--foreground', '--muted-foreground', '--muted'];
    // ACT
    const keys = Object.keys(
      surfaceStyle({
        background: 'navy',
        foreground: 'white',
        muted: 'silver',
      }),
    );
    // ASSERT
    expect(keys.filter((key) => forbidden.includes(key))).toEqual([]);
  });

  it('reads the soft mirror inside the inverse area, from the swapped tokens', () => {
    // ARRANGE
    const expected = {
      background: 'color-mix(in oklab, var(--background) 88%, var(--foreground))',
      foreground: 'var(--foreground)',
    };
    // ACT
    const surface = SOFT_MIRROR;
    // ASSERT
    expect(surface).toEqual(expected);
  });
});
