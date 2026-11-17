import { describe, expect, it } from 'vitest';
import {
  depthBands,
  sectionTitleBottom,
  sectionTitleLift,
  SURFACE_WATERLINE,
  TITLE_LIFE_AT,
  TITLE_LOOP_AT,
  visibleSpan,
  wholeWater,
  zoneSceneParts,
} from './zone-scene.pure';

describe('success cases', () => {
  it('draws each zone with its own scenery and its one ambient loop, from the Surface down', () => {
    // ARRANGE
    const expected = [
      { sky: true, rays: false, seabed: false, iceberg: 'whole', life: 'wind', water: 'sunlit', titleLife: [] },
      { sky: false, rays: true, seabed: false, iceberg: 'keel', life: 'fish', water: 'sunlit', titleLife: [] },
      { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'jellies', water: 'twilight', titleLife: [] },
      { sky: false, rays: false, seabed: false, iceberg: 'none', life: 'whale', water: 'midnight', titleLife: [] },
      { sky: false, rays: false, seabed: true, iceberg: 'none', life: 'bubbles', water: 'abyss', titleLife: [] },
    ];
    // ACT
    const parts = (['surface', 'sunlit', 'twilight', 'midnight', 'abyss'] as const).map((zone) =>
      zoneSceneParts({ zone }),
    );
    // ASSERT
    expect(parts).toEqual(expected);
  });

  it('floats the Surface in the sky above the ship, then stacks the four zones from the waterline to the seabed', () => {
    // ARRANGE
    const expected = [
      { zone: 'surface', top: 190, bottom: 290 },
      { zone: 'sunlit', top: 460, bottom: 560 },
      { zone: 'twilight', top: 560, bottom: 660 },
      { zone: 'midnight', top: 660, bottom: 760 },
      { zone: 'abyss', top: 760, bottom: 880 },
    ];
    // ACT
    const bands = depthBands();
    // ASSERT
    expect(bands).toEqual(expected);
  });

  it("waves the whole depth's zone boundaries from the same generator, the waterline straight", () => {
    // ARRANGE
    const expected = { waterline: 1, wavy: ['twilight', 'midnight', 'abyss'], seams: [true, true, true] };
    // ACT
    const bands = wholeWater();
    const heights = (zone: string) => new Set(bands.find((band) => band.zone === zone)?.top.map(([, y]) => y)).size;
    const seen = {
      waterline: heights('sunlit'),
      wavy: bands.filter(({ zone }) => zone !== 'sunlit' && heights(zone) > 1).map(({ zone }) => zone),
      seams: bands.slice(1).map(({ top }, index) => top === bands[index]?.bottom),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('adds a lanternfish school and a siphonophore to a Twilight Section title, beside its drifting jellies', () => {
    // ARRANGE
    const expected = { life: 'jellies', titleLife: ['lanternfish', 'siphonophore'] };
    // ACT
    const { life, titleLife } = zoneSceneParts({ zone: 'twilight', sectionTitle: true });
    // ASSERT
    expect({ life, titleLife }).toEqual(expected);
  });

  it('keeps the whole siphonophore in view on a phone, where the Scene shows only its middle (decision 38)', () => {
    // ARRANGE
    const phones = [
      { width: 375, height: 700 },
      { width: 375, height: 812 },
      { width: 375, height: 900 },
    ];
    const { x, halfWidth, scale } = TITLE_LIFE_AT.siphonophore;
    const colony = { left: x - halfWidth * scale, right: x + halfWidth * scale };
    // ACT
    const outside = phones.filter((box) => {
      const view = visibleSpan(box);
      return colony.left < view.left || colony.right > view.right;
    });
    // ASSERT
    expect(outside).toEqual([]);
  });

  it('keeps the Abyss title bubbles in view on a phone and clear of the table of contents on a desktop', () => {
    // ARRANGE
    const boxes = [
      { width: 375, height: 700 },
      { width: 375, height: 812 },
      { width: 375, height: 900 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ];
    const tocClear = 1200 / 5;
    const { x, halfWidth, scale } = TITLE_LOOP_AT.bubbles;
    const column = { left: x - halfWidth * scale, right: x + halfWidth * scale };
    // ACT
    const hidden = boxes.filter((box) => {
      const view = visibleSpan(box);
      return column.left < Math.max(view.left, tocClear) || column.right > view.right;
    });
    // ASSERT
    expect(hidden).toEqual([]);
  });
});

describe('failure cases', () => {
  it("refuses figures that reach higher above the waterline than the Scene's top", () => {
    // ARRANGE
    const expected = /reach 450 above the waterline, past the Scene's top at 400/;
    // ACT
    const lift = () => sectionTitleLift({ width: 1440, height: 786 }, 450);
    // ASSERT
    expect(lift).toThrow(expected);
  });
});

describe('edge cases', () => {
  it("lifts a Surface title's drawing just enough that what reaches above the waterline clears the title", () => {
    // ARRANGE
    const reach = 150;
    const boxes = [
      { width: 1440, height: 786 },
      { width: 1920, height: 900 },
      { width: 1280, height: 600 },
      { width: 1024, height: 700 },
      { width: 768, height: 640 },
      { width: 375, height: 760 },
      { width: 375, height: 600 },
    ];
    // ACT
    const covered = boxes.filter((box) => {
      const lift = sectionTitleLift(box, reach);
      const scale = Math.max(box.width / 1200, (box.height - lift) / 800);
      return lift + (SURFACE_WATERLINE - reach) * scale < sectionTitleBottom(box);
    });
    // ASSERT
    expect(covered).toEqual([]);
  });

  it("leaves a Surface title's drawing at the top when its box is tall enough for the title above", () => {
    // ARRANGE
    const tall = { width: 1440, height: 1200 };
    // ACT
    const lift = sectionTitleLift(tall, 150);
    // ASSERT
    expect(lift).toBe(0);
  });
  it('shows the whole Scene across on a box wider than the Scene, and its middle on a narrow one', () => {
    // ARRANGE
    const expected = [
      { left: 0, right: 1200 },
      { left: 400, right: 800 },
    ];
    // ACT
    const spans = [
      { width: 1500, height: 800 },
      { width: 400, height: 800 },
    ].map((box) => visibleSpan(box));
    // ASSERT
    expect(spans).toEqual(expected);
  });

  it('keeps every other zone the same on its Section title: the title life is the Twilight zone only', () => {
    // ARRANGE
    const zones = ['surface', 'sunlit', 'midnight', 'abyss'] as const;
    // ACT
    const titleLife = zones.flatMap((zone) => zoneSceneParts({ zone, sectionTitle: true }).titleLife);
    // ASSERT
    expect(titleLife).toEqual([]);
  });

  it('lets a Slide show another part of the iceberg, and keeps the zone loop with it', () => {
    // ARRANGE
    const expected = {
      sky: false,
      rays: true,
      seabed: false,
      iceberg: 'tip',
      life: 'fish',
      water: 'sunlit',
      titleLife: [],
    };
    // ACT
    const parts = zoneSceneParts({ zone: 'sunlit', iceberg: 'tip' });
    // ASSERT
    expect(parts).toEqual(expected);
  });
});
