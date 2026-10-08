import { describe, expect, it } from 'vitest';
import { buildThemeInitScript, resolveTheme } from './theme.pure';

describe('success cases', () => {
  it('honours an explicit theme regardless of the OS', () => {
    // ARRANGE
    const systemPrefersDark = true;
    // ACT
    const resolved = resolveTheme('light', systemPrefersDark);
    // ASSERT
    expect(resolved).toBe('light');
  });

  it('follows the OS when the theme is system', () => {
    // ARRANGE
    const theme = 'system';
    // ACT
    const onDarkOs = resolveTheme(theme, true);
    const onLightOs = resolveTheme(theme, false);
    // ASSERT
    expect(onDarkOs).toBe('dark');
    expect(onLightOs).toBe('light');
  });
});

describe('failure cases', () => {
  it('the init script swallows storage errors instead of throwing', () => {
    // ARRANGE
    const guard = 'catch(e){}';
    // ACT
    const script = buildThemeInitScript();
    // ASSERT
    expect(script).toContain(guard);
  });
});

describe('edge cases', () => {
  it('the init script reads the single prefs key', () => {
    // ARRANGE
    const key = '"hancrafted:prefs"';
    // ACT
    const script = buildThemeInitScript();
    // ASSERT
    expect(script).toContain(key);
  });
});
