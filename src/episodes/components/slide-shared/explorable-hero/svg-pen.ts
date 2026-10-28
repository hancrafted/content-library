import type { Pen } from './drift-paint';

/** One drawn shape, as the SVG still prints it. */
export interface Shape {
  readonly d: string;
  readonly alpha: number;
  readonly width: number;
  readonly filled: boolean;
  /** A CSS `filter` value, or undefined for none. */
  readonly blur: string | undefined;
}

const round = (value: number) => Math.round(value * 100) / 100;

function roundedRect(box: { x: number; y: number; w: number; h: number; radius: number }): string {
  const { x, y, w, h } = box;
  const r = round(Math.min(box.radius, w / 2, h / 2));
  const [x0, y0, x1, y1] = [x, y, x + w, y + h].map(round);
  return `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
}

type RoundRectArgs = Parameters<Pen['roundRect']>;

/** A `Pen` that records its strokes and fills as SVG shapes, so the canvas drawing can be printed as a static image. */
export function svgPen(): { pen: Pen; shapes: Shape[] } {
  const shapes: Shape[] = [];
  const path = { d: '' };
  const commit = (filled: boolean) => {
    const { globalAlpha: alpha, lineWidth: width, filter } = pen;
    shapes.push({ d: path.d, alpha, width, filled, blur: filter === 'none' ? undefined : filter });
  };
  const pen: Pen = {
    globalAlpha: 1,
    lineWidth: 1,
    filter: 'none',
    beginPath: () => {
      path.d = '';
    },
    roundRect: (...[x, y, w, h, radius]: RoundRectArgs) => {
      path.d += roundedRect({ x, y, w, h, radius });
    },
    moveTo: (x, y) => {
      path.d += `M${round(x)} ${round(y)}`;
    },
    lineTo: (x, y) => {
      path.d += `L${round(x)} ${round(y)}`;
    },
    stroke: () => commit(false),
    fill: () => commit(true),
  };
  return { pen, shapes };
}
