import { describe, expect, it } from 'vitest';
import { connectorInto, fanGeometry } from './diagram-layout.pure';
import { stage as baseStage, job } from './workflow-fixture.pure';
import type { Stage } from './workflow.types';

const stage = (id: string, fanOut?: number): Stage => ({ ...baseStage(id, [job({ id, fanOut })]) });

describe('success cases', () => {
  it('draws the fan of three exactly as the venue pipeline drew it', () => {
    // ARRANGE
    const expected = {
      height: 160,
      ys: [20, 80, 140],
      out: 'M0 80 C 12 80, 10 20, 20 20 M0 80h20 M0 80 C 12 80, 10 140, 20 140',
      heads: 'M18 17 23 20l-5 3z M18 77 23 80l-5 3z M18 137 23 140l-5 3z',
    };
    // ACT
    const fan = fanGeometry('out', 3);
    // ASSERT
    expect({ height: fan.height, ys: fan.ys, out: fan.lines, heads: fan.heads }).toEqual(expected);
  });

  it('draws the fan-in of three with one head at the join', () => {
    // ARRANGE
    const expected = {
      lines: 'M0 20 C 12 20, 10 80, 20 80 M0 80h20 M0 140 C 12 140, 10 80, 20 80',
      heads: 'M18 77 23 80l-5 3z',
    };
    // ACT
    const fan = fanGeometry('in', 3);
    // ASSERT
    expect({ lines: fan.lines, heads: fan.heads }).toEqual(expected);
  });

  it.each([2, 4])('draws one branch per chat for a fan of %i, centred on the join', (n) => {
    // ARRANGE
    // ACT
    const fan = fanGeometry('out', n);
    // ASSERT
    expect(fan.ys).toHaveLength(n);
    expect(fan.heads.split('z').filter(Boolean)).toHaveLength(n);
    expect((fan.ys[0] ?? 0) + (fan.ys[n - 1] ?? 0)).toBe(fan.height);
    expect(fan.lines.split('M').filter(Boolean)).toHaveLength(n);
  });

  it('has no straight branch for an even fan, since none lies on the join', () => {
    // ARRANGE
    const marker = 'h20';
    const pair = 2;
    // ACT
    const fan = fanGeometry('out', pair);
    // ASSERT
    expect(fan.lines).not.toContain(marker);
  });

  it('fans out into a stage of N chats and back in after it', () => {
    // ARRANGE
    const wide = 4;
    const stages = [stage('a'), stage('b', wide), stage('c')];
    // ACT
    const kinds = stages.map((each, i) => connectorInto(stages[i - 1], each));
    // ASSERT
    expect(kinds).toEqual([{ kind: 'straight' }, { kind: 'out', branches: wide }, { kind: 'in', branches: wide }]);
  });
});

describe('failure cases', () => {
  it('draws no fan for a single chat: the connector stays straight', () => {
    // ARRANGE
    const stages = [stage('a'), stage('b', 1)];
    // ACT
    const kind = connectorInto(stages[0], stages[1] as Stage);
    // ASSERT
    expect(kind).toEqual({ kind: 'straight' });
  });
});

describe('edge cases', () => {
  it('opens the first stage with a straight connector when it has no predecessor', () => {
    // ARRANGE
    const first = stage('a');
    // ACT
    const kind = connectorInto(undefined, first);
    // ASSERT
    expect(kind).toEqual({ kind: 'straight' });
  });

  it('grows the box past the minimum for a wide fan and keeps the last branch inside it', () => {
    // ARRANGE
    const wide = 6;
    // ACT
    const fan = fanGeometry('in', wide);
    // ASSERT
    expect(fan.ys.at(-1)).toBeLessThan(fan.height);
  });
});
