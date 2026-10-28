import { describe, expect, it } from 'vitest';
import { BRANCH_PITCH, connectorInto, fanGeometry } from './diagram-layout.pure';
import { stage as baseStage, job } from './workflow-fixture.pure';
import type { Stage } from './workflow.types';

const stage = (id: string): Stage => baseStage(id, [job({ id })]);

describe('success cases', () => {
  it('fans out of the title line of the stage before into three branch cards standing under the stage name', () => {
    // ARRANGE
    const expected = {
      height: 226,
      ys: [86, 146, 206],
      out: 'M0 38 C 12 38, 10 86, 20 86 M0 38 C 12 38, 10 146, 20 146 M0 38 C 12 38, 10 206, 20 206',
      heads: 'M18 83 23 86l-5 3z M18 143 23 146l-5 3z M18 203 23 206l-5 3z',
    };
    // ACT
    const fan = fanGeometry('out', 3);
    // ASSERT
    expect({ height: fan.height, ys: fan.ys, out: fan.lines, heads: fan.heads }).toEqual(expected);
  });

  it('fans three branch cards back in to the title line of the stage after, with one head there', () => {
    // ARRANGE
    const expected = {
      lines: 'M0 86 C 12 86, 10 38, 20 38 M0 146 C 12 146, 10 38, 20 38 M0 206 C 12 206, 10 38, 20 38',
      heads: 'M18 35 23 38l-5 3z',
    };
    // ACT
    const fan = fanGeometry('in', 3);
    // ASSERT
    expect({ lines: fan.lines, heads: fan.heads }).toEqual(expected);
  });

  it.each([2, 4])('draws one branch per chat for a fan of %i, joined on the title line', (n) => {
    // ARRANGE
    const titleLine = 'M0 38 C';
    // ACT
    const fan = fanGeometry('out', n);
    // ASSERT
    expect(fan.ys).toHaveLength(n);
    expect(fan.heads.split('z').filter(Boolean)).toHaveLength(n);
    expect(fan.lines.split(titleLine)).toHaveLength(n + 1);
  });

  it('fans out into a stage of N chats and back in after it', () => {
    // ARRANGE
    const wide = 4;
    const stages = [stage('a'), stage('b'), stage('c')];
    const rounds = { b: wide };
    // ACT
    const kinds = stages.map((each, i) => connectorInto(stages[i - 1], each, rounds));
    // ASSERT
    expect(kinds).toEqual([{ kind: 'straight' }, { kind: 'out', branches: wide }, { kind: 'in', branches: wide }]);
  });
});

describe('failure cases', () => {
  it('draws no fan for a single chat: the connector stays straight', () => {
    // ARRANGE
    const stages = [stage('a'), stage('b')];
    // ACT
    const kind = connectorInto(stages[0], stages[1] as Stage, { b: 1 });
    // ASSERT
    expect(kind).toEqual({ kind: 'straight' });
  });
});

describe('edge cases', () => {
  it('stands each branch card one fan pitch apart, so every card meets its branch', () => {
    // ARRANGE
    const cards = 4;
    // ACT
    const fan = fanGeometry('out', cards);
    const gaps = fan.ys.slice(1).map((y, i) => y - (fan.ys[i] ?? 0));
    // ASSERT
    expect(gaps).toEqual([BRANCH_PITCH, BRANCH_PITCH, BRANCH_PITCH]);
  });

  it('keeps a stage a single card when the run holds no rounds for it', () => {
    // ARRANGE
    const stages = [stage('a'), stage('b')];
    // ACT
    const kind = connectorInto(stages[0], stages[1] as Stage, {});
    // ASSERT
    expect(kind).toEqual({ kind: 'straight' });
  });

  it('opens the first stage with a straight connector when it has no predecessor', () => {
    // ARRANGE
    const first = stage('a');
    // ACT
    const kind = connectorInto(undefined, first, {});
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
