import { describe, expect, it } from 'vitest';
import { beamPoints, robotHead, robotLook } from './robot.pure';

/*
 * The diving robot's logic: which parts its lamp and motion light and move, where its beam points and where its emote
 * sits. Worked values come from the Spec's `parts.py` `beam()`: a cone from the lamp at (32, 30), 0.5 rad wide.
 */

describe('success cases', () => {
  it('lights the lamp and draws the beam at rest, nothing moving', () => {
    // ARRANGE
    const expected = { lampLit: true, beam: true };
    // ACT
    const actual = robotLook({});
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('moves the beam for beam-on and scan, the whole robot for dive and surface', () => {
    // ARRANGE
    const expected = [
      ['beam-on', undefined],
      ['scan', undefined],
      [undefined, 'dive'],
      [undefined, 'surface'],
    ];
    // ACT
    const actual = (['beam-on', 'scan', 'dive', 'surface'] as const).map((motion) => {
      const { beamMotion, bodyMotion } = robotLook({ motion });
      return [beamMotion, bodyMotion];
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('aims the beam ahead and down as parts.py does at down 0.45, from the lamp', () => {
    // ARRANGE
    const expected = '0,-2 117.6,23.8 91.8,77.3 0,3';
    // ACT
    const actual = beamPoints('ahead').cone;
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('places the emote above the camera dome', () => {
    // ARRANGE
    const expected = { x: 19, y: 2 };
    // ACT
    const actual = robotHead(false);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a beam motion with the lamp switched off, whose end state would contradict the rest state', () => {
    // ARRANGE
    const expected = /lamp/;
    // ACT
    const look = () => robotLook({ motion: 'scan', lamp: false });
    // ASSERT
    expect(look).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws no beam and a dark lens with the lamp off, so a dive still plays', () => {
    // ARRANGE
    const expected = { lampLit: false, beam: false, bodyMotion: 'dive' };
    // ACT
    const actual = robotLook({ motion: 'dive', lamp: false });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('mirrors the emote anchor when the robot faces left, so the bubble stays over the dome', () => {
    // ARRANGE
    const expected = { x: -19, y: 2 };
    // ACT
    const actual = robotHead(true);
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('aims the beam steeply at the seabed for the down aim', () => {
    // ARRANGE
    const expected = '0,-2 91.8,77.3 43.5,111.8 0,3';
    // ACT
    const actual = beamPoints('down').cone;
    // ASSERT
    expect(actual).toBe(expected);
  });
});
