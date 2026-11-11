import { parseReadyFlags } from '@/episodes/lib/guide-ready-flags.pure';
import { describe, expect, it } from 'vitest';
import { decideView, viewFor } from './ready-state.pure';

describe('success cases', () => {
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
