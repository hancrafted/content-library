import type { ReactNode } from 'react';

/*
 * The papers of Spec Option 14a's control room, drawn as the Option draws them (feedback 3, decision 46): a sheet with
 * its lit triangle and curled corner, ruled lines, caption-size words, and the wooden clipboard. Tones come from the
 * Slide token file through `data-tone` and `data-ink`.
 */

/** Scene text is drawn at caption size and scaled with the drawing, so it reads at presenting width. */
export const TEXT_SCALE = 1.15;

interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function Text({
  x,
  y,
  tone = 'ink',
  strong = false,
  children,
}: {
  readonly x: number;
  readonly y: number;
  readonly tone?: 'ink' | 'soft';
  readonly strong?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${TEXT_SCALE})`}>
      <text data-ink={tone} className={strong ? 'text-caption font-semibold' : 'text-caption'}>
        {children}
      </text>
    </g>
  );
}

export function Rules({
  x,
  ys,
  width,
}: {
  readonly x: number;
  readonly ys: readonly number[];
  readonly width: number;
}) {
  return ys.map((y) => <line key={y} x1={x} x2={x + width} y1={y} y2={y} strokeWidth={3} data-tone="rule" />);
}

/**
 * A sheet of paper as the Option draws it: an offset drop, the lit triangle from the upper left, the plain half, and
 * a curled lower-right corner.
 */
export function Sheet({ x, y, width, height }: Box) {
  const right = x + width;
  const bottom = y + height;
  return (
    <>
      <rect x={x + 6} y={y + 8} width={width} height={height} data-tone="drop" />
      <polygon points={`${x},${y} ${right},${y} ${x},${bottom}`} data-tone="paper-lit" />
      <polygon points={`${right},${y} ${right},${bottom} ${x},${bottom}`} data-tone="paper" />
      <polygon points={`${right - 28},${bottom} ${right},${bottom - 24} ${right},${bottom}`} data-tone="paper-shade" />
    </>
  );
}

/** A wooden clipboard lit from the upper left, its grey clip on top, and a sheet of paper clamped under it. */
export function Clipboard({ x, y, width, height }: Box) {
  const right = x + width;
  const bottom = y + height;
  const clip = x + width / 2;
  return (
    <>
      <rect x={x + 6} y={y + 8} width={width} height={height} data-tone="drop" />
      <polygon points={`${x},${y} ${right},${y} ${x},${bottom}`} data-tone="board-lit" />
      <polygon points={`${right},${y} ${right},${bottom} ${x},${bottom}`} data-tone="board" />
      <rect x={x} y={bottom - 7} width={width} height={7} data-tone="board-shade" />
      <polygon points={`${x + 14},${y + 24} ${right - 14},${y + 24} ${x + 14},${bottom - 16}`} data-tone="paper-lit" />
      <polygon
        points={`${right - 14},${y + 24} ${right - 14},${bottom - 16} ${x + 14},${bottom - 16}`}
        data-tone="paper"
      />
      <polygon
        points={`${clip - 36},${y - 10} ${clip + 36},${y - 10} ${clip + 32},${y + 30} ${clip - 32},${y + 30}`}
        data-tone="clip"
      />
      <polygon
        points={`${clip - 36},${y - 10} ${clip + 36},${y - 10} ${clip + 28},${y + 4} ${clip - 28},${y + 4}`}
        data-tone="clip-lit"
      />
      <rect x={clip - 9} y={y - 22} width={18} height={12} data-tone="clip" />
    </>
  );
}
