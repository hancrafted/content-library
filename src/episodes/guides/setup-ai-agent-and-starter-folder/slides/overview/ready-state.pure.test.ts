import { describe, expect, it } from 'vitest';
import { decideView, parseReadyFlags, viewFor } from './ready-state.pure';

describe('success cases', () => {
  it('reads both flags from the query string', () => {
    // ARRANGE
    const expected = { skills: true, localSetup: false };
    // ACT
    const flags = parseReadyFlags('?skills=true&local-setup=false');
    // ASSERT
    expect(flags).toEqual(expected);
  });

  it('is ready when both flags are true', () => {
    // ARRANGE
    const flags = parseReadyFlags('?skills=true&local-setup=true');
    // ACT
    const view = decideView(flags);
    // ASSERT
    expect(view).toEqual({ kind: 'ready' });
  });

  it('lists each piece that is false as missing', () => {
    // ARRANGE
    const flags = parseReadyFlags('?skills=false&local-setup=false');
    // ACT
    const view = decideView(flags);
    // ASSERT
    expect(view).toEqual({ kind: 'missing', flags, missing: ['skills', 'localSetup'] });
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

  it('stays normal when a flag is true and the other is unknown', () => {
    // ARRANGE
    const flags = parseReadyFlags('?skills=true&local-setup=maybe');
    // ACT
    const view = decideView(flags);
    // ASSERT
    expect(view).toEqual({ kind: 'normal' });
  });
});

describe('edge cases', () => {
  it('stays normal with no query string at all', () => {
    // ARRANGE
    const flags = parseReadyFlags('');
    // ACT
    const view = decideView(flags);
    // ASSERT
    expect(view).toEqual({ kind: 'normal' });
  });

  it('is missing when one flag is false and the other is unknown, naming only the false one', () => {
    // ARRANGE
    const flags = parseReadyFlags('skills=false');
    // ACT
    const view = decideView(flags);
    // ASSERT
    expect(view).toEqual({ kind: 'missing', flags, missing: ['skills'] });
  });

  it('is ready once the viewer ticks the check skill, whatever the flags say', () => {
    // ARRANGE
    const flags = parseReadyFlags('skills=false&local-setup=false');
    // ACT
    const view = viewFor(flags, true);
    // ASSERT
    expect(view).toEqual({ kind: 'ready' });
  });

  it('follows the flags while the check skill is not ticked', () => {
    // ARRANGE
    const flags = parseReadyFlags('skills=true&local-setup=true');
    // ACT
    const view = viewFor(flags, false);
    // ASSERT
    expect(view).toEqual({ kind: 'ready' });
  });
});
