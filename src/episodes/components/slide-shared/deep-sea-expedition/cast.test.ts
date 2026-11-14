import { describe, expect, it } from 'vitest';
import { drawFigure, partIds, POSES } from '../character/poses.pure';
import { captain, pilot } from './cast';

/*
 * The expedition's crew as Character presets: the captain and the pilot take every pose of the shared body plan, keep
 * their look in each, and neither wears the `ai` tag, because on this Episode's Slides the robot is the AI.
 */

describe('success cases', () => {
  it('draws the captain and the pilot in every pose', () => {
    // ARRANGE
    const face = 'face';
    const drawings = POSES.flatMap((pose) =>
      Object.entries({ captain, pilot }).map(([who, preset]) => ({ who, pose, preset })),
    );
    // ACT
    const missingFace = drawings
      .filter(({ preset, pose }) => !partIds(drawFigure(preset, pose)).includes(face))
      .map(({ who, pose }) => `${who} ${pose}`);
    // ASSERT
    expect(missingFace).toEqual([]);
  });
});

describe('failure cases', () => {
  it('pins no ai tag on either crew member', () => {
    // ARRANGE
    const tag = 'ai-tag';
    // ACT
    const ids = [captain, pilot].flatMap((preset) => POSES.flatMap((pose) => partIds(drawFigure(preset, pose))));
    // ASSERT
    expect(ids).not.toContain(tag);
  });
});

describe('edge cases', () => {
  it("keeps the captain's long hair falling behind her shoulders under the cap", () => {
    // ARRANGE
    const expected = 'hair-back';
    // ACT
    const back = drawFigure(captain, 'point').groups['head-back'].map((facet) => facet.id);
    // ASSERT
    expect(back).toContain(expected);
  });
});
