import { describe, expect, it } from 'vitest';
import { CONTROLS, controlOf, defOf, offers, type ControlId } from './toolbar-controls.pure';

describe('success cases', () => {
  it('shows the picker, the Chat · CLI control, saving and loading progress, then the Workflow download and upload by default, in that order', () => {
    // ARRANGE
    const none = {};
    // ACT
    const shown = CONTROLS.filter(({ id }) => offers(none, id)).map(({ id }) => id);
    // ASSERT
    expect(shown).toEqual(['picker', 'level', 'progressDownload', 'progressUpload', 'download', 'upload']);
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

  it('hides the Chat · CLI control, and only it, for a readonly Preset', () => {
    // ARRANGE
    const none = {};
    // ACT
    const shown = CONTROLS.filter(({ id }) => offers(none, id, true)).map(({ id }) => id);
    // ASSERT
    expect(shown).toEqual(['picker', 'progressDownload', 'progressUpload', 'download', 'upload']);
  });
});

describe('failure cases', () => {
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
