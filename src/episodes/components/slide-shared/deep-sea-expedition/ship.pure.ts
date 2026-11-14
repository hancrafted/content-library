/**
 * The research ship's geometry: its low-poly facets in paint layers and the anchors where a Scene places people and the
 * robot. The facets (`ship-facets.pure.ts`) develop the approved Spec's `parts.py` `ship`, here placed about a new
 * origin: (0, 0) is the waterline amidships, so the ship rocks and flips about that point.
 */
import {
  DECK,
  type FacetRow,
  HULL_ROWS,
  RAIL_ROWS,
  SHIP_TONES,
  type ShipTone,
  specDeckY,
  SUPERSTRUCTURE_ROWS,
  WINDOW,
} from './ship-facets.pure';

export { SHIP_TONES, type ShipTone };

/** A point in the ship's own SVG user units. */
export type Point = readonly [number, number];

/** One flat facet: a polygon in one tone. */
export interface ShipFacet {
  readonly points: readonly Point[];
  readonly tone: ShipTone;
}

/**
 * The ship in three paint layers, so a Scene's figures slot between them: `hull` is drawn before the bridge crew,
 * `superstructure` over them (the window frame hides all but what shows through the glass) and before the deck crew,
 * `rail` over the deck crew.
 */
export interface ShipLayers {
  readonly hull: readonly ShipFacet[];
  readonly superstructure: readonly ShipFacet[];
  readonly rail: readonly ShipFacet[];
}

/** Where a figure stands: the point under its feet, in the ship's units. */
export interface ShipAnchor {
  readonly x: number;
  readonly y: number;
}

export interface ShipAnchors {
  /** Behind the bridge windows, on the sill: the captain's and the pilot's places. */
  readonly bridge: { readonly captain: ShipAnchor; readonly pilot: ShipAnchor };
  /** On deck: aft between the winch and the funnel, fore on the bow. */
  readonly deck: { readonly aft: ShipAnchor; readonly fore: ShipAnchor };
  /** The robot's cradle on the stern deck, between the A-frame's feet. */
  readonly robot: ShipAnchor;
  /** The A-frame's tip, where the robot's cable hangs from. */
  readonly aFrameTip: ShipAnchor;
  /** The bridge window's clear opening: a figure placed behind it shows only inside this box. */
  readonly window: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
}

// The Spec drew the ship from its stern at x = 0; amidships on the waterline sits 140 units forward of it.
const MIDSHIP = 140;

const mirror = (flip: boolean) => (x: number) => (flip ? MIDSHIP - x : x - MIDSHIP);

function place(rows: readonly FacetRow[], flip: boolean): ShipFacet[] {
  const x = mirror(flip);
  return rows.map(([tone, flat]) => ({
    tone,
    points: Array.from({ length: flat.length / 2 }, (_, index) => [x(flat[2 * index]), flat[2 * index + 1]] as const),
  }));
}

/** The ship's facets in paint layers, bow to the right, or to the left when `flip`. */
export function shipLayers(flip = false): ShipLayers {
  return {
    hull: place(HULL_ROWS, flip),
    superstructure: place(SUPERSTRUCTURE_ROWS, flip),
    rail: place(RAIL_ROWS, flip),
  };
}

/**
 * The deck's top edge at `x` (the ship's units, unflipped): where a figure on deck stands. Throws off the deck, where
 * a figure would float over the water.
 */
export function deckY(x: number): number {
  const spec = x + MIDSHIP;
  if (spec < DECK.from[0] || spec > DECK.to[0]) {
    throw new Error(
      `There is no deck at x = ${x}; the deck runs from ${DECK.from[0] - MIDSHIP} to ${DECK.to[0] - MIDSHIP}.`,
    );
  }
  return specDeckY(spec);
}

/** Where a Scene places the crew, the robot and its cable on this ship, mirrored when `flip`. */
export function shipAnchors(flip = false): ShipAnchors {
  const x = mirror(flip);
  const onDeck = (spec: number): ShipAnchor => ({ x: x(spec), y: specDeckY(spec) });
  return {
    bridge: { captain: { x: x(185), y: WINDOW.sill }, pilot: { x: x(214), y: WINDOW.sill } },
    deck: { aft: onDeck(90), fore: onDeck(272) },
    robot: onDeck(30),
    aFrameTip: { x: x(-25), y: -99 },
    window: {
      x: Math.min(x(WINDOW.left), x(WINDOW.right)),
      y: WINDOW.top,
      width: WINDOW.right - WINDOW.left,
      height: WINDOW.sill - WINDOW.top,
    },
  };
}

/** A facet's points as an SVG `points` attribute. */
export const pointsAttr = (points: readonly Point[]) => points.map(([x, y]) => `${x},${y}`).join(' ');
