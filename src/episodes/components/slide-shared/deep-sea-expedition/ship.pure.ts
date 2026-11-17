import {
  DECK,
  type FacetRow,
  HULL_ROWS,
  MASTHEAD,
  PENNANT_ROWS,
  RAIL_ROWS,
  SHIP_TONES,
  type ShipTone,
  specDeckY,
  SUPERSTRUCTURE_ROWS,
  WINDOW,
} from './ship-facets.pure';

export { SHIP_TONES, type ShipTone };

export type Point = readonly [number, number];

export interface ShipFacet {
  readonly points: readonly Point[];
  readonly tone: ShipTone;
}

export interface ShipLayers {
  readonly hull: readonly ShipFacet[];
  readonly superstructure: readonly ShipFacet[];
  readonly rail: readonly ShipFacet[];
}

export interface ShipAnchor {
  readonly x: number;
  readonly y: number;
}

export interface ShipAnchors {
  readonly bridge: { readonly captain: ShipAnchor; readonly pilot: ShipAnchor };
  readonly deck: { readonly aft: ShipAnchor; readonly fore: ShipAnchor };
  readonly robot: ShipAnchor;
  readonly aFrameTip: ShipAnchor;
  readonly pennant: ShipAnchor;
  readonly window: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
}

const MIDSHIP = 140;

const mirror = (flip: boolean) => (x: number) => (flip ? MIDSHIP - x : x - MIDSHIP);

function place(rows: readonly FacetRow[], flip: boolean): ShipFacet[] {
  const x = mirror(flip);
  return rows.map(([tone, flat]) => ({
    tone,
    points: Array.from({ length: flat.length / 2 }, (_, index) => [x(flat[2 * index]), flat[2 * index + 1]] as const),
  }));
}

export function shipLayers(flip = false): ShipLayers {
  return {
    hull: place(HULL_ROWS, flip),
    superstructure: place(SUPERSTRUCTURE_ROWS, flip),
    rail: place(RAIL_ROWS, flip),
  };
}

export function deckY(x: number): number {
  const spec = x + MIDSHIP;
  if (spec < DECK.from[0] || spec > DECK.to[0]) {
    throw new Error(
      `There is no deck at x = ${x}; the deck runs from ${DECK.from[0] - MIDSHIP} to ${DECK.to[0] - MIDSHIP}.`,
    );
  }
  return specDeckY(spec);
}

export function shipAnchors(flip = false): ShipAnchors {
  const x = mirror(flip);
  const onDeck = (spec: number): ShipAnchor => ({ x: x(spec), y: specDeckY(spec) });
  return {
    bridge: { captain: { x: x(185), y: WINDOW.sill }, pilot: { x: x(214), y: WINDOW.sill } },
    deck: { aft: onDeck(90), fore: onDeck(272) },
    robot: onDeck(30),
    aFrameTip: { x: x(-25), y: -99 },
    pennant: { x: x(MASTHEAD.x), y: MASTHEAD.y },
    window: {
      x: Math.min(x(WINDOW.left), x(WINDOW.right)),
      y: WINDOW.top,
      width: WINDOW.right - WINDOW.left,
      height: WINDOW.sill - WINDOW.top,
    },
  };
}

export function pennantFacets(flip = false): readonly ShipFacet[] {
  return PENNANT_ROWS.map(([tone, flat]) => ({
    tone,
    points: Array.from(
      { length: flat.length / 2 },
      (_, index) => [(flip ? -1 : 1) * flat[2 * index]!, flat[2 * index + 1]!] as const,
    ),
  }));
}

export const pointsAttr = (points: readonly Point[]) => points.map(([x, y]) => `${x},${y}`).join(' ');
