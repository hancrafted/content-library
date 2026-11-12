import { describe, expect, it } from 'vitest';
import { idealSettings } from './factory-dials.pure.ts';
import { beltSegments, layoutFactory, MIN_RUN } from './factory-layout.pure.ts';
import { createFactory, DEFAULT_SEED } from './factory-model.pure.ts';
import { builtinBundle } from './use-case-data.ts';

const layoutOf = (id: string) => {
  const B = builtinBundle(id);
  const m = createFactory(B, idealSettings(B.data.company ?? 'service'), DEFAULT_SEED).topology;
  return { m, layout: layoutFactory(m) };
};

describe('success cases', () => {
  it.each(['tire', 'gate', 'teams'])(
    'runs every belt of %s at least MIN_RUN straight out of and into a station',
    (id) => {
      // ARRANGE
      const { layout } = layoutOf(id);
      // ACT
      const short = Object.values(layout.belts).flatMap((b) => {
        const s = beltSegments(b.corners);
        return [s[0], s[s.length - 1]].filter((l) => (l as number) < MIN_RUN - 0.5).map(() => b.key);
      });
      // ASSERT
      expect(short).toEqual([]);
    },
  );

  it.each(['tire', 'gate', 'teams'])('draws no diagonal run on any belt of %s', (id) => {
    // ARRANGE
    const { layout } = layoutOf(id);
    // ACT
    const diagonal = Object.values(layout.belts).filter((b) =>
      b.corners.some((p, i) => i > 0 && p[0] !== b.corners[i - 1]![0] && p[1] !== b.corners[i - 1]![1]),
    );
    // ASSERT
    expect(diagonal.map((b) => b.key)).toEqual([]);
  });

  it('leaves the engineer on its right port and enters quality assurance on its left, on the line y = 580', () => {
    // ARRANGE
    const { layout } = layoutOf('tire');
    const straight = [
      [900, 580],
      [1070, 580],
    ];
    // ACT
    const belt = layout.belts['eng-qa']!;
    // ASSERT
    expect(belt.corners).toEqual(straight);
  });
});

describe('failure cases', () => {
  it('never runs a belt between stations on different rows diagonally: it turns at the route’s elbow x', () => {
    // ARRANGE
    const { layout } = layoutOf('tire');
    const elbowed = [
      [510, 370],
      [560, 370],
      [560, 160],
      [680, 160],
    ];
    // ACT
    const belt = layout.belts['pm-ba']!;
    // ASSERT
    expect(belt.corners).toEqual(elbowed);
  });
});

describe('edge cases', () => {
  it('starts a station belt at the document in work, inside the card, 74 units before its port', () => {
    // ARRANGE
    const { layout } = layoutOf('tire');
    const inner = 74,
      work = [826, 580];
    // ACT
    const belt = layout.belts['eng-qa']!;
    // ASSERT
    expect(belt.inner).toBe(inner);
    expect(belt.vis.pts[0]).toEqual(work);
  });

  it('keeps a corner on another belt square and rounds the free one, on the Customer’s belt to Sales', () => {
    // ARRANGE
    const { layout } = layoutOf('tire');
    const squareThenRound = 'M172 370 L215 370 L215 174 Q215 160 229 160 L290 160';
    // ACT
    const d = layout.belts['customer-sales']!.path.d;
    // ASSERT
    expect(d).toBe(squareThenRound);
  });

  it('places a junction plate where one belt’s corner lies on another belt', () => {
    // ARRANGE
    const { layout } = layoutOf('tire');
    const plate = '215,370';
    // ACT
    const plates = layout.plates.map((p) => p.join(','));
    // ASSERT
    expect(plates).toContain(plate);
  });
});
