export type Point = readonly [number, number];

export const CONSOLE_TONES = [
  'machine-glint',
  'machine-lit',
  'machine',
  'machine-shade',
  'machine-dark',
  'screen',
  'screen-glow',
  'house-lit',
  'house',
  'coffee',
] as const;
export type ConsoleTone = (typeof CONSOLE_TONES)[number];

export interface ConsoleFacet {
  readonly points: readonly Point[];
  readonly tone: ConsoleTone;
}

export interface ScreenRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ConsoleScreen {
  readonly frame: readonly ConsoleFacet[];
  readonly glass: ScreenRect;
  readonly trace: ConsoleFacet;
}

export interface ConsoleLayout {
  readonly desk: readonly ConsoleFacet[];
  readonly screens: readonly ConsoleScreen[];
  readonly mugs: readonly (readonly ConsoleFacet[])[];
  readonly seat: { readonly x: number; readonly y: number };
}

export interface ConsoleOptions {
  readonly width: number;
  readonly mugs?: number;
  readonly screens?: 1 | 2;
  readonly flip?: boolean;
}

export const MIN_CONSOLE_WIDTH = 60;
export const CONSOLE_DESK_HEIGHT = 70;
const SEAT_OFFSET = 60;
const MUG_STEP = 15;
const MUG_WIDTH = 9;
const SCREEN_TOP = -40;
const SCREEN_BOTTOM = -8;
const LAMPS = [0.66, 0.72, 0.78];

const tenth = (value: number) => Math.round(value * 10) / 10;

const facet = (tone: ConsoleTone, flat: readonly number[]): ConsoleFacet => ({
  tone,
  points: Array.from({ length: flat.length / 2 }, (_, i) => [tenth(flat[2 * i]), tenth(flat[2 * i + 1])] as const),
});

function desk(w: number): ConsoleFacet[] {
  const h = CONSOLE_DESK_HEIGHT;
  return [
    facet('machine-lit', [0, 0, w, -4, w, 6, 0, 8]),
    facet('machine-glint', [0, 0, w, -4, w - 4, -6, 4, -2]),
    facet('machine', [4, 8, w, 6, w - 6, h, 8, h]),
    facet('machine-lit', [4, 8, 22, 8, 16, h, 8, h]),
    facet('machine-shade', [w * 0.55, 7, w, 6, w - 6, h, w * 0.6, h]),
    facet('machine-shade', [24, 26, w * 0.5, 25, w * 0.5, 27, 24, 28]),
    facet('machine-dark', [8, h - 6, w - 6, h - 6, w - 6, h, 8, h]),
    facet('machine-shade', [w * 0.3, 2, w * 0.62, 0.5, w * 0.63, 4, w * 0.31, 5.5]),
    ...LAMPS.map((at) => facet('screen-glow', [w * at, 16, w * at + 3, 16, w * at + 3, 19, w * at, 19])),
  ];
}

function screen(x: number, width: number): ConsoleScreen {
  const [top, bottom, mid] = [SCREEN_TOP - 2, SCREEN_BOTTOM + 2, x + width / 2];
  return {
    frame: [
      facet('machine-dark', [x - 2, top, x + width + 2, top, x + width + 2, bottom, x - 2, bottom]),
      facet('machine-shade', [
        mid - width * 0.05,
        bottom,
        mid + width * 0.05,
        bottom,
        mid + width * 0.08,
        0,
        mid - width * 0.08,
        0,
      ]),
    ],
    glass: { x: tenth(x), y: SCREEN_TOP, width: tenth(width), height: SCREEN_BOTTOM - SCREEN_TOP },
    trace: facet('screen-glow', [
      ...[x + 4, -14, x + width * 0.4, -26, x + width * 0.6, -20, x + width - 4, -32],
      ...[x + width - 4, -30, x + width * 0.6, -18, x + width * 0.4, -23, x + 4, -12],
    ]),
  };
}

const mug = (x: number): ConsoleFacet[] => [
  facet('house', [x, -1, x + MUG_WIDTH, -1, x + 8, -12, x + 1, -12]),
  facet('house-lit', [x, -1, x + 4, -1, x + 4, -12, x + 1, -12]),
  facet('coffee', [x + 1, -12, x + 8, -12, x + 7, -13.5, x + 2, -13.5]),
];

export const maxMugs = (width: number) => Math.max(0, Math.floor((width * 0.92 - 6 - MUG_WIDTH) / MUG_STEP) + 1);

function assertConsole(width: number, mugs: number) {
  if (!Number.isFinite(width) || width < MIN_CONSOLE_WIDTH) {
    throw new Error(`A console needs a width of at least ${MIN_CONSOLE_WIDTH}, got ${width}.`);
  }
  if (!Number.isInteger(mugs) || mugs < 0) throw new Error(`Mugs are counted in whole mugs, got ${mugs}.`);
  if (mugs > maxMugs(width))
    throw new Error(`A console ${width} wide holds at most ${maxMugs(width)} mugs, got ${mugs}.`);
}

function mirrored(layout: ConsoleLayout, width: number): ConsoleLayout {
  const mx = (x: number) => tenth(width - x);
  const flip = (f: ConsoleFacet): ConsoleFacet => ({
    tone: f.tone,
    points: f.points.map(([x, y]) => [mx(x), y] as const),
  });
  return {
    desk: layout.desk.map(flip),
    screens: layout.screens.map((s) => ({
      frame: s.frame.map(flip),
      glass: { ...s.glass, x: mx(s.glass.x + s.glass.width) },
      trace: flip(s.trace),
    })),
    mugs: layout.mugs.map((m) => m.map(flip)),
    seat: { x: mx(layout.seat.x), y: layout.seat.y },
  };
}

export function consoleLayout({ width, mugs = 0, screens = 2, flip = false }: ConsoleOptions): ConsoleLayout {
  assertConsole(width, mugs);
  const layout: ConsoleLayout = {
    desk: desk(width),
    screens:
      screens === 1
        ? [screen(width * 0.1, width * 0.78)]
        : [screen(width * 0.1, width * 0.36), screen(width * 0.52, width * 0.36)],
    mugs: Array.from({ length: mugs }, (_, index) => mug(width * 0.08 + index * MUG_STEP)),
    seat: { x: -SEAT_OFFSET, y: CONSOLE_DESK_HEIGHT },
  };
  return flip ? mirrored(layout, width) : layout;
}

export const pointsAttr = (points: readonly Point[]) => points.map(([x, y]) => `${x},${y}`).join(' ');
