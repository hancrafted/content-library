import de from '@/messages/de.json';
import en from '@/messages/en.json';
import { describe, expect, it } from 'vitest';
import { NOT_DRAWER_STRINGS } from './context-drawer-input';

/** The top-level `contextDrawer` keys whose string takes an ICU argument, which only a caller can fill. */
function argumentKeys(namespace: Record<string, unknown>): string[] {
  return Object.entries(namespace)
    .filter(([, value]) => typeof value === 'string' && /\{\w+/.test(value))
    .map(([key]) => key);
}

describe('success cases', () => {
  it('keeps every string with an ICU argument out of the strings the drawer reads unformatted', () => {
    // ARRANGE
    const kept: readonly string[] = NOT_DRAWER_STRINGS;
    // ACT
    const leaked = [en, de]
      .flatMap((messages) => argumentKeys(messages.contextDrawer))
      .filter((key) => !kept.includes(key));
    // ASSERT
    expect(leaked).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names the Context marker label among them, which Slide text formats with its note title', () => {
    // ARRANGE
    const expected = 'markerNote';
    // ACT
    const kept: readonly string[] = NOT_DRAWER_STRINGS;
    // ASSERT
    expect(kept).toContain(expected);
  });
});

describe('edge cases', () => {
  it('leaves out the underline label too, which Slide text reads and the drawer does not', () => {
    // ARRANGE
    const expected = 'refNote';
    // ACT
    const kept: readonly string[] = NOT_DRAWER_STRINGS;
    // ASSERT
    expect(kept).toContain(expected);
  });
});
