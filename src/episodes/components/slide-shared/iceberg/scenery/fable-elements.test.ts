import { load } from 'cheerio';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Clouds } from './clouds';
import { drawnBox } from './fable-contract.test-support';
import { FishSchool } from './fish-school';
import { Iceberg } from './iceberg';
import { Jellies } from './jellies';
import { Lanternfish } from './lanternfish';
import { Siphonophore } from './siphonophore';
import { SunMoon } from './sun-moon';
import { Whale } from './whale';

const draw = (element: ReactElement) => load(renderToStaticMarkup(createElement('svg', null, element)));
const ONE = [{ x: 0, y: 0, s: 1 }];

const BOXES = [
  {
    name: 'Iceberg',
    element: createElement(Iceberg, { x: 0, waterline: 0 }),
    frozen: { left: -190, top: -168, right: 190, bottom: 200 },
  },
  {
    name: 'Clouds, shape 0',
    element: createElement(Clouds, { at: [{ x: 0, y: 0, scale: 1, shape: 0 }] }),
    frozen: { left: -130, top: -90, right: 130, bottom: 20 },
  },
  {
    name: 'Clouds, shape 1',
    element: createElement(Clouds, { at: [{ x: 0, y: 0, scale: 1, shape: 1 }] }),
    frozen: { left: -130, top: -90, right: 130, bottom: 20 },
  },
  {
    name: 'SunMoon',
    element: createElement(SunMoon, { x: 0, y: 0, r: 10 }),
    frozen: { left: -17, top: -17, right: 17, bottom: 17 },
  },
  {
    name: 'FishSchool',
    element: createElement(FishSchool, { x: 0, y: 0, at: ONE, scale: 1 }),
    frozen: { left: -18, top: -8, right: 14, bottom: 8 },
  },
  {
    name: 'Jellies',
    element: createElement(Jellies, { x: 0, y: 0, at: ONE }),
    frozen: { left: -12, top: -12, right: 12, bottom: 16 },
  },
  {
    name: 'Whale',
    element: createElement(Whale, { x: 0, y: 0, scale: 1 }),
    frozen: { left: -215, top: -60, right: 190, bottom: 85 },
  },
  {
    name: 'Lanternfish',
    element: createElement(Lanternfish, { x: 0, y: 0, at: ONE, scale: 1 }),
    frozen: { left: -15, top: -7, right: 13, bottom: 7 },
  },
  {
    name: 'Siphonophore',
    element: createElement(Siphonophore, { x: 0, y: 0 }),
    frozen: { left: -20, top: -12, right: 20, bottom: 220 },
  },
] as const;

const HOOKS = [
  {
    name: 'Iceberg',
    element: createElement(Iceberg, { x: 0, waterline: 0 }),
    root: '[data-iceberg="whole"]',
    member: '[data-iceberg-tip]',
    motions: [],
  },
  {
    name: 'Clouds',
    element: createElement(Clouds, {}),
    root: '[data-clouds]',
    member: '[data-cloud][data-cloud-layer]',
    motions: ['ambient'],
  },
  {
    name: 'SunMoon',
    element: createElement(SunMoon, { x: 0, y: 0 }),
    root: '[data-sun-moon]',
    member: '[data-sky-day] ~ [data-sky-night]',
    motions: [],
  },
  {
    name: 'FishSchool',
    element: createElement(FishSchool, { x: 0, y: 0 }),
    root: '[data-fish-school]',
    member: '[data-fish]',
    motions: ['ambient'],
  },
  {
    name: 'Jellies',
    element: createElement(Jellies, { x: 0, y: 0 }),
    root: '[data-jellies]',
    member: '[data-jelly]',
    motions: ['ambient'],
  },
  {
    name: 'Whale',
    element: createElement(Whale, { x: 0, y: 0 }),
    root: '[data-whale]',
    member: '[data-whale] > g',
    motions: ['ambient'],
  },
  {
    name: 'Lanternfish',
    element: createElement(Lanternfish, { x: 0, y: 0 }),
    root: '[data-lanternfish-school]',
    member: '[data-lanternfish]',
    motions: ['ambient'],
  },
  {
    name: 'Siphonophore',
    element: createElement(Siphonophore, { x: 0, y: 0 }),
    root: '[data-siphonophore]',
    member: '[data-siphonophore-bell]',
    motions: ['ambient'],
  },
] as const;

describe('success cases', () => {
  it.each(BOXES)('keeps the $name drawing inside its frozen box', ({ element, frozen }) => {
    // ARRANGE
    const $ = draw(element);
    // ACT
    const box = drawnBox($);
    // ASSERT
    expect(box.left).toBeGreaterThanOrEqual(frozen.left);
    expect(box.top).toBeGreaterThanOrEqual(frozen.top);
    expect(box.right).toBeLessThanOrEqual(frozen.right);
    expect(box.bottom).toBeLessThanOrEqual(frozen.bottom);
  });

  it.each(HOOKS)('marks the $name with its hooks and only its motion names', ({ element, root, member, motions }) => {
    // ARRANGE
    const $ = draw(element);
    // ACT
    const seen = {
      root: $(root).length,
      members: $(member).length > 0,
      motions: [
        ...new Set(
          $('[data-motion]')
            .toArray()
            .map((node) => $(node).attr('data-motion')),
        ),
      ],
    };
    // ASSERT
    expect(seen).toEqual({ root: 1, members: true, motions });
  });
});

describe('failure cases', () => {
  it('refuses a siphonophore without a bell', () => {
    // ARRANGE
    const expected = /whole count of one or more bells/;
    // ACT
    const drawColony = () => draw(createElement(Siphonophore, { x: 0, y: 0, segments: 0 }));
    // ASSERT
    expect(drawColony).toThrow(expected);
  });

  it('refuses a lanternfish school of a fractional count, as every scattered group does', () => {
    // ARRANGE
    const expected = /whole count/;
    // ACT
    const drawSchool = () => draw(createElement(Lanternfish, { x: 0, y: 0, count: 2.5 }));
    // ASSERT
    expect(drawSchool).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('lets each lanternfish dart on its own, every fish its own ambient part (decision 20)', () => {
    // ARRANGE
    const at = [
      { x: 0, y: 0, s: 1 },
      { x: 40, y: 10, s: 1 },
      { x: -40, y: -10, s: 1 },
    ];
    const expected = at.length;
    // ACT
    const $ = draw(createElement(Lanternfish, { x: 0, y: 0, at }));
    const moving = $('[data-lanternfish] > [data-motion="ambient"]').length;
    // ASSERT
    expect(moving).toBe(expected);
  });

  it('picks a cloud layer from its size when the Scene names none: large near, middling mid, small far', () => {
    // ARRANGE
    const expected = ['near', 'mid', 'far'];
    const at = [0.9, 0.6, 0.4].map((scale, index) => ({ x: index * 300, y: 0, scale, shape: 0 as const }));
    // ACT
    const $ = draw(createElement(Clouds, { at }));
    const layers = $('[data-cloud]')
      .toArray()
      .map((cloud) => $(cloud).attr('data-cloud-layer'));
    // ASSERT
    expect(layers).toEqual(expected);
  });
});
