import { describe, expect, it } from 'vitest';
import { CONTROL_IDS, controlOf, controlProblems, mergeControls, offers } from './context-controls.pure';

/* The control registry: one typed definition per control, the Preset's `controls` map overrides it key by key. */

describe('success cases', () => {
  it('gives every control its registry default when the Preset says nothing', () => {
    // ARRANGE
    const expected = {
      technical: true,
      preview: true,
      zone: true,
      meter: true,
      window: false,
      upload: false,
      download: true,
    };
    // ACT
    const actual = Object.fromEntries(
      Object.keys(expected).map((id) => [id, controlOf({ controls: {} }, id as never).show]),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('merges an override key by key, so a control keeps the fields the override does not name', () => {
    // ARRANGE
    const expected = { show: true, reorder: false };
    // ACT
    const merged = mergeControls({ parts: { show: true, reorder: true } }, { parts: { reorder: false } });
    // ASSERT
    expect(controlOf({ controls: merged }, 'parts')).toMatchObject(expected);
  });

  it("lets '*' set show for every control, and an explicit control beat it", () => {
    // ARRANGE
    const controls = mergeControls(
      { parts: { show: true }, technical: { show: true } },
      {
        '*': { show: false },
        window: { show: true },
      },
    );
    // ACT
    const shown = CONTROL_IDS.filter((id) => offers({ controls }, id));
    // ASSERT
    // the meter is a readout, not a button: '*' leaves it alone
    expect(shown).toEqual(['meter', 'window']);
  });
});

describe('failure cases', () => {
  it("refuses a field other than show on '*'", () => {
    // ARRANGE
    const expected = ['controls "*" may only set show, not on'];
    // ACT
    const problems = controlProblems({ '*': { show: false, on: true } }, 2);
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('refuses a field the control type does not take', () => {
    // ARRANGE
    const expected = ['control "technical" does not take reorder'];
    // ACT
    const problems = controlProblems({ technical: { reorder: true } }, 2);
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('refuses an unknown control and a non-boolean value', () => {
    // ARRANGE
    const expected = ['unknown control "legend"', 'control "zone" show must be true or false'];
    // ACT
    const problems = controlProblems({ legend: { show: true }, zone: { show: 'yes' } } as never, 2);
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('refuses the window switch with one window size', () => {
    // ARRANGE
    const expected = ['the window switch needs two window sizes'];
    // ACT
    const problems = controlProblems({ window: { show: true } }, 1);
    // ASSERT
    expect(problems).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('folds the star into controls the Preset does not name and keeps the defaults of the rest', () => {
    // ARRANGE
    const expected = { technical: false, parts: false, reorder: true };
    // ACT
    const controls = mergeControls({ parts: { show: true, reorder: true } }, { '*': { show: false } });
    // ASSERT
    expect({
      technical: offers({ controls }, 'technical'),
      parts: offers({ controls }, 'parts'),
      reorder: controlOf({ controls }, 'parts').reorder,
    }).toEqual(expected);
  });
});
