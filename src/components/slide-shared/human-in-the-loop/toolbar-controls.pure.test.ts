import { describe, expect, it } from 'vitest';
import { CONTROLS, controlOf, defOf, offers, type ControlId } from './toolbar-controls.pure';

describe('success cases', () => {
  it('shows the picker, the Chat · CLI control, teaching, reset, download and upload by default, in that order', () => {
    // ARRANGE
    const none = {};
    // ACT
    const shown = CONTROLS.filter(({ id }) => offers(none, id)).map(({ id }) => id);
    // ASSERT
    expect(shown).toEqual(['picker', 'level', 'teaching', 'reset', 'download', 'upload']);
  });

  it("lays a Preset's setting over the definition key by key and leaves the rest", () => {
    // ARRANGE
    const preset = { picker: { show: false } };
    // ACT
    const picker = controlOf(preset, 'picker');
    // ASSERT
    expect(picker).toMatchObject({ show: false, type: 'pills' });
    expect(offers(preset, 'download')).toBe(true);
  });

  it('hides the Chat · CLI control, teaching and reset for a readonly Preset, where nothing is tried', () => {
    // ARRANGE
    const none = {};
    // ACT
    const shown = CONTROLS.filter(({ id }) => offers(none, id, true)).map(({ id }) => id);
    // ASSERT
    expect(shown).toEqual(['picker', 'download', 'upload']);
  });
});

describe('failure cases', () => {
  it('lets a Preset hide teaching and reset one by one', () => {
    // ARRANGE
    const preset = { teaching: { show: false } };
    // ACT
    const shown = [offers(preset, 'teaching'), offers(preset, 'reset')];
    // ASSERT
    expect(shown).toEqual([false, true]);
  });

  it('never shows a control the Preset hides', () => {
    // ARRANGE
    const preset = { upload: { show: false }, level: { show: false } };
    // ACT
    const shown = [offers(preset, 'upload'), offers(preset, 'level')];
    // ASSERT
    expect(shown).toEqual([false, false]);
  });

  it('throws for an id the registry does not hold', () => {
    // ARRANGE
    const unknown = 'nope' as ControlId;
    // ACT
    const read = () => defOf(unknown);
    // ASSERT
    expect(read).toThrow(/nope/);
  });
});

describe('edge cases', () => {
  it('keeps a hidden Chat · CLI control hidden even in readonly', () => {
    // ARRANGE
    const preset = { level: { show: false } };
    // ACT
    const shown = offers(preset, 'level', true);
    // ASSERT
    expect(shown).toBe(false);
  });
});
