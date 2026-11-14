/**
 * The research ship's facet table, in the approved Spec's own units (`parts.py` `ship`: stern at x = 0, waterline at
 * y = 0, bow to the right), developed to a cleaner, slightly higher-poly ship: portholes, a life ring, window mullions,
 * a radar, the funnel's shaded side, a rail. Each row is a tone and a flat `x, y, x, y, …` list; `ship.pure.ts` turns
 * the rows into placed facets.
 */

export const SHIP_TONES = [
  'hull-lit',
  'hull',
  'hull-shade',
  'stripe',
  'house-lit',
  'house',
  'house-shade',
  'glass',
  'glass-glint',
  'machine-glint',
  'machine-lit',
  'machine',
  'machine-shade',
] as const;
export type ShipTone = (typeof SHIP_TONES)[number];

/** One facet row: its tone and its points as a flat `x, y, x, y, …` list. */
export type FacetRow = readonly [ShipTone, readonly number[]];

/** The deck's top edge, stern to bow. */
export const DECK = { from: [-4, -29], to: [290, -37] } as const;
/** The bridge window's clear opening. */
export const WINDOW = { left: 140, right: 230, top: -77, sill: -59 } as const;

const PORTHOLE_XS = [150, 172, 194, 216, 238];
const RAIL_HEIGHT = 10;
const RAIL_POST_STEP = 16;

/** The deck's top edge at `x`. */
export const specDeckY = (x: number) =>
  DECK.from[1] + ((DECK.to[1] - DECK.from[1]) * (x - DECK.from[0])) / (DECK.to[0] - DECK.from[0]);

const porthole = (x: number): FacetRow => {
  const y = specDeckY(x) + 9;
  return ['glass', [x, y, x + 4, y - 1.5, x + 8, y, x + 8, y + 3, x + 4, y + 4.5, x, y + 3]];
};

/** A rail along the deck from `x0` to `x1`: a top bar and posts. */
function rail(x0: number, x1: number): FacetRow[] {
  const top = (x: number) => specDeckY(x) - RAIL_HEIGHT;
  const bar: FacetRow = ['house-lit', [x0, top(x0), x1, top(x1), x1, top(x1) + 1.6, x0, top(x0) + 1.6]];
  const posts = Array.from({ length: Math.floor((x1 - x0) / RAIL_POST_STEP) + 1 }, (_, index): FacetRow => {
    const x = x0 + index * RAIL_POST_STEP;
    return ['house-shade', [x, top(x), x + 1.4, top(x), x + 1.4, specDeckY(x), x, specDeckY(x)]];
  });
  return [bar, ...posts];
}

const { left: WL, right: WR, top: WT, sill: WS } = WINDOW;

/** Drawn before the bridge crew: hull, deck, deck house and the glass. */
export const HULL_ROWS: readonly FacetRow[] = [
  ['hull-lit', [-4, -26, 290, -34, 318, -40, 300, -22, 14, -14]],
  ['hull', [14, -14, 300, -22, 282, 8, 40, 10]],
  ['hull-lit', [14, -14, 150, -18, 130, -6, 26, -4]],
  ['hull-shade', [-4, -26, 14, -14, 40, 10, 8, 4]],
  ['hull-shade', [282, 8, 300, -22, 318, -40, 306, -4]],
  ...PORTHOLE_XS.map(porthole),
  // the boot-top stripe at the waterline, the deck edge
  ['stripe', [12, -4, 292, -8, 288, 0, 20, 2]],
  ['house-lit', [-4, -26, 290, -34, 290, -37, -4, -29]],
  // the deck house (the control room) amidships: front, roof edge, aft side
  ['house', [120, -32, 238, -35, 238, -84, 130, -82]],
  ['house-lit', [130, -82, 238, -84, 232, -94, 138, -92]],
  ['house-shade', [238, -35, 262, -36, 254, -82, 238, -84]],
  ['house-lit', [238, -84, 254, -82, 246, -92, 232, -94]],
  // the life ring on the house's side, its hole in the wall's tone
  ['stripe', [246, -64, 250, -66, 254, -64, 255, -59, 254, -54, 250, -52, 246, -54, 245, -59]],
  ['house-shade', [248, -61, 250, -62, 252, -61, 252, -57, 250, -56, 248, -57]],
  // the bridge glass, behind the crew
  ['glass', [WL, WT, WR, WT - 1, WR, WS - 1, WL, WS]],
];

/** Drawn over the bridge crew and before the deck crew: window frame, upper bridge, mast, funnel, A-frame, winch. */
export const SUPERSTRUCTURE_ROWS: readonly FacetRow[] = [
  // the window frame, so the bridge crew show only through the glass
  ['house', [125, -59, 238, -61, 238, -35, 120, -32]],
  ['house-lit', [120, -32, 150, -33, 148, -59, 125, -59]],
  ['house', [130, -82, 238, -84, 238, -78, 129, -76]],
  ['house', [129, -77, WL, WT, WL, WS, 125, -59]],
  ['house', [WR, WT - 1, 238, -78, 238, -61, WR, WS - 1]],
  ['house-shade', [WL - 2, WS, WR + 2, WS - 1, WR + 2, WS + 2, WL - 2, WS + 3]],
  // mullions between the three panes, and the glint over the crew
  ['house', [169, -77, 172, -77, 172, -59, 169, -59]],
  ['house', [199, -78, 202, -78, 202, -60, 199, -60]],
  ['glass-glint', [WL, WT, 158, WT, 148, WS, WL, WS]],
  // the upper bridge and its windows, the mast, its yard and a radar on top
  ['house-lit', [160, -94, 222, -96, 220, -112, 166, -110]],
  ['house-shade', [222, -96, 232, -97, 228, -112, 220, -112]],
  ['glass', [172, -104, 214, -105, 214, -101, 172, -100]],
  ['hull', [190, -110, 196, -110, 195, -160, 192, -160]],
  ['hull-lit', [178, -146, 210, -146, 208, -142, 180, -142]],
  ['house-lit', [184, -160, 204, -160, 202, -165, 186, -165]],
  // the funnel, lit flank and shaded side under a stripe
  ['hull-lit', [100, -32, 118, -33, 122, -70, 104, -68]],
  ['hull', [112, -33, 118, -33, 122, -70, 116, -69]],
  ['stripe', [104, -68, 122, -70, 122, -76, 104, -74]],
  // the A-frame at the stern, leaning out over the water, and its head block
  ['machine-shade', [10, -28, 18, -28, -22, -104, -28, -102]],
  ['machine', [40, -30, 48, -30, -16, -104, -22, -104]],
  ['machine-lit', [40, -30, 43, -30, -19, -104, -22, -104]],
  ['machine-lit', [-36, -108, -14, -108, -16, -99, -34, -99]],
  ['machine-glint', [-36, -108, -14, -108, -18, -111, -32, -111]],
  // the winch: drum front, lit top and shaded end
  ['machine', [54, -30, 82, -31, 80, -48, 56, -46]],
  ['machine-lit', [56, -46, 80, -48, 74, -54, 60, -52]],
  ['machine-shade', [74, -31, 82, -31, 80, -48, 74, -47]],
];

/** Drawn over the deck crew: the rail aft of the funnel and on the foredeck. */
export const RAIL_ROWS: readonly FacetRow[] = [...rail(-2, 98), ...rail(262, 288)];
