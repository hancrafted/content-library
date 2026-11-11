import { describe, expect, it } from 'vitest';
import { isReady, parseReadyFlags } from './guide-ready-flags.pure';

/* The two flags the check skill puts on the Guide link, `?skills=true&local-setup=true`, read once for every Slide. */

describe('success cases', () => {
  it('reads both flags from the query string', () => {
    // ARRANGE
    const expected = { skills: true, localSetup: false };
    // ACT
    const flags = parseReadyFlags('?skills=true&local-setup=false');
    // ASSERT
    expect(flags).toEqual(expected);
  });

  it('is ready only when both flags are true', () => {
    // ARRANGE
    const expected = [true, false, false];
    // ACT
    const ready = ['?skills=true&local-setup=true', '?skills=true&local-setup=false', '?skills=true'].map((search) =>
      isReady(parseReadyFlags(search)),
    );
    // ASSERT
    expect(ready).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('treats anything but exact true or false as unknown', () => {
    // ARRANGE
    const expected = { skills: undefined, localSetup: undefined };
    // ACT
    const flags = parseReadyFlags('?skills=TRUE&local-setup=1');
    // ASSERT
    expect(flags).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('is not ready with no query string at all', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const ready = isReady(parseReadyFlags(''));
    // ASSERT
    expect(ready).toBe(expected);
  });
});
