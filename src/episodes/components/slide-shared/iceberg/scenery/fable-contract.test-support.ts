import type { CheerioAPI } from 'cheerio';

type Matrix = readonly [scaleX: number, scaleY: number, translateX: number, translateY: number];

const IDENTITY: Matrix = [1, 1, 0, 0];

function apply(matrix: Matrix, transform: string | undefined): Matrix {
  if (transform === undefined) return matrix;
  let [sx, sy, tx, ty] = matrix;
  for (const [, kind, args] of transform.matchAll(/(translate|scale)\(([^)]*)\)/g)) {
    const [a = 0, b] = args!
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    if (kind === 'translate') {
      tx += sx * a;
      ty += sy * (b ?? 0);
    } else {
      sx *= a;
      sy *= b ?? a;
    }
  }
  return [sx, sy, tx, ty];
}

function pairs(numbers: readonly number[]): (readonly [number, number])[] {
  return Array.from({ length: Math.floor(numbers.length / 2) }, (_, i) => [numbers[2 * i]!, numbers[2 * i + 1]!]);
}

type Attr = (name: string) => string | undefined;

const numbersOf = (text: string | undefined) => text?.match(/-?\d*\.?\d+(?:e-?\d+)?/g)?.map(Number) ?? [];

const POINTS: Readonly<Record<string, (attr: Attr) => (readonly [number, number])[]>> = {
  polygon: (attr) => pairs(numbersOf(attr('points'))),
  polyline: (attr) => pairs(numbersOf(attr('points'))),
  path: (attr) => pairs(numbersOf(attr('d'))),
  rect: (attr) => {
    const [x = 0, y = 0, w = 0, h = 0] = ['x', 'y', 'width', 'height'].map((name) => Number(attr(name) ?? 0));
    return [
      [x, y],
      [x + w, y + h],
    ];
  },
  circle: (attr) => {
    const [cx = 0, cy = 0, r = 0] = ['cx', 'cy', 'r'].map((name) => Number(attr(name) ?? 0));
    return [
      [cx - r, cy - r],
      [cx + r, cy + r],
    ];
  },
  line: (attr) => pairs(['x1', 'y1', 'x2', 'y2'].map((name) => Number(attr(name) ?? 0))),
};

const ownPoints = (tag: string, attr: Attr) => POINTS[tag]?.(attr) ?? [];

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export function drawnBox($: CheerioAPI): Box {
  const xs: number[] = [];
  const ys: number[] = [];
  const walk = (node: ReturnType<CheerioAPI>, matrix: Matrix) => {
    node.children().each((_, child) => {
      const element = $(child);
      const tag = (child as { tagName?: string }).tagName ?? '';
      const own = apply(matrix, element.attr('transform'));
      for (const [x, y] of ownPoints(tag, (name) => element.attr(name))) {
        xs.push(own[0] * x + own[2]);
        ys.push(own[1] * y + own[3]);
      }
      walk(element, own);
    });
  };
  walk($('svg').first(), IDENTITY);
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    left: round(Math.min(...xs)),
    top: round(Math.min(...ys)),
    right: round(Math.max(...xs)),
    bottom: round(Math.max(...ys)),
  };
}

export function globalsRead(css: string): readonly string[] {
  const own = new Set([...css.matchAll(/(--[a-z-]+)\s*:/g)].map(([, name]) => name));
  return [...new Set([...css.matchAll(/var\((--[a-z-]+)\)/g)].map(([, name]) => name!))].filter(
    (name) => !own.has(name),
  );
}

export function animatedProperties(css: string): readonly string[] {
  return [...css.matchAll(/@keyframes[^{]+\{([\s\S]*?)\n\}/g)].flatMap(([, body]) =>
    [...body!.matchAll(/([a-z-]+)\s*:/g)].map(([, property]) => property!),
  );
}

export function blursAndShadows(css: string): readonly string[] {
  const banned = /\b(filter|backdrop-filter|box-shadow|text-shadow|drop-shadow|blur)\b/g;
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(banned)].map(([word]) => word);
}
