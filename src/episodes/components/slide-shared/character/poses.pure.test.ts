import { describe, expect, it } from 'vitest';
import { MOODS } from './actor';
import { drawFigure, facetsOf, partIds, POSES, type FigureDrawing } from './poses.pure';
import type { Preset } from './preset';
import { aiAgent } from './shared-presets';

/*
 * One body plan, every preset in every pose: `drawFigure` maps a preset, a pose and a mood to the facets a Character
 * draws, the head anchor its emote sits at, and the pivots its motions turn on.
 */

const officer: Preset = {
  kind: 'human',
  build: 'slim',
  skin: 'light',
  hair: 'long',
  headwear: 'captain-cap',
  outfit: 'officer',
};
const flyer: Preset = {
  kind: 'human',
  build: 'average',
  skin: 'medium',
  hair: 'short',
  headwear: 'cap',
  outfit: 'pilot-jacket',
  prop: 'mug',
};
const clerk: Preset = {
  kind: 'human',
  build: 'broad',
  skin: 'deep',
  hair: 'bun',
  outfit: 'officer',
  prop: 'clipboard',
};
const bald: Preset = { kind: 'human', build: 'average', skin: 'light', hair: 'none', outfit: 'freelancer' };
const PRESETS = { officer, flyer, clerk, bald, aiAgent } as const;

const everyPoint = (drawing: FigureDrawing) => facetsOf(drawing).flatMap((facet) => facet.points);
const part = (drawing: FigureDrawing, id: string) => facetsOf(drawing).filter((facet) => facet.id === id);
const xs = (drawing: FigureDrawing, id: string) => part(drawing, id).flatMap((facet) => facet.points.map(([x]) => x));
const ys = (drawing: FigureDrawing, id: string) => part(drawing, id).flatMap((facet) => facet.points.map(([, y]) => y));

describe('success cases', () => {
  it('draws every preset in every pose with a face, a body and the head anchor on top of the figure', () => {
    // ARRANGE
    const cases = Object.entries(PRESETS).flatMap(([name, preset]) => POSES.map((pose) => ({ name, preset, pose })));
    const required = ['face', 'eye', 'mouth', 'torso', 'front-hand', 'back-hand'];
    // ACT
    const seen = cases.map(({ name, preset, pose }) => {
      const drawing = drawFigure(preset, pose);
      const top = Math.min(...everyPoint(drawing).map(([, y]) => y));
      return {
        name,
        pose,
        missing: required.filter((id) => !partIds(drawing).includes(id)),
        aboveTop: drawing.anchor.y <= top,
      };
    });
    // ASSERT
    expect(seen).toEqual(cases.map(({ name, pose }) => ({ name, pose, missing: [], aboveTop: true })));
  });

  it('seats the figure on a chair only in the sit pose', () => {
    // ARRANGE
    const expected = POSES.map((pose) => ({ pose, chair: pose === 'sit', seatedLegs: pose === 'sit' }));
    // ACT
    const seen = POSES.map((pose) => {
      const ids = partIds(drawFigure(officer, pose));
      return { pose, chair: ids.includes('chair'), seatedLegs: ids.includes('thigh') };
    });
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('points with the front hand ahead of the body at shoulder height, a finger out', () => {
    // ARRANGE
    const reachAhead = 26;
    const shoulderBand = { from: -66, to: -50 };
    // ACT
    const drawing = drawFigure(officer, 'point');
    const handX = Math.max(...xs(drawing, 'front-hand'));
    const handY = Math.min(...ys(drawing, 'front-hand'));
    const finger = part(drawing, 'finger').length;
    // ASSERT
    expect(handX).toBeGreaterThan(reachAhead);
    expect(handY).toBeGreaterThanOrEqual(shoulderBand.from);
    expect(handY).toBeLessThanOrEqual(shoulderBand.to);
    expect(finger).toBe(1);
  });

  it('puts both hands on the helm ahead of the torso when steering', () => {
    // ARRANGE
    const torsoFront = 16;
    // ACT
    const drawing = drawFigure(flyer, 'steer');
    const hands = { front: Math.min(...xs(drawing, 'front-hand')), back: Math.min(...xs(drawing, 'back-hand')) };
    // ASSERT
    expect(hands.front).toBeGreaterThan(torsoFront);
    expect(hands.back).toBeGreaterThan(torsoFront);
  });

  it('carries the prop at the side standing, holds it forward, and puts it away when the hands are busy', () => {
    // ARRANGE
    const torsoFront = 16;
    const expected = { stand: true, hold: true, point: false, steer: false, sit: false, holdAhead: true };
    // ACT
    const shows = Object.fromEntries(POSES.map((pose) => [pose, partIds(drawFigure(flyer, pose)).includes('prop')]));
    const holdAhead = Math.min(...xs(drawFigure(flyer, 'hold'), 'prop')) > torsoFront;
    // ASSERT
    expect({ ...shows, holdAhead }).toEqual(expected);
  });

  it('pins one ai tag on an AI agent and none on a human, in every pose', () => {
    // ARRANGE
    const expected = POSES.map((pose) => ({ pose, ai: 1, human: 0 }));
    // ACT
    const seen = POSES.map((pose) => ({
      pose,
      ai: part(drawFigure(aiAgent, pose), 'ai-tag').length,
      human: part(drawFigure(officer, pose), 'ai-tag').length,
    }));
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('lifts the head anchor over whatever the head wears, and with the seated body', () => {
    // ARRANGE
    const expected = { captainCap: -106, cap: -102, bare: -99.5, seatedCaptainCap: -104 };
    // ACT
    const seen = {
      captainCap: drawFigure(officer, 'stand').anchor.y,
      cap: drawFigure(flyer, 'stand').anchor.y,
      bare: drawFigure(bald, 'stand').anchor.y,
      seatedCaptainCap: drawFigure(officer, 'sit').anchor.y,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('gives every mood its own face', () => {
    // ARRANGE
    const faceOf = (mood?: (typeof MOODS)[number]) =>
      JSON.stringify(['brow', 'eye', 'mouth'].map((id) => part(drawFigure(officer, 'stand', mood), id)));
    // ACT
    const faces = new Set([faceOf(), ...MOODS.map(faceOf)]);
    // ASSERT
    expect(faces.size).toBe(MOODS.length + 1);
  });
});

describe('failure cases', () => {
  it('refuses a pose the body plan does not know', () => {
    // ARRANGE
    const pose = 'cartwheel' as (typeof POSES)[number];
    // ACT
    const draw = () => drawFigure(officer, pose);
    // ASSERT
    expect(draw).toThrow(/cartwheel/);
  });

  it('refuses a mood outside the closed set', () => {
    // ARRANGE
    const mood = 'grumpy' as (typeof MOODS)[number];
    // ACT
    const draw = () => drawFigure(officer, 'stand', mood);
    // ASSERT
    expect(draw).toThrow(/grumpy/);
  });
});

describe('edge cases', () => {
  it('holds out an open hand when the preset carries nothing', () => {
    // ARRANGE
    const expected = { prop: false, hand: true };
    // ACT
    const ids = partIds(drawFigure(officer, 'hold'));
    // ASSERT
    expect({ prop: ids.includes('prop'), hand: ids.includes('front-hand') }).toEqual(expected);
  });

  it('keeps long hair falling behind the shoulders under a cap', () => {
    // ARRANGE
    const expected = 'hair-back';
    // ACT
    const backOfHead = officer.headwear && drawFigure(officer, 'stand').groups['head-back'].map((facet) => facet.id);
    // ASSERT
    expect(backOfHead).toContain(expected);
  });

  it('blanks the eyes of the blank mood: no glint, nothing remembered', () => {
    // ARRANGE
    const expected = { calm: 1, blank: 0 };
    // ACT
    const seen = {
      calm: part(drawFigure(aiAgent, 'stand'), 'eye-glint').length,
      blank: part(drawFigure(aiAgent, 'stand', 'blank'), 'eye-glint').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
