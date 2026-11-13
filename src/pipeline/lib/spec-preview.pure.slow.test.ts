import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readPresets } from './spec-preview.pure.ts';

/*
 * The slow half of spec-preview.pure.test.ts: the checked-in Spec calibration, read from disk, still names the presets
 * the device toolbar offers. `skills/**` is a rerun trigger of the slow lane (ARCH-003-testing §4.4).
 */
const CALIBRATION = path.join(import.meta.dirname, '../../../skills/new-episode/references/spec-calibration.md');

describe('success cases', () => {
  it('reads the checked-in calibration as the five presets the toolbar offers', () => {
    // ARRANGE
    const expected = ['desktop 1920x800', 'laptop 1440x800', 'tablet 1024x800', 'mobile 390x800', 'shorts 1080x1920'];
    // ACT
    const presets = readPresets(readFileSync(CALIBRATION, 'utf8'));
    // ASSERT
    expect(presets.map(({ name, width, height }) => `${name} ${width}x${height}`)).toEqual(expected);
  });
});
