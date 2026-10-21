import { describe, expect, it } from 'vitest';
import { CONTROLS, controlOf, defOf, offers, type ControlId } from './toolbar-controls.pure';

const TRY_ONLY: ControlId[] = ['level', 'setup', 'picker', 'download', 'upload'];

describe('success cases', () => {
  it('shows only the Watch / Try switch in Watch, and every control in Try', () => {
    // ARRANGE
    const none = {};
    // ACT
    const watch = CONTROLS.filter(({ id }) => offers(none, id, 'watch')).map(({ id }) => id);
    const trying = CONTROLS.filter(({ id }) => offers(none, id, 'try')).map(({ id }) => id);
    // ASSERT
    expect(watch).toEqual(['mode']);
    expect(trying).toEqual(['mode', ...TRY_ONLY]);
  });

  it("lays a Preset's setting over the definition key by key and leaves the rest", () => {
    // ARRANGE
    const preset = { picker: { show: false } };
    // ACT
    const picker = controlOf(preset, 'picker');
    // ASSERT
    expect(picker).toMatchObject({ show: false, type: 'select', modes: ['try'] });
    expect(offers(preset, 'download', 'try')).toBe(true);
  });
});

describe('failure cases', () => {
  it('never shows a control the Preset hides, even in the mode it belongs to', () => {
    // ARRANGE
    const preset = { upload: { show: false }, mode: { show: false } };
    // ACT
    const shown = [offers(preset, 'upload', 'try'), offers(preset, 'mode', 'watch')];
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
  it('does not show a Try-only control in Watch even where the Preset says show', () => {
    // ARRANGE
    const preset = { level: { show: true } };
    // ACT
    const shown = offers(preset, 'level', 'watch');
    // ASSERT
    expect(shown).toBe(false);
  });
});
